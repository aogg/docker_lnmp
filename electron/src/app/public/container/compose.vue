<template xmlns:v-bind="http://www.w3.org/1999/xhtml">
    <div class="container container-compose dis-flex" :id="'compose-' + containerName" :data-id="id">
        <div class="container-status"><span class="container-status-dot bg-white" v-bind:title="title" :class="statusBg"> </span></div>
        <div class="container-name nowrap name-color">{{containerName}}</div>
        <div class="container-action dis-flex">
            <action-self :container-name="containerName"></action-self>
            <action-other :container-name="containerName"></action-other>
        </div>
    </div>
</template>
<style>
    .status-dot-up,.status-dot-start,.status-dot-attach, .status-dot-restart{
        background: green;
    }
    .status-dot-unpause,.status-dot-pause,.status-dot-kill{
        background: gray;
    }
</style>
<script>
    const electron = window.require('electron');
    import actionSelf from './actionSelf.vue';
    import actionOther from './actionOther.vue';

    export default {
        props:{
            containerName:String
        },
        created(){
            let green = ['up', 'start', 'attach', 'restart'],
                gray = ['unpause', 'pause', 'kill'],
                white = ['stop', 'die', 'exited'],
                all = [...green, ...gray, ...white];
            this.$watch('$parent.composeTitle', (newVal) => {
                if (Reflect.has(newVal, this.containerName)) {
                    this.title = newVal[this.containerName];

                    // 修改背景色
                    let statusBg = this.title.toLowerCase();
                    if (all.includes(statusBg)){
                        this.statusBg = `${this.statusPrefix}${statusBg}`;
                    }
                }
            }, {deep: true});

            // 容器状态和title
            Reflect.apply(ipcStatusOn, this, []);
            this.$parent.sendContainersStatus(this.containerName);
        },
        beforeDestroy(){
        },
        data(){
            return {
                statusPrefix: 'status-dot-',
                title: '',
                statusBg: {},
                id: '',
            }
        },
        components:{
            actionSelf,
            actionOther,
        },
    };

    let colorMap = {
        'Up': 'green',
        'Kill': 'white',
        'Die': 'white',
        'Stop': 'gray',
        'Start': 'green',
        'Restart': 'gray',
        'Exited': 'white',
    };

    function ipcStatusOn(){
        electron.ipcRenderer.on(this.$parent.ipcName(this.containerName), (event, arg) => {
            let data = arg.data;

            if (data.name === this.containerName){
                if (data.action === 'statue'){
                    this.title = data.title;
                    console.log(`${data.name}改变状态为${data.statue}`);
                    this['statusBg'] = `${this.statusPrefix}${data.statue}`.toLowerCase();
                    // colorMap[data.statue] && (this['statusBg']['bg-' + colorMap[data.statue]] = true);

                    this.$parent.ipcName(this.containerName) && electron.ipcRenderer.removeAllListeners(this.$parent.ipcName(this.containerName))

                }else if (data.action === 'id'){
                    this.id = data.id;
                }
            }
        });
    }

</script>
