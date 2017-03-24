const {Tray, Menu, BrowserWindow, app} = require('electron');

let appIcon,
    eventConfig,
    mainWindow = {};
global.mainWindow = mainWindow;
global.appStartTime = (new Date()).getTime();

function createWindow(){
    //创建一个 800x600 的浏览器窗口
    mainWindow = new BrowserWindow(config.BrowserWindow);


    // 使用devtron
    disDevtron();



    //加载应用的界面文件
    let url = config.mainLoadUrl();
    mainWindow.loadURL(url);
    console.log('mainWindow loadURL : ' + url);


    //打开开发者工具，方便调试
    config.openDevTools && mainWindow.webContents.openDevTools();

    // 窗口关闭时触发
    mainWindow.on('closed', function () {
        // 想要取消窗口对象的引用，如果你的应用支持多窗口，
        // 通常你需要将所有的窗口对象存储到一个数组中，
        // 在这个时候你应该删除相应的元素
        mainWindow = null;
    });

    mainWindow.on('page-title-updated', function () {
        // todo 未知，在webpack-dev-server时会出现arguments[1]不改变情况
        appIcon.setToolTip(config.title);
        appIcon.setTitle(config.title);
    })

}


function disDevtron() { // 安装vue-devtools
    const devtron = require('vue-devtools');

    if (config.electorn_devtron) {
        // 必须要在new BrowserWindow后执行

        // 不要每次都输出
        !BrowserWindow.getDevToolsExtensions().hasOwnProperty('Vue.js devtools') && devtron.install();
    }else if (!config.electorn_devtron){
        devtron.uninstall();
    }
}


eventConfig = { // todo 待，通过get()将处理逻辑放入对象内

    'ipcRenderer-window-mini': function(arg, event){ // 渲染端调用最小化
        let window = event && event.sender ? BrowserWindow.fromWebContents(event.sender) : mainWindow;
        if (!window.isMinimized()) {
            window.minimize();
        }
    },
    'ipcRenderer-window-close': function(arg, event){ // 渲染端调用关闭窗口
        // todo 可迁移到remote中
        arg = arg || {};
        let window = event && event.sender ? BrowserWindow.fromWebContents(event.sender) : mainWindow;
        if (arg.close) {
            window.close();
        } else { // 后台运行
            window.hide();
        }
    },

    'app-ready': {
        checkOnlyWindow(){ // 窗口唯一性
            let bool = app.makeSingleInstance((commandLine, workingDirectory) => {
                if (mainWindow){
                    mainWindow.show();
                }
            });

            if (bool){
                app.quit();
                return 'exit';
            }
        },
        createWindow,
        tray () {
            const { trayMenu } = require('./menu'); // 放在创建中
            const iconName = process.platform === 'win32' ? 'windows-icon.png' : 'iconTemplate.png';
            const iconPath = `${config.srcPath}/images/${iconName}`;
            appIcon = new Tray(iconPath);
            // 在上面的on中
            // appIcon.setToolTip(config.title);
            // appIcon.setTitle(config.title);

            const contextMenu = Menu.buildFromTemplate(trayMenu);
            appIcon.setContextMenu(contextMenu);
            appIcon.on('double-click', function (event , bounds) { // 双击
                if (event.altKey){ // 重启

                }else{ // 激活主页面
                    mainWindow.show();
                }
            });
        },
        defaultMenu(){ // 界面快捷键
            const {defaultMenu} = require('./menu');
            const menu = Menu.buildFromTemplate(defaultMenu);
            Menu.setApplicationMenu(menu);
        },
        'docker-events': function () { // docker-compose events --json
            const NodeDocker = require('./docker.node');
            const configCommand = require('../config/config.command');
            let {eventsName} = require('./docker');

            let eventsData = new NodeDocker('docker-events');
            eventsData.localSend = function(msg){
                if (!msg) return;

                try{
                    // 有可能一次输出多个json数据
                    msg = JSON.parse(configCommand.lineArr(msg).filter(val => !!val).pop());
                }catch (error){
                    console.log('docker events error msg : ' + msg);
                    return;
                }

                mainWindow.webContents.send(eventsName, msg);
            };
            eventsData.execDocker('async', 'docker-compose/ps-events', {'callbackName' : eventsName});
        },
        firstStart(){ // 首次运行
            const nodeStorage = require('./nodeStorage');

            if (!nodeStorage.getItem('firstStartEvents')) {
                process.nextTick(function () {
                    Promise
                        .all([
                            new Promise(function (resolve, reject) { // 检查vmOrVirtualBox
                                const NodeDocker = require('./docker.node.js');
                                let dockerNode = new NodeDocker();
                                dockerNode.localSend = function (msg, name, error){
                                    if (error){ // 非docker-machine管理
                                        resolve({name: 'docker/v', data: 0});
                                    }else{
                                        resolve({name: 'docker/v', data: 1});
                                    }
                                };
                                dockerNode.execDocker('async', 'docker/v', {});
                            })
                        ])
                        .then(function () {
                            // nodeStorage.setItem('firstStartEvents', 1);
                        })
                        .catch(function (){
                            // 
                        });
                })
            }
        },
    },


    'app-window-all-closed':{
        tray() {
            appIcon.destroy();
        }
    },

    'app-activate':{
        createWindow(){
            if (mainWindow === null){
                createWindow();
            }
        }
    },

    'app-page-title-updated':{

    }
};





module.exports = function (name, arg, event = null){
    if (!name) {
        return false;
    }

    if (eventConfig.hasOwnProperty(name)) {
        let eventData = eventConfig[name];
        switch (typeof eventData){
            case 'function':
                eventData(arg, event);
                break;
            case 'object':
                for (let key in eventData){ // es7 Object.entries
                    if (eventData.hasOwnProperty(key)){
                        let eventDataType = typeof eventData[key];
                        if (eventDataType === 'function') { // 多个需要处理的事件函数

                            let eventReturn = eventData[key](arg, event);
                            if (eventReturn === 'exit') { // 返回
                                break;
                            }

                        }else if(eventDataType === 'object'){ // 未定

                        }
                    }
                }
                break;
        }
    }

    return true;
};


