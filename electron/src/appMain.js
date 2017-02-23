'use strict';

require('./app/public/css/common.css'); // 加载公共css
const Vue = require('vue');
const Vux = require('vuex');
const electron = window.require('electron');
const VueRouter = require('vue-router');
// var config = require('./config/config.js'); // 不能require config

let {dockerParam, ipcRenderName} = require('./core/docker'),
    dataCallback = {}, // 存放sendDocker的func
    uniqidCallback = {}, // 同上，待转移
    uniqid = 1,
    App = require(location.hash.startsWith('#/setup')?'./app/setup.vue':'./app/index.vue'); // 必须要有.开头

// vueRouter报错，只好自己来
// Vue.use(VueRouter);
//
// let routes = new VueRouter({
//     routes: [
//         {path: '*', name: 'all', component: { template: '<div>home</div>' }},
//         {path: '/', name: 'index', component: { template: '<div>home</div>' }}
//     ]
// });

/*<keep-alive>
<router-view></router-view>
</keep-alive>*/

window.appStartTime = electron.remote.getGlobal('appStartTime'); // 在vue加载会导致无法获取electron
const renderSessionStorage = require('./core/renderSessionStorage');
const windowHeader = require('./app/public/header.vue');
const commonFunc = require('./core/commonFunc');
// Vue.config.devtools = true;


Vue.use(Vux);
let store = require('./app/public/store');

window['mainVue'] = new Vue({
    el:'#body',
    // routes,
    data(){
        return {
            containerHeaderName: 'ALL',
            closeButton: localStorage.getItem('windowClose') == 1, // 关闭按钮是否关闭，true为关闭，false为隐藏
            containers: [],
        };
    },
    store,
    created(){
        this.controller('getAllNodeStorage', (val) => {
            this.$store.commit('setNodeStorage', {proto: '', value: val});
        });

        this.getContainerList();
    },
    computed: {
    },
    components: {
        windowHeader,
        App,
    },
    methods: {
        sendIpcMain(name, type, arg = {}){
            let data = true;
            type = type.toLowerCase();
            arg = this.disArg(arg, 'sendIpcMain-' + name);
            if (type === 'async') { // 异步
                console.log(`ipc异步请求：${name}的${arg.name}`);

                electron.ipcRenderer.send(name, arg);
            }else if (type === 'sync'){ // 同步
                console.log('ipc同步请求：' + name);

                data = electron.ipcRenderer.sendSync(...sendParam);
                console.log([channel + 'ipc请求结果：', data]);
            }

            return data;
        },
        sendDocker: function (channel, type, arg = {}, func =null) {
            // 为函数时ipc回调默认sendParam.onName
            let callbackName = '';
            arg = this.disArg(arg, 'sendDocker-' + channel);
            if (typeof func === 'function') {
                dataCallback[channel] = {};
                dataCallback[channel]['func'] = func;
                callbackName = ipcRenderName;
            } else {
                callbackName = `${channel}Callback`;
            }
            type = type.toLowerCase();
            let sendParam = dockerParam(channel, type, arg, arg.callbackName || callbackName);

            return this.sendIpcMain(sendParam[0], type, sendParam[1]);

            // if (type === 'async') { // 异步
            //     console.log(`将回调${callbackName}`);
            // }
        },


        ipcRendererCallback(event, args){
            console.log(`${ipcRenderName}：回调执行 ${args.callbackName || ''}`);
            if (Reflect.has(dataCallback, args['callbackName']) && typeof dataCallback[args['callbackName']]['func'] === 'function'){
                // args会自动排序
                dataCallback[args['callbackName']]['func'](args['data'], args['callbackName'], args['code'], args['errMsg']);
                Reflect.deleteProperty(dataCallback, args['callbackName'])
            }
            // console.log([event, args]);
        },

        getContainerList(){
            let key = 'docker-compose/config-services';

            this.setContainers(renderSessionStorage.getItem(key));

            if (!this.containers.length){
                this.sendDocker(key, 'async', {}, (data) => {
//                data.map((val) => {
//                    if (val) {
//                        vm.containers.push(val);
//                    }
//                });

                    renderSessionStorage.setItem(key, data);
                    this.setContainers(data);
                });
            }
        },

        setContainers(data){
            if (data && typeof data === 'string'){
                let tempData = [];
                data.split(/\s+/).map((val) => {
                    if (val){
                        tempData.push(commonFunc.html2Escape(val));
                        return true;
                    }
                });
//                    data = data.slice(0, 1);
                this.$set(this, 'containers', tempData);
            }
        },
        controller(action, callback = null, args = {}){
            let data = this.disArg({action, args}, 'controller-' + action);

            this.uniqidCallback(data.uniqid, callback);
            electron.ipcRenderer.send('controller', data);
        },
        uniqidCallback(key, callback = null, args = []){
            if (callback === null && typeof uniqidCallback[key] === 'function'){ // 调用
                uniqidCallback[key](...args);
                Reflect.deleteProperty(uniqidCallback, key);
            }else if (typeof callback === 'function'){ // 存储
                uniqidCallback[key] = callback;
            }
        },
        uniqid(){ // unique
            if (uniqid > 100000){
                uniqid =  1;
            }
            return ++uniqid;
        },
        disArg(arg, uniqidPrefix = ''){
            arg = typeof arg !== 'object' || Array.isArray(arg)?{arg}:arg;
            return Object.assign({uniqid: uniqidPrefix + '_' + this.uniqid()}, arg);
        },
    },


});
// mainVue.$mount('#body');


electron.ipcRenderer.on(ipcRenderName, mainVue.ipcRendererCallback);

electron.ipcRenderer.on('controller-callback', function(event, args){
    if (!args.uniqid){
        return false;
}
    mainVue.uniqidCallback(args.uniqid, null, [args.data, event]);
});


if(module.hot) { // 触发更新
    module.hot.accept();
}