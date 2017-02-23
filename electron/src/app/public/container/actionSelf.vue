<template>
    <div class="container-action-self">
        <button @click="$parent.$parent.containerCommand('up', containerName)" class="hvr-pop container-button">启动</button>
        <button @click="$parent.$parent.containerCommand('restart', containerName)" class="hvr-pop container-button">重启</button>
        <button @click="$parent.$parent.containerCommand('stop', containerName)" class="hvr-pop container-button">停止</button>
        <button @click="$parent.$parent.containerCommand('build', containerName)" class="hvr-pop container-button">构建</button>
    </div>
</template>
<script>
    export default{
        props:{
            containerName:{
                type: String,
                'default': '',
            }
        },
    }
</script>
