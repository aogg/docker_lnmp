'use strict';

const configCommand = require('../config/config.command');
const dockerConfig = require('../config/config.docker');
const commonFunc = require('./commonFunc');
const Error = require('./error.js');
const fs = require('fs'); // 调试写文件
const os = require('os');
const util = require('util');
const {sendCallBack} = require('./docker');
const processExec = require('./process.exec');
let commandMapFunc = require('./docker.commandMap');
let cmd = Symbol('cmd'),
    clearRow = '[2K',
    endRow = '[1B',
    closing = '', // 结束时发送
    syncInit = Symbol('syncInit');





class NodeDocker {
    constructor(shellName = '') {
        this.event = null; // IpcMain的回调event
        // 初始化
        this.commandData = []; // 当前执行的所有数据
        this.currentCommand = ''; // 当前需要执行的命令
        this.currentExecArgs = {}; // 当前执行命令的参数
        this.localSend = null; // 自定义消息输出

        this.headArr = configCommand.headArr;
        this.pe = new processExec(shellName || dockerConfig.dockerProcessName); // 是要每次都new
        this.syncInitBool = false;


        this[syncInit]();
    }


    [syncInit](){
        if(!this.syncInitBool){ // 头部只执行一次
            this.headArr.map(
                (value) => this.pe.shellExec(value)
            ); // todo 这要保证等待执行
            this.syncInitBool = true;
        }


        this.pe.setCallBack('stdout_data', (msg) => {
            // console.log(this); // todo 会出现this一直是同样的值的问题
            // console.log('out_data');

            // asyncFunc(msg);
            this.execDockerAsync(0, msg, '');
        });
        this.pe.setCallBack('stderr_data', (msg) => { // docker命令会在stderr中输出
            // fs.appendFile('F:/code/www/electron/a.txt', msg);
            // console.log(msg.toString().includes('[2K'));
            // console.log('err_data');

            this.execDockerAsync(0, '', msg);
        });
        this.pe.setCallBack('on_close', (code) => { // electron关闭后，貌似不会运行此
            // console.log('close');

            this.execDockerAsync(code, '', '');
        });
    }


    /**
     * 执行docker命令，会解析，入口
     *
     * @param type
     * @param name 执行的命令name
     * @param args
     * @returns {boolean}
     */
    execDocker(type, name, args) {
        this.currentExecArgs = args;

        if (type !== 'sync') { // 异步 async
            this.exec(name, args, this.execDockerAsync);
        } else { // 同步 sync
            let value = this.exec(name, args, null);

            if (this.event) this.event.returnValue = value;
        }

        return true;
    }



    execDockerAsync(error, stdout, stderr){
        let out = stdout ? stdout : stderr, // docker命令会在stderr中输出
            msg = !error ? (Error.hasError() ? Error.getError() : out) : error; // todo 待处理标准输出和错误输出放一起

        if (this){ // todo 出现this不存在的情况
            if(util.isFunction(this.getCommandData().filterMsg)){ // 过滤，要绑定当前this
                // todo 暂无考虑process.exec的tailBool为true时
                msg = Reflect.apply(this.getCommandData().filterMsg, this, [msg, this]);

                if (util.isNull(msg)) {return;} // 返回null，则不发送
            }

            this.execDockerAsyncSend(msg, error);
        }


        config.dockerNodeCommandLog && msg && console.log('output : ' + os.EOL + msg); // 命令输出
    }


    /**
     * 发送命令的返回
     *
     * @param msg
     * @param error
     */
    execDockerAsyncSend(msg, error){
        if (this.event && this.currentExecArgs['callbackName']) {
            config.dockerNodeCommandLog && console.log(`event.sender.send : ${this.currentExecArgs['callbackName']}`);
            this.event.sender.send(
                this.currentExecArgs['callbackName'],
                sendCallBack(msg, this.currentExecArgs['name'], parseInt(error))
            ); // todo 待添加错误处理
        }else if(typeof this.localSend === 'function'){
            this.localSend(msg, this.currentExecArgs['name'], parseInt(error));
        }
    }



