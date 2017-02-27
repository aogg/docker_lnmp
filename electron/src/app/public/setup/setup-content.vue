<template>
    <div id="setup-content" class="dis-flex setup-content-bg">
        <keep-alive>
            <component v-bind:is="contentHtml"></component>
        </keep-alive>
    </div>
</template>
<style>
    .setup-content-bg{background: #272822;}
    #setup-content{
        flex-grow: 11;
        height: calc(100vh - 32px);
        flex-direction: column;
        color: rgb(212, 212, 212);
    }
    .setup-content-main{
        padding-top: 5px;
    }
    .content-once{
        display: flex;
        flex-wrap: wrap;
    }
    .content-name{
        flex-basis: 28vw;
        color: rgba(156, 220, 254, 1);
        padding-left: 1%;
        line-height: 23px;
    }
    .content-data{
        padding-left: 1%;
        line-height: 23px;
        flex-grow: 1;
    }
    .render-text input{
        border: 0;
        padding: 0 0 0 1%;
        line-height: 23px;
        width: 98%;
    }
    .render-textarea>textarea{
        width: 98%;
        height: 10vh;
    }
    .content-space{
        height: 2vh;
    }
</style>
<script>
    const contentFunc = require('../../../core/setupContent');

    export default{
        props: ['containerName'],
        created(){
            this.$root.controller('getSetupEnv', (data) => {
                this.contentConfig = data;
            });
        },
        watch:{
            containerName: function(){
                if (this.contentConfig){
                    contentFunc(this, this.getContentConfig());
                }
            },
            contentConfig: function(){
                contentFunc(this, this.getContentConfig());
            },
        },
        data(){
            return{
                componentsBool:{}, // 是否已经加载
                contentHtml: '', // 加载哪个模块
                contentConfig:{},
                msg:'hello vue',
                'defaultName': 'default',
            }
        },
        computed:{
            // 当前名称，在create中有调用
            name(){
                let name = this.containerName.split('/').slice(2).toString();
                if (name === this.$parent.containerHeaderName) name = this.defaultName;
                return name;
            },
            ifDefault(){
                return this.name === this.defaultName;
            },
        },
        methods:{
            // 不用getter和setter，set可多传参
            getContentConfig(){ // 取消引用传参
                return Object.assign({}, this.contentConfig);
            },
            setContentConfig(key, value){
                if (this.ifDefault){ // 默认
                    this.$set(this.contentConfig, key, value);
                    this.$root.controller('setContainerConfig', null, {key, value});
                }else{
                    this.$set(this.contentConfig[this.name], key, value);
                    this.$root.controller('setContainerConfig', null, {key, value, name: this.name});
                }
            },
            setContentHtml(template = ''){
                let name = this.name;
                if (template){
                    require('vue').component('contentHtml' + name, {template});
                    this.componentsBool[name] = true; // 利用keep-alive
                }
                this.$set(this, 'contentHtml', 'contentHtml' + name);
            },
            selectEnv(event){
                let e = event.target,
                    type = this.getType(e);

                switch(type.action){
                    case 'localStorage':
                        localStorage.setItem(type.name, e.value);
                        break;
                }

                console.log(type);
            },
            textEnv(event){
                let e = event.target,
                    type = this.getType(e);
                if (type.containerConfig){ // 容器配置
                    this.setContentConfig(type.name, e.value);
                }

                switch(type.action){
                    case 'nodeStorage':
                        type.proto = (type.proto === '.' || !type.name ? type.name : `${type.proto}${type.name}`);
                        this.$root.controller('setNodeStorage', null, {proto: type.proto, value: e.value});
                        this.$store.commit('setNodeStorage', {proto: type.proto, value: e.value});
                        break;
                    case 'localStorage':
                        this.$store.commit('setLocalStorage', {key: type.name, value: e.value});
                        break;
                }
            },
            textareaEnv(event){
                this.textEnv(event);
            },
            getType(e){
                let type = {};
                try {
                    type = JSON.parse(e.getAttribute('data-change')) || {};
                } catch (error) {
                }
                return type;
            },
        },
        components:{

        }
    }
</script>
