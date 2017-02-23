<template>
    <main id="main">
        <container-header-modules></container-header-modules>
        <ul>
            <li v-for="item in this.$root.containers">
                <container-modules :containerName='item'></container-modules>
            </li>
        </ul>
    </main>
</template>

<style src="./public/css/container.css"></style>
<style>
    #main{
        box-sizing: border-box;
        padding-top: 2%;
        padding-right: 0;
        /*background: rgb(3, 54, 73);*/
    }
</style>

<script>
//    import OtherComponent from './public/footer.vue'
    const containerModules = require('./public/container/compose.vue');
    const containerHeaderModules = require('./public/container/header.vue');
    const electron = require('electron');
    let browserWindowProxy = null,
        mainLoadUrl = electron.remote.getGlobal('config').mainLoadUrl();

    export default {
        data(){
            return {
                composeTitle:{},
                liPrefix: 'container-li-',
            }
        },
        created(){
        },
        updated:function(){
            console.log('updated');
        },
        beforeMount(){
//            let vm = this; // 必须放外面
            this.containerEvents();
            console.log('beforeMount');
        },
        mounted(){
        },
        methods:{
            setup: function (containerName) {
                if (!browserWindowProxy || browserWindowProxy.closed){
                    browserWindowProxy = window.open(`${mainLoadUrl}#/setup/${containerName}`, `setup-${containerName}`, `
                        height=${localStorage.getItem('setup-outerHeight') || 800},
                        width=${localStorage.getItem('setup-outerWidth') || 600},
                    `);
                }else{ // 已打开
                    browserWindowProxy.focus();
                    browserWindowProxy.eval(`
                        document.getElementById('setup-left-ul').querySelectorAll('a[href="#/setup/${containerName}"]')[0].click();
                    `);
                }
            },
            ipcName: function (containerName) {
                return 'ipc-ps-status-' + containerName;
            },
            containerCommand(action, containerName = '', compose = true){
                let prefix = compose ? 'docker-compose' : 'docker';
                this.$root.sendDocker(`${prefix}/${action}`, 'async', containerName)
            },
            containerAction(action, containerName = '', compose = true){
                let prefix = compose ? 'docker-compose' : 'docker';
                this.$root.sendDocker(`${prefix}/${action}`, 'async', containerName)
            },
            sendContainersStatus(containerName){
                this.$root.sendDocker('docker-compose/ps-status', 'async', {
                    arg: containerName,
                    callbackName: this.ipcName(containerName)
                })
            },



            containerEvents(){
                const electron = window.require('electron');
                const commonFunc = require('../core/commonFunc');
                let {eventsName} = require('../core/docker');
                // docker-compose events
                electron.ipcRenderer.on(eventsName, (event, data) => {
//                let status = `attach, commit, copy, create, destroy, detach, die,
//                    exec_create, exec_detach, exec_start, export, kill, oom, pause, rename,
//                    resize, restart, start, stop, top, unpause, update`;

                    // containerModules
                    if (typeof data === 'object' && commonFunc.isRePropertyObject(data, 'Actor', 'Attributes', 'com.docker.compose.service')){
                        this.$set(this.composeTitle, data.Actor.Attributes['com.docker.compose.service'], data.status);
                    }
                    // docker events的输出
//                    console.log(data);
                });
            },
        },
        watch:{
        },
        computed: {
//            containers : {
//                get : function (){
//                    return containers;
//                },
//                set : function(newValue){
//                    console.log(newValue);
//                    containers = newValue;
//                }
//            }
        },
        components:{
            containerHeaderModules,
            containerModules
        }
    }

//    alert(1);
//    var HeaderComponent = require('./public/header.vue');
//    import OtherComponent from './public/footer.vue'


//    export default{
//        data(){
//            return{
//                msg:'hello vue'
//            }
//        },
//        components:{
//            'other-component':OtherComponent,
////            HeaderComponent,
//        }
//    }

</script>
