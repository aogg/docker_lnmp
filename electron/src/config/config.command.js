// 命令相关的配置
const os = require('os');
const nodeStorage = require('../core/nodeStorage');
const emptySymbol = Symbol();

let currentOs = os.type(),
    isWin = /windows/i.test(currentOs),
    isMac = /Darwin/i.test(currentOs),
    isLinux = /Linux/i.test(currentOs),
    currentShellName = '',
    proxyConfig = {};


function processExec() {
    const processExec = require('../core/process.exec'); // 循环调用
    return new processExec('config.commnad');
}



let commandConfig = {
    windows:{
        whereCmd(command){
            return `where ${command}`;
        },

        execShellNameSync(command){ // 同步执行前缀
            if (this.shellName === 'powershell') {
                return `powershell -Command "${command.replace(/([^`])"/g, "$1\"\"\"\"")}"`;
            }

            return  command;
        },
        get execShellName (){ // child_process.exec
            if (this.shellName === 'powershell') { // 在powershell中不输出目录
                return 'powershell -NoLogo -Command -';
            }

            return  'cmd';
        },
        checkPowerShell(){
            return proxyConfig.whereCommand('powershell', 'powerShellBool', str => !!str, false, false) !== 'powershell';
        },
        get shellName(){ // 当前执行的命令的环境
            if (!currentShellName){

                currentShellName = this.checkPowerShell() ? 'powershell' : 'cmd';
            }

            return currentShellName;
        },
        get headArr(){
            let data = [];
            if (currentShellName === 'cmd') {
                data = [
                    '@echo off \n',
                ];
            }else if (currentShellName === 'powershell'){
                data = [

                ];
            }

            return data;
        },
        clearRow: '[2K',  // 在cmd中用于清除当前行并输入后面内容，即命令行的进度条。未知正确字符串，目前只能以乱码形式显示在ide中
        endRow: '[1B',


        // 命令是否执行结束处理
        /**
         * @return {string}
         */
        ShellEOFCommand(eof){
            return `echo "${eof}" \n`;
        },

        enter: [ // 留意替换顺序
            "\n", // todo 换行
            "\r\n", // todo \r\n\r\n命令结束
        ],
        /**
         * 不是回车符
         *
         * @param str
         * @returns {boolean}
         */
        ifNotEnter(str){
            return !(str.length === 2 && this.enter.includes(str))
        },

        /**
         * 换行切换数组
         *
         * @param str
         * @returns {Array}
         */
        lineArr(str){
            return str.replace("\r\n\r\n", "").split(/\r?\n/) || [];
        },

        getNotEnter(str){
            return str.trim()
        }
    },

    replaceEnter(str, replace, num = null){
        num = (num === null ? this.enter.length : num) - 1;

        return this.enter[num] ? this.replaceEnter(str.replace(this.enter[num], replace), replace, num) : str;
    },

    openShell(command){
        let environment = proxyConfig.shellName;

        if (environment === 'cmd'){
            return `start cmd /k ${command}`;
        }else if(environment === 'git-bash'){
            // todo 待改为git的bash，记得有部分功能有用
            return `start ${dockerConfig.bashCommandPath} -s -c '${command} ;read'`;
        }else if(environment === 'powershell'){
            command = `echo '${command.replace(/(^`)'/g, "$1''")}';${command}`; // 输出执行命令
            command = command.replace(/([^`])"/g, "$1\"\"\"\"\"\""); // 转双引号需要三对双引号
            // return `start powershell -NoExit ${docker_compose} logs ${logsArgs} ${getContainerName()}`; // cmd下打开powershell
            return `start powershell -ArgumentList "-NoExit ${command}"`; // powershell打开powershell
        }
    },
    linux:{
        whereCmd(command){
            return `which ${command}`;
        },
    },
    mac:{
        whereCmd(command){
            return `which ${command}`;
        },
    },

    /**
     * 查看command命令所在路径
     *
     * @param {string} command 命令名
     * @param {string} cacheKey 缓存
     * @param {callback} cacheFunc 缓存结果特殊处理
     * @param {bool} async 是否异步保存缓存
     * @param {bool} checkPowerShell 是否特殊处理执行绝对路径命令
     * @returns {string}
     */
    whereCommand(command, cacheKey = '', cacheFunc = null, async = false, checkPowerShell = true){ // where npm
        let str, check;
        if (cacheKey && (str = nodeStorage.getItem(cacheKey, emptySymbol)) !== emptySymbol){
            return str;
        }
        function disFunc(str) { // 处理返回的str
            if (str){
                str = proxyConfig.lineArr(str).shift();
                if (checkPowerShell && (check = proxyConfig.checkPowerShell) && check()) { // 是powershell，需&"C:\Program Files\Docker\Docker\Resources\bin\docker-compose.exe"
                    str = '&"' + str + '"';
                }else{ // mac和linux也可以用引号包裹路径
                    str = '"' + str + '"';
                }
            }

            if (cacheKey){ // 不考虑str
                str = typeof cacheFunc === 'function' ? cacheFunc(str) : str;
                nodeStorage.setItem(cacheKey, str);
            }

            return str;
        }

        if (async) { // 异步
            setTimeout(function () {
                processExec().exec(proxyConfig.whereCmd(command), {encoding : 'utf8'}, function (error, stdout, stderr) {
                    if (error){
                        console.error(`whereCmd ${command} error: ${stderr}`);
                        return;
                    }

                    return disFunc(stdout);
                });
            }, 0);

            return async === true ? command : async;
        }

        return disFunc(processExec().execSync(proxyConfig.whereCmd(command), {encoding : 'utf8'}));
    },
};



proxyConfig = new Proxy(commandConfig, {
    get:(target, key) => {
        if (!Reflect.has(target, key)){ // 顶层不存在即读取系统配置层
            if (isWin) { // todo 可能要改为win
                target = target['windows'];
            } else if(isLinux){
                target = target['linux'];
            } else if (isMac){
                target = target['mac'];
            }
        }

        return Reflect.has(target, key) ? target[key] : false;
    }
});


module.exports = proxyConfig;
