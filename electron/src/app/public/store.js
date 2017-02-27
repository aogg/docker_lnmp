const Vux = require('vuex');
const commonFunc = require('../../core/commonFunc');
const electron = window.require('electron');








module.exports = new Vux.Store({
    state: {
        fontFamily: localStorage.getItem('fontFamily') || '',
        nodeStorage: {},
        title: electron.remote.getGlobal('config').title,
    },

    mutations:{
        updateFontFamily(state){
            state.fontFamily = localStorage.getItem('fontFamily') || '';
        },
        setLocalStorage(state, {key, value}){
            localStorage.setItem(key, value);

            if (Reflect.has(state, key)){
                state[key] = value;
                opener.postMessage(key, '*');
            }
        },
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




