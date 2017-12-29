const {exec : cp_exec, execSync: cp_execSync, spawn:cp_spawn} = require('child_process');
const dockerConfig = require('../config/config.docker');
const configCommand = require('../config/config.command');
const commonFunc = require('./commonFunc');

let cmd = commonFunc.mapData(),
    allData = commonFunc.mapData(), // 各种需要的数据数据
    dataInitSymbol = Symbol('dataInit'), // data的init
    shellNew = Symbol('shell'), // 一条命令没执行完，则必须创建新进程执行命令
    shellNewNum = 1, // 生成不同的shellName
    shellEOF = 'nodeShellEOF-----------------------nodeShellEOF';

class pExec{

    constructor(shellName = '') {
        this.shellName = shellName ? shellName : 'defaultShellName';
        this.processData = {}; // 存储callback，应该放在this中
        this.processEndBool = false; // 执行一条命令后就关闭进程
        this.newLog = false; // 这是一条新命令，不需重复输出log
        this.msg = { // 命令的输出
            outMsg:'',
            errMsg:'',
            allMsg:'',
        };
        this['callback'] = {};
        this.tailBool = false;
        this.restart = false;
        this.args = [];
    }


    shellInit(){
        let shellName = this.shellName;
        if (!cmd.getData(shellName)){
            config.processExecCommandLog && console.log(`open process : ${shellName}`);
            this[dataInitSymbol]();
            // 系统环境变量没有了
            cmd.setData(shellName, this.exec(configCommand.execShellName, {
                cwd: dockerConfig.execCwd,
                env: dockerConfig.execEnv,
            }));

            // virtualBox下的docker-compose必须是chcp 936

            // cp_execSync('start powershell \n');
            // cmd.stdin.write('start cmd \n');
        }
    }


    shell(){
        // console.log(Object.keys(cmd));
        let shellName = this.shellName;
        this.shellInit();
        
        // process callback
        this['callback'] = {
            stdout : (msg) => {
                // console.log('stdout_data');
                // console.log(['stdout_data', msg, this]);
                this.setMsg(msg, 'out');
                if (this.ifCommandEnd()) { // 已结束
                    msg = this.msgCommandEnd('out');
                    this.msgCommandEndFunc();
                } else if (!this.getTailBool()) { // 需一次输出，等待满足上面条件
                    return;
                }

                this.getCallBack('stdout_data')(msg);
            },
            stderr: (msg) => {
                // console.log('stderr_data');
                this.setMsg(msg, 'err');
                if (this.ifCommandEnd()) { // 已结束
                    msg = this.msgCommandEnd('err');
                    this.msgCommandEndFunc();
                } else if (!this.getTailBool()) { // 需一次输出，等待满足上面条件
                    return;
                }

                this.getCallBack('stderr_data')(msg);
            },
            close: (code) => { // 未验证
                // console.log('on_close');
                this.setTailBool();

                this.getCallBack('on_close')(code);

                if (this.restart) this.shellExec(...this.args); // 报错重启
            },
        };


        this.onListener();


        return cmd.getData(shellName);


        // old
        // 每次新进程，必须每次都覆盖this

    }


    [shellNew](...args){
        // let shellName = this.shellName + '_' + shellNewNum;
        let shellName = {[this.shellName]: Symbol(Math.random())};
        // let shellName = `${this.shellName}-${Math.random()}`;

        ++shellNewNum;
        allData.setData(shellName, Object.assign({}, allData.getData(this.shellName)));

        let tempPE = new pExec(shellName);
        tempPE.processData = Object.assign({}, this.processData);
        tempPE.newLog = true;
        tempPE.restart = this.restart;
        tempPE.setTailBool(this.tailBool);
        tempPE.setProcessEnd(true);
        tempPE.setIsCommandEnd(true);
        tempPE.shellExec(...args);

        return true;
    }


    /**
     * 执行命令，尽量唯一入口
     *
     * @param args
     * @returns {*}
     */
    shellExec(...args){
        this.args = args;
        if (!args[0]){
            return false;
        }

        if (!(/\n\s*$/.test(args[0]))) { // 处理回车
            args[0] = args[0] + '\n';
        }


        // console.log([shellName, args]);
        config.processExecCommandLog && !this.newLog && console.log(`exec command: '${args[0].toString().trim()}'`);

        if (!this.getIsCommandEnd()){ // 一条命令还没有执行结束
            return this[shellNew](...args);
        }
        this.setIsCommandEnd(false);


        // 执行命令
        let shellStdIn = this.shell().stdin,
            data = shellStdIn.write(...args);
        // 多执行一条命令，用于是否执行结束
        shellStdIn.write(configCommand.ShellEOFCommand(shellEOF));

        return data;
    }

    /**
     * 处理消息结束时的消息
     *
     * @param msg
     * @param type
     * @returns {void|*|XML|string}
     */
    msgCommandEnd(type){
        let msg = this.getMsg(type).replace(new RegExp(`\s*${shellEOF}\s*`), ''); // 只去除默认的shellEOF

        // 获取消息并删除
        this.setMsg('', '', true); // 清空
        this.setIsCommandEnd(true);

        return msg;
    }

