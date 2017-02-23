'use strict';
// 加载docker类
const IpcMain = require('electron').ipcMain;
const NodeDocker = require('./docker.node.js');
const {onName} = require('./docker');
const controllerFunc = require('./controller');
const LocalEvent = require('./event');

exports.LocalEvent = LocalEvent;

// export * from './docker.node.js'




IpcMain.on(onName, function (event, arg) { // todo 待改为 function (event, {name:name, arg} = {})
    /**
     * arg.name   事件动作名称
     * arg.type   事件行为  sync | async
     * arg.arg    事件参数
     */
    let nd = new NodeDocker();
    nd.event = event;
    nd.execDocker(arg.type, arg.name, arg);
    // nd = null;
});


IpcMain.on('ipcRenderer', function(event, arg){
    if (arg.name){
        LocalEvent(`ipcRenderer-${arg.name}`, arg, event)
    }
});





IpcMain.on('controller', function(event, args){
    if (!args.action){
        return;
    }

    event.sender.send('controller-callback', {uniqid: args.uniqid, data: controllerFunc(args.action, args.args, event)});
});



