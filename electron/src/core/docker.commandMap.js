const dockerConfig = require('../config/config.docker');
const configCommand = require('../config/config.command');
const util = require('util');


let execOption = dockerConfig.execOption,
    tempData = {}, // 临时数据
    commandArg = {}, // 用于当前模块，保存传递过来的arg
    commandMapBefore = Symbol('commandMapBefore'), // 连接，返回命令前
    commandMapAfter = Symbol('commandMapAfter'), // 连接,返回命令后
    commandMapHook = {[commandMapBefore]:[], [commandMapAfter]:[]};


let docker = `${dockerConfig.dockerExe}`,
    // todo -f 可改COMPOSE_FILE环境变量
    docker_compose = `${dockerConfig.dockerComposeExe} -f "${dockerConfig.composeYml}"`, // 必须双引号
    docker_machine = `${dockerConfig.dockerMachineExe}`;


let commandMap =  {
    'docker-getDir' : 'dir /B',
    'getDir' : function (arg) {
        return 'dir ' + arg;
    },
    docker: {
        [commandMapBefore]: docker + ' ',
        // [commandMapAfter](){ // 指定容器
        //     return getContainerName();
        // },
        //
        v:`-v`,
        // up: 'up', // 启动
        // restart: 'restart', // 重启
        // stop: 'stop', // 停止
        // setup: 'ps', // 设置
        // monitor:{ // 监听
        //     'noHook': true,
        //     'command': function(){
        //         return logFunc(true, true);
        //     },
        // },
        // log: { // 日志
        //     'noHook': true,
        //     'command': function(){
        //         return logFunc();
        //     },
        // },
        // exec: { // 进入
        //     noHookAfter: true, // 后缀不要
        //     noHookBefore: true, // 前缀不要
        //     openShell: true, // 打开命令行来执行
        //     filterMsg:function(){
        //         // 过滤输出
        //     },
        //     command: function () {
        //         return `exec ${getContainerName()} bash`;
        //     },
        // },
        'info-labels':{
            command: 'info -f "{{json .Labels}}"',
        },
        'version':'version',
        'events': {
            // todo 有bug，第一次up时，gui无法正确监听（通过rm后up复现）
            command: function (command){
                let str = '';
                if (command.args.length){
                    command.args.map(function (val){
                        str += ` -f id=${val} `;
                    });
                }

                command.type && (str += ` -f "type=${command.type}" `);

                return `events ${str} --format "{{json .}}"`;
            },
            setTailBool: true, // 持续输出
            restart: true,
        }

    },
    'docker-compose':{
        [commandMapBefore]: docker_compose + ' ',
        [commandMapAfter](){ // 指定容器
            return ' ' + getContainerName();
        },
        'version': `-v`,
        up: 'up -d', // 启动
        restart: 'restart', // 重启
        build: { // 重新构建
            openShell: true,
            command: `build --force-rm`,
        },
        stop: 'stop', // 停止

        setup: { // 设置
            noHook: true,
            command: function(){
                return `${docker_compose} ps`
            },
        }, // todo 目前调试用
        monitor: { // 监听
            'noHook': true,
            'command': function(){
                return logFunc(true, true);
            },
        },
        log: { // 日志
            'noHook': true,
            'command': function(){
                return logFunc();
            },
        },
        exec: { // 进入
            noHookAfter: true, // 后缀不要
            openShell: true, // 打开命令行来执行
            command: function () {
                return `exec ${getContainerName()} bash`;
            },
        },

        // 显示所有ps的数据
        'config-services' : {
            noHook : true,
            command: function(){
                // (new (require('./process.exec'))(dockerConfig.dockerProcessName)).setTailBool(false);
                return `${docker_compose} config --services`;
            }
        },
        'ps-status': {
            filterMsg: function (str, dockerNode) { // todo 待优化逻辑
                return filterMsgCommon(
                    'ps-status-' + getContainerName(dockerNode.getCommandData()),
                    str,
                    function () {
                        let id = configCommand.replaceEnter(str, '');
                        dockerNode.cmdExec(`${docker} ps -a --format "{{.Status}}" -f id=${id}`);

                        return {
                            action: 'id',
                            name: getContainerName(dockerNode.getCommandData()),
                            id,
                        };
                    },
                    function () {
                        let val = str.split(/\s/, 1).shift();

                        return val ? {
                                action: 'statue',
                                name: getContainerName(dockerNode.getCommandData()),
                                statue: val,
                                title: str,
                            }: null;
                    }
                );
            },
            command: 'ps -q',
        },

        'ps-events':{

            filterMsg:function (str, dockerNode) {
                let key = 'ps-events';
                return filterMsgCommon(
                    key,
                    str,
                    function () {
                        dockerNode.execDocker('async', 'docker/events', {args: configCommand.lineArr(str), type: 'container'});

                        return null;
                    }
                );
            },
            command: 'ps -q',
            noHookAfter: true,
        },

        'events':{
            noHookAfter: true,
            command: 'events --json',
            setTailBool: true, // 持续输出
            restart: true, // 失败重启，docker-compose events --json会经常死掉 todo 处理此问题
        },
    },
    'docker-machine':{
        [commandMapBefore]: docker_machine + ' ',
        'version': '-v',
        'inspect-json': 'inspect -f "{{json .}}"',
    },





    // 'docker-getDir' : 'dir /B',
    // 'b':function(){},
    // 'a': {
    //     command:'dir', // 数组内必须
    //
    //     noHook:true, // 不使用commandMapBefore和commandMapAfter
    //     returnData:function (data) { // 处理返回的结果
    //
    //     },
    //     execOption:{
    //         shell: 'powershell.exe'
    //     },
    // },

};



