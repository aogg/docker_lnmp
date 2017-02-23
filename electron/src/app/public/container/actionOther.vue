<template>
    <div class="container-action-other">
        <button @click="$parent.$parent.setup(setName)" class="hvr-pop container-button">设置</button>
        <button @click="$parent.$parent.containerAction('monitor', containerName)" class="hvr-pop container-button">监听</button>
        <button @click="$parent.$parent.containerAction('log', containerName)" class="hvr-pop container-button">日志</button>
        <button @click="$parent.$parent.containerAction('exec', containerName)" v-show="containerName" class="hvr-pop container-button">进入</button>
    </div>
</template>
<script>
    export default{
        props:{
            containerName:{
                type: String,
                'default': '',
            },
            setName:{
                type: String,
                'default': function () {
                    return this.containerName
                },
            }
        },
    }
</script>
