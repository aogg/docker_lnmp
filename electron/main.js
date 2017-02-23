'use strict';

const electron = require('electron');
const app = electron.app;
const config = require('./src/config/config'); // 全局变量
global.config = config;
// global.mainWindow = {}; // todo 未知，是否需要在主文件定义


const {LocalEvent} = require(`${config.srcPath}/core/`);



// 初始化并准备创建浏览器窗口
app.on('ready', function () {
    LocalEvent('app-ready')
});

// 当 Electron 结束的时候，这个方法将会生效
app.on('window-all-closed', function () {
    // 用于mac
    if (process.platform !== 'darwin') {
        app.quit();
    }

    LocalEvent('app-window-all-closed');
});

// mac专用
app.on('activate', function () {
    LocalEvent('app-activate');
});


app.on('before-quit', function () {
    LocalEvent('app-before-quit');
});