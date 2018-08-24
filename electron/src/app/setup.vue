<template>
    <div id="setup">
        <setup-left></setup-left>
        <setup-content :container-name="containerName"></setup-content>
    </div>
</template>
<style>
#setup{
    display: flex;
}
</style>
<script>

    import setupLeft from './public/setup/setup-left.vue';
    import setupContent from './public/setup/setup-content.vue';

    export default{
        beforeCreate(){
            window['onresize'] = function (event) {
                localStorage.setItem('setup-outerHeight', window.outerHeight);
                localStorage.setItem('setup-outerWidth', window.outerWidth);
            }
        },
        created(){
            this.$root.closeButton = true;
        },
        data(){
            return{
                containerHeaderName : this.$root.containerHeaderName,
                name: location.hash || '',
                msg:'hello vue'
            }
        },
        computed:{
            containerName: {
                get: function () {
                    return this.name.split('/').slice(0, 3).join('/');
                },
                set: function (val) {
                    this.name = (val || '');
                }
            }
        },
        components:{
            setupLeft,
            setupContent
        }
    }
</script>