function filterMsgCommon(key, str, ...func){
    str = str ? str.trim() : '';
    if (str && configCommand.ifNotEnter(str)){
        tempData[key] = (tempData[key] || 0) + 1;
        if (tempData[key] === 1) { // 第一个命令返回
            if (!func[1]) Reflect.deleteProperty(tempData, key);

            return (func[0])();
        }else if(tempData[key] === 2){
            Reflect.deleteProperty(tempData, key); // 手动删除

            return (func[1])();
        }else{
            --tempData[key];
        }
    }

    return null;
}




/**
 * 获取容器的名称
 *
 * @returns {string}
 */
function getContainerName(command = {}){
    let arg = command.arg || commandArg.arg || {};
    return arg.arg || '';
}


/**
 * 获取无头部的docker命令
 *
 * @param str
 * @returns {Array.<string>}
 */
function getDockerCommandNoHeader(str) {
    let strArr = str.split(configCommand.enter),
        tempBool = false; // 不是-----后才返回
    return strArr.filter(function (value) {
        if (value !== configCommand.enter){
            if (!tempBool) {
                if (/-+/.test(value)) tempBool = true;
                return;
            }

            return value;
        }
    });
}


/**
 * 查看docker compose日志
 *
 * @param follow 是否监听
 * @param tail   是否只截取部分
 * @returns {string}
 */
function logFunc(follow = false, tail = false){
    let logsArgs = '';
    if (follow) logsArgs += ' -f ';
    if (tail) logsArgs += ' --tail 20 ';

    return configCommand.openShell(`${docker_compose} logs ${logsArgs} ${getContainerName()}`);
}



/**
 * 根据渲染层命令找到commandMap返回的命令
 *
 * @param name
 * @param arg
 * @returns {object}
 */
function getCommand(name, arg = {}) { // 转换配置文件中的命令，返回可执行的命令
    if (typeof name !== 'string') {
        return '';
    }

    commandArg = util.isObject(arg) ? arg : {arg: arg};

    let nameData = getChildren(name, commandMap),
        nameDataType = typeof nameData;
    // console.log(nameData);

    if (nameDataType === 'string') {
        commandArg.command = nameData;
    } else if (nameDataType === 'function') {
        commandArg.command = nameData(commandArg);
    } else if (nameDataType === 'object') { // 对象
        commandArg = Object.assign(nameData, commandArg);
        commandArg = getCommandObject(commandArg);
    } else {
        commandArg = {};
    }

    hookData = disCommandMapHook(commandArg['noHook'] ? null : false); // 可指定不使用前后缀

    if (hookData) { // 拼接before和after
        if (hookData[commandMapBefore] && !commandArg['noHookBefore'])
            commandArg.command = hookData[commandMapBefore] + commandArg.command;
        if (hookData[commandMapAfter] && !commandArg['noHookAfter'])
            commandArg.command = commandArg.command + hookData[commandMapAfter];
    }

    if (commandArg['openShell']){ // 打开命令行来执行
        commandArg.command = configCommand.openShell(commandArg.command);
    }

    // 还原
    arg = commandArg;
    commandArg = {};

    return arg;
}

/**
 * 处理getCommand的object类型
 * 
 * @param arg
 * @returns {*}
 */
function getCommandObject(arg){
    if (!arg.hasOwnProperty('command')) { // 不存在command
        return {};
    }

    if (arg.command && typeof arg.command === 'function'){
        arg.command = arg.command(arg);
    }
    
    return arg;
}


function getChildren(name, map) { // 用于对象内多层查找，通过/
    let shift,
        nameType = typeof name;

    if (!name || (nameType === 'object' && name.length < 1)) { // 到底，最终返回
        return typeof map === 'object' ? Object.assign({}, map) : map; // 防止引用赋值
    } else if ((nameType === 'string' && name.includes('/')) || Array.isArray(name)) { // 带有/的多层命令
        name = nameType === 'string' ? name.split('/') : name;
        shift = name.shift();
        if (map.hasOwnProperty(shift)) {
            disCommandMapHook(map);
            return getChildren(name, map[shift]);
        } else {
            return false;
        }
    } else if (name && map.hasOwnProperty(name)) { // 1层命令
        disCommandMapHook(map);
        return map[name];
    }

    return false;
}


/**
 * 用于保存和输出before和after的字符串
 *
 * @param map
 * @returns {bool|object}
 */
function disCommandMapHook(map = false) {
    if (typeof map === 'object' && map !== null) { // 保存，null也是object
        map[commandMapBefore] && commandMapHook[commandMapBefore].push(map[commandMapBefore]);// 保存before

        map[commandMapAfter] && commandMapHook[commandMapAfter].push(map[commandMapAfter]);// 保存after

        return true;
    }else if(map === false){ // 获取，并生成before和after的字符串
        // console.log(commandMapHook);
        let strMap = {[commandMapBefore]: '', [commandMapAfter]: ''}; // 防止undefined
        for (let hook of [commandMapBefore, commandMapAfter]){
            for (let data of commandMapHook[hook]){
                let type = typeof data;
                if (type === 'string') { // 字符串模式
                    strMap[hook] += data.toString();
                }else if(type === 'function'){
                    strMap[hook] += data().toString();
                }
            }
        }

        commandMapHook[commandMapBefore] = []; // 重置
        commandMapHook[commandMapAfter] = []; // 重置

        return strMap;
    }else if (map === null){
        commandMapHook[commandMapBefore] = []; // 重置
        commandMapHook[commandMapAfter] = []; // 重置

        return false;
    }
}



module.exports = function (name, arg) {
    let command = getCommand(name, arg),
        option = {execOption};
    if (command.hasOwnProperty('cwd')){ // 处理cwd
        option.execOption.cwd = command.cwd;
    }

    command = Object.assign(command || {}, option);

    return command;
};