    /**
     * 通过cmd执行命令
     *
     * @param command
     * @param asyncFunc 这个参数在异步中应该没有用，同步未知
     */
    cmdExec(command, asyncFunc){ // 木有cwd
        this.pe.shellExec(command || this.currentCommand, null, asyncFunc || function(){
            // 发送完毕执行，无参数
            // console.log('exec command end');
        });


    }


    /**
     * 执行系统命令
     *
     * @param name
     * @param arg
     * @param asyncFunc
     */
    exec(name, arg, asyncFunc = null) { // todo 可试下spawn的args来解决command.arg
        this.commandData = commandMapFunc(name, arg);
        let commandData = this.getCommandData(),
            command = commandData.command;
        if (!command) {
            return false;
        }
        this.currentCommand = command;
        // console.log(this.commandData);

        // 是否持续输出
        commandData.setTailBool && this.setTailBool(commandData.setTailBool);
        commandData.restart && (this.pe.restart = commandData.restart);

        if (asyncFunc && typeof asyncFunc === 'function') { // 异步
            this.cmdExec(command, asyncFunc);
            // this.cmdExec(command, commandData.execOption, asyncFunc);

            // return true;
        } else { // 同步执行会影响整个electron主进程
            command = configCommand.execShellNameSync(command);
            console.log('sync exec command: ' + command);

            let tempOption = Object.assign({}, this.getCommandData().execOption || {}), // 取消一层引用
                option = dockerConfig.execOption;
            if (!commonFunc.emptyObject(tempOption.env)) { // 处理env对象
                option.env = Object.assign(option.env, tempOption.env);
                Reflect.deleteProperty(tempOption, 'env');
            }

            let data = this.pe.execSync(
                command,
                Object.assign(option,  tempOption)
            );
            if (this.getCommandData().hasOwnProperty('returnData') && typeof this.getCommandData().returnData === 'function') { // 自定义处理函数
                return this.getCommandData().execData(data);
            } else {
                // const iconv = require('iconv-lite');
                // data= data ? iconv.decode(data, 'GBK') : ''; // 未测试
                return data;
            }
        }
    }



    getCommandData(){
        return this.commandData || {};
    }


    setTailBool(bool){
        this.pe.setTailBool(bool);
    }

}




module.exports = NodeDocker;




//
//
// function getDir() {
//     let msg = '';
//     // let bat = spawn('powershell.exe', ['dir']);
//     // exec('powershell.exe dir', [], function (error, stdout, stderr) {
//     //
//     //     msg = 'ppppp';
//     //     // console.log(msg);
//     // });
//
//     msg = iconv.decode(execSync('dir /B'), 'GBK');
//
//     return msg;
//
//     // bat.stdout.on('data', (data) => {
//     //     return iconv.decode(data, 'GBK');
//     // });
//     // bat.stderr.on('data', (data) => {
//     //     return iconv.decode(data, 'GBK');
//     // });
// }


// let test_cmd = exec('cmd',{cwd:'F:/code/www/github/docker_lnmp/docker'});
//
// test_cmd.stdin.on('data', function () {
//     console.log('1111111111111111')
// });
// test_cmd.stdout.on('data', function (data) {
//     // console.log('hhhhhhhhhhhhhhhhhhhhhhhhh:' + data);
// });
//
//
// test_cmd.stdin.write('@echo off \n');
// test_cmd.stdin.write('cd ./nginx \n');
// test_cmd.stdin.write('dir\n', null, function (...arg) {
//     console.log(arg)
// });
// test_cmd.stdin.end();
// // console.log(test_cmd.stdin)
//
//
// //
// test_cmd.on('exit', function (code) {
//     console.log('code : ' + code);
// });