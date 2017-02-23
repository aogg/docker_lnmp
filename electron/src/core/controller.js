const nodeStorage = require('./nodeStorage');
const {BrowserWindow, Tray} = require('electron');


let controller  =  {
    getSetupEnv(){
        return require('../config/config.docker').configEnv;
    },
    setContainerConfig({key, value, name = ''}){
        if (name){ //多层 
            nodeStorage.setItem(['containerConfig', name, key], value);
        }else{ // 顶层
            nodeStorage.setItem(['containerConfig', key], value);
        }
    },

    setNodeStorage({proto, value}, event){
        nodeStorage.setItem(proto, value);

        if (proto === 'app-title'){ // 所有窗口改变标题
            (new Promise(function () {
                BrowserWindow.getAllWindows().map(function (win) {
                    win.setTitle(value);
                    win.webContents.executeJavaScript(`mainVue.$store.commit('setTitle', '${value}')`);
                    // 手动触发
                    win.emit('page-title-updated');
                });
            })).catch(function (error) {
                console.log('setTitle error:' + error);
            });
        }
    },

    getAllNodeStorage(){
        return nodeStorage.getItem();
    }
};




module.exports = function (action, args, event){
    if (Reflect.has(controller, action)){
        if (typeof controller[action] === 'function'){
            return controller[action](args, event);
        }else{
            return controller[action];
        }
    }else{
        return false;
    }
};










