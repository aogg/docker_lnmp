const Vux = require('vuex');
const commonFunc = require('../../core/commonFunc');
const electron = window.require('electron');








module.exports = new Vux.Store({
    state: {
        nodeStorage: {},
        title: electron.remote.getGlobal('config').title,
    },

    mutations:{
        setNodeStorage(state, {proto, value}){
            state.nodeStorage = commonFunc.setObjectProto(state.nodeStorage, proto, value);
        },
        setTitle(state, value){
            state.title = value;
        }
    },
    getters:{
    },
});




