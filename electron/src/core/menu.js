const NodeDocker = require('./docker.node');

let nd = new NodeDocker();

function dockerExec(command, arg = null){
    // IpcMain.send(onName, dockerParam(command, 'sync', arg));
    nd.execDocker('async', command, arg);
}


module.exports = {
    defaultMenu:[
        {
            label: 'Toggle Developer Tools',
            get accelerator(){
                if (process.platform === 'darwin') {
                    return 'Alt+Command+I'
                } else {
                    return 'Ctrl+Shift+I'
                }
            },
            click: function (item, focusedWindow) {
                if (focusedWindow){
                    if (focusedWindow.isDevToolsOpened()) {
                        focusedWindow.closeDevTools();
                    }else{
                        // 必须固定新建窗口打开，否则如果点击“响应设计模式”会出现bug
                        focusedWindow.openDevTools({mode: 'detach'});
                    }
                }
            }
        },
        {
            role: 'undo',
        },
        {
            role: 'redo',
        },
        {
            role: 'cut',
        },
        {
            role: 'copy',
        },
        {
            role: 'paste',
        },
        {
            role: 'selectall',
        },
        {
            role: 'delete',
        },
        {
            role: 'forcereload',
        },
        {
            label:'启动/重启',
            accelerator:'Ctrl+E',
            click: function(){
                dockerExec('docker-compose/restart');
            },
        },
    ],
    trayMenu: [
        {
            label:'启动/重启',
            accelerator:'Ctrl+E',
            click: function(){
                dockerExec('docker-compose/restart');
            },
        },
        {
            label:'停止',
            click:function(){
                dockerExec('docker-compose/stop')
            },
        },
        {
            label:'构建',
            click: function () {
                dockerExec('docker-compose/build');
            },
        },
        {
            type: 'separator',
        },
        {
            label: '退出',
            click: function(){
                require('./event')('ipcRenderer-window-close', {close: 'close'});
            }
        },
    ],
};










