let onName = 'docker-command'; // ipc on的名称
let ipcRenderName = 'ipcRenderCallback'; // ipcRender on

module.exports = {
    ipcRenderName,
    onName,
    eventsName: 'docker-events',
    dockerParam (channel, type, arg, callbackName) {
        callbackName = callbackName ? callbackName : onName;
        return [onName, {type, name: channel, arg, callbackName}];
    },

    /**
     * 发回给ipcRenderer的参数
     */
    sendCallBack(data, callbackName, code, errMsg = ''){
        return {data, callbackName, code, errMsg};
    },

};


// module.exports =