    /**
     * 一条命令结束时执行
     */
    msgCommandEndFunc() {
        this.removeListener();

        if (this.restart) { // 重新执行
            this.shellExec(...this.args);
        }else{
            this.setTailBool();
            this.ProcessEnd();
        }

        return this;
    }


    setTailBool(bool = false){
        return this.tailBool = bool;
    }


    /**
     * 为true则下条命令会持续输出，等待其结束
     *
     * @returns {bool}
     */
    getTailBool(){
        return this.tailBool
    }



    exec(...args){
        if (false && this){ // 貌似webStorm对于类的方法如果不是调用当前类的则会有警告信息
            return;
        }

        return cp_exec(...args);
    }

    execSync(...args){ // 同步
        if (false && this){ // 貌似webStorm对于类的方法如果不是调用当前类的则会有警告信息
            return;
        }

        return cp_execSync(...args);
    }


    /**
     * 命令是否输出完毕，true为完成
     *
     * @returns {boolean|*}
     */
    ifCommandEnd(){
        return this.getMsg('all').includes(shellEOF);
    }


    /**
     * 数据初始化
     */
    [dataInitSymbol](){
        let shellName = this.shellName;
        let dataDefault = {
            [dataInitSymbol]:true, // 已初始化，临时变量
            // 'processData' : {}, // callback数据
            'isCommandEnd': true, // 是否执行完一条命令
            // processEndBool:false, // 是否执行完命令后退出
            // msg: {
            //     outMsg:'',
            //     errMsg:'',
            //     allMsg:'',
            // },
            tailBool : false, // 是否设置下条命令为持续输出，false为一次输出
        };

        let shellData = allData.getData(shellName);
        if (!shellData || !shellData[dataInitSymbol]) {
            allData.setData(shellName, dataDefault);
        }else{
            allData.setData(shellName, Object.assign(dataDefault, shellData));
        }

    }


    /**
     * 设置child_process的回调
     *
     * @param eventName
     * @param callback
     */
    setCallBack(eventName, callback){
        this['processData'][eventName] = callback;
    }


    /**
     * 获取事件函数的引用，返回匿名函数
     *
     * @param eventName
     * @returns {callback}
     */
    getCallBack(eventName){
        let defaultFunc = function () {};

        // if (commonFunc.isRePropertyObject(this, 'processData', eventName)) {
        if (this['processData'][eventName]) {
            let func = this['processData'][eventName];
            return typeof func === 'function' ? func : defaultFunc;
        }

        return defaultFunc;
    }



    setProcessEnd(bool){
        this['processEndBool'] = bool;
    }

    /**
     * 如果设置结束当前开启的进程则结束
     *
     * @constructor
     */
    ProcessEnd(){
        if (this['processEndBool']) {
            config.processExecCommandLog && console.log(`delete ${this.shellName}`); // todo 未知delete在open process之前
            this.shell().stdin.end();
            cmd.deleteData(this.shellName);
            allData.deleteData(this.shellName);
        }
    }


    /**
     * 设置是否执行完一条命令
     *
     * @param bool
     * @returns {pExec}
     */
    setIsCommandEnd(bool){
        this[dataInitSymbol]();
        allData.getData(this.shellName)['isCommandEnd'] = bool;

        return this;
    }


    getIsCommandEnd(){
        this[dataInitSymbol]();

        return allData.getData(this.shellName)['isCommandEnd'];
    }


    setMsg(msg, type = 'out', clear = false){
        this[dataInitSymbol]();

        if (clear) { // 清空
            this['msg'] = {};
            return;
        }

        if (!this['msg'][type + 'Msg']){
            this['msg'][type + 'Msg'] = '';
        }

        if (!this['msg']['allMsg']) {
            this['msg']['allMsg'] = '';
        }

        this['msg'][type + 'Msg'] += msg;
        this['msg']['allMsg'] += msg;
    }


    getMsg(type = 'out'){
        return this['msg'][type + 'Msg'] || '';
    }


    /**
     * 每次命令执行完都要remove，防止多次on  与  刷新箭头函数的this
     */
    removeListener(){
        // @see https://nodejs.org/dist/latest-v7.x/docs/api/events.html#events_emitter_removelistener_eventname_listener
        cmd.getData(this.shellName).stdout.removeListener('data', this.callback.stdout);
        cmd.getData(this.shellName).stderr.removeListener('data', this.callback.stderr);
        cmd.getData(this.shellName).removeListener('close', this.callback.close);
    }

    onListener(){
        // 命令执行完后就remove
        // todo 可尝试用Reflect来解决上面this问题
        cmd.getData(this.shellName).stdout.on('data', this.callback.stdout);
        cmd.getData(this.shellName).stderr.on('data', this.callback.stderr);
        cmd.getData(this.shellName).on('close', this.callback.close);
    }

}







module.exports = pExec;

