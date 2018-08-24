<template>
    <div class="container container-header dis-flex">
        <div class="container-status"></div>
        <div class="container-name nowrap name-color">{{containerName}}</div>
        <div class="container-action dis-flex">
            <action-self></action-self>
            <action-other :setName="containerName"></action-other>
        </div>
    </div>
</template>
<style>
    .container-header{
        margin-bottom: 2%;
    }
</style>
<script>

    import actionSelf from './actionSelf.vue';
    import actionOther from './actionOther.vue';

    export default {
        data(){
            return {
                containerName: this.$root.containerHeaderName,
            }
        },
        components:{
            actionSelf,
            actionOther,
        },
    }
</script>
