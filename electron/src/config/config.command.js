// 命令相关的配置
const os = require('os');
const nodeStorage = require('../core/nodeStorage');

let currentOs = os.type(),
    currentShellName = '',
    proxyConfig = {};



let commandConfig = {
    windows:{
        get execShellName (){ // child_process.exec
            if (this.shellName === 'powershell') { // 在powershell中不输出目录
                return 'powershell -NoLogo -Command -';
            }

            return  'cmd';
        },
        get shellName(){ // 当前执行的命令的环境
            if (!currentShellName){
                const processExec = require('../core/process.exec'); // 循环调用
                let bool = nodeStorage.getItem('powerShellBool', null);
                if (bool === null) {
                    bool = (new processExec()).execSync('where powershell', {encoding : 'utf8'}); // 判断是否存在powershell
                    nodeStorage.setItem('powerShellBool', !!bool);
                }

                currentShellName = bool ? 'powershell' : 'cmd';
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
            command = `echo '${command}';${command}`; // 输出执行命令
            command = command.replace(/([^`])"/g, "$1`\"");
            // return `start powershell -NoExit ${docker_compose} logs ${logsArgs} ${getContainerName()}`; // cmd下打开powershell
            return `start powershell -ArgumentList "-NoExit ${command}"`; // powershell打开powershell
        }
    }
};



proxyConfig = new Proxy(commandConfig, {
    get:(target, key) => {
        if (!Reflect.has(target, key)){ // 顶层不存在即读取系统配置层
            if (/windows/i.test(currentOs)) { // todo 可能要改为win
                target = target['windows'];
            }else if(/Linux/i.test(currentOs)){
                target = target['linux'];
            }
        }

        return Reflect.has(target, key) ? target[key] : false;
    }
});


module.exports = proxyConfig;
