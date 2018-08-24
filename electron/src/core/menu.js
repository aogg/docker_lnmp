const NodeDocker = require('./docker.node');
const {app} = require('electron');

let nd = new NodeDocker();

function dockerExec(command, arg = null){
    // IpcMain.send(onName, dockerParam(command, 'sync', arg));
    nd.execDocker('async', command, arg);
}

let menuConfig = {};
menuConfig = {
    appMenuName: '操作',
    get defaultMenu(){
        let template = [
            {
                label: menuConfig.appMenuName,
                submenu: [
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
                        label:'启动/重启',
                        accelerator:'Ctrl+E',
                        click: function(){
                            dockerExec('docker-compose/restart');
                        },
                    },
                ]
            },
            {
                label: 'Edit',
                submenu: [
                    {role: 'undo'},
                    {role: 'redo'},
                    {type: 'separator'},
                    {role: 'cut'},
                    {role: 'copy'},
                    {role: 'paste'},
                    {role: 'pasteandmatchstyle'},
                    {role: 'delete'},
                    {role: 'selectall'}
                ]
            },
            {
                label: 'View',
                submenu: [
                    {role: 'reload'},
                    {role: 'forcereload'},
                    {role: 'toggledevtools'},
                    {type: 'separator'},
                    {role: 'resetzoom'},
                    {role: 'zoomin'},
                    {role: 'zoomout'},
                    {type: 'separator'},
                    {role: 'togglefullscreen'}
                ]
            },
            {
                role: 'window',
                submenu: [
                    {role: 'minimize'},
                    {role: 'close'}
                ]
            },
            {
                role: 'help',
                submenu: [
                    {
                        label: 'Learn More',
                        click () { require('electron').shell.openExternal('https://electronjs.org') }
                    }
                ]
            }
        ];

        if (process.platform === 'darwin') {
            template.unshift({
                label: app.getName(),
                submenu: [
                    {role: 'about'},
                    {type: 'separator'},
                    {role: 'services', submenu: []},
                    {type: 'separator'},
                    {role: 'hide'},
                    {role: 'hideothers'},
                    {role: 'unhide'},
                    {type: 'separator'},
                    {role: 'quit'}
                ]
            });

            // Edit menu
            template[2].submenu.push(
                {type: 'separator'},
                {
                    label: 'Speech',
                    submenu: [
                        {role: 'startspeaking'},
                        {role: 'stopspeaking'}
                    ]
                }
            );

            // Window menu
            template[4].submenu = [
                {role: 'close'},
                {role: 'minimize'},
                {role: 'zoom'},
                {type: 'separator'},
                {role: 'front'}
            ];
        }


        return template;
    },
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
    get dockMenu(){
        return [
            {
                label: menuConfig.appMenuName,
                submenu: menuConfig.trayMenu,
            },
        ];
    },
};

module.exports = menuConfig;










