<template>
    <header @dblclick.parent.stop="windowMaximiz()" class="dis-flex app-header">
        <div></div>
        <div class="app-header-title nowrap">{{title}}</div>
        <div class="dis-flex app-header-button">
            <div @click="windowMini()">
                <svg width="14px" height="2px" viewBox="18 20 14 2" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                    <desc>最小化icon</desc>
                    <defs></defs>
                    <polygon id="minimise" stroke="none" fill-opacity="0.899999976" fill="rgb(4, 29, 16)" fill-rule="evenodd" points="18 20 31.94 20 31.94 22 18 22"></polygon>
                </svg>
            </div>
            <div @click="windowClose()">
                <svg width="12px" height="12px" viewBox="83 10 12 12" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                    <desc>关闭icon</desc>
                    <defs></defs>
                    <polygon id="close" stroke="none" fill-opacity="0.899999976" fill="rgb(4, 29, 16)" fill-rule="evenodd" points="89 14.586 84.414 10 83 11.414 87.586 16 83 20.586 84.414 22 89 17.414 93.586 22 95 20.586 90.414 16 95 11.414 93.586 10"></polygon>
                </svg>
            </div>
        </div>
    </header>
</template>
<style>
    .app-header-title{
        color: rgb(4, 29, 16);
    }
    .app-header{
        /*禁用拖动*/
        -webkit-app-region: drag;
        /*禁用拖动时文本选择*/
        /*-webkit-user-select: none;*/

        justify-content:space-between;
        align-items: center;
        background: rgb(242, 242, 242);
    }
    .app-header-button{
        align-items: center;
    }
    .app-header-button>div{
        cursor: pointer;
        flex-grow: 1;
        text-align: center;
        width: 32px;
        height: 32px;
        line-height: 32px;

        /*启用点击*/
        -webkit-app-region: no-drag;
    }
</style>
<script>
    const {mapState} = require('vuex');

    function sendIpcMain(e, name){
        e.$root.sendIpcMain('ipcRenderer', 'async', {
            name: `window-${name}`, 
            close: e.$root.closeButton
        });
    }

    export default {
        created(){
        },
        data(){
            return {
            };
        },
        computed: mapState({
            title: 'title',
        }),

        methods:{
            windowMini(){
                sendIpcMain(this, 'mini');
            },

            windowClose(){
                sendIpcMain(this, 'close');
            },
            windowMaximiz(){
                return false;
            }
        }
    }

</script>
