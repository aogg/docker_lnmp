<template>
    <div id="setup-left" class="name-color">
        <ul id="setup-left-ul" class="dis-flex" @click="liClick">
            <li :data-id="'#/setup/' + this.$parent.containerHeaderName" class="nowrap">
                <a :ref="this.$parent.containerHeaderName" :title="this.$parent.containerHeaderName" :href="`#/setup/${this.$parent.containerHeaderName}`">{{this.$parent.containerHeaderName}}</a>
            </li>
            <li v-for="item in this.$root.containers" :data-id="'#/setup/' + item">
                <a :ref="item" :title="item" :href="'#/setup/' + item">{{item}}</a>
            </li>
        </ul>
    </div>
</template>
<style>
    #setup-left{
        flex-grow: 0;
        flex-basis: 10%;
    }
    #setup-left-ul{
        flex-direction: column;
    }
    #setup-left-ul li>a{
        display: block;
        padding: 12%;
    }
    #setup-left-ul li{
        flex-grow: 1;
        flex-shrink: 1;
    }
    #setup-left-ul li:hover{
        background: #465983;
    }
    #setup-left-ul li[data-selected="1"]{
        background: rgb(27, 128, 178);
    }
</style>
<script>
    export default{
        mounted(){ // 编译后
            // todo 应改为this.$refs
            let a = this.$el.querySelectorAll(`a[href="${this.$parent.containerName}"]`)[0];
            a && a.click(); // a触发click
        },
        data(){
            return{
                msg:'hello vue',
            }
        },
        methods:{
            liClick(event){
                if (event.target.tagName === 'A') {
                    let li = event.target.parentNode;
                    (new Set(li.parentNode.getElementsByTagName('LI'))).forEach((val) => {
                        if (li.isEqualNode(val)) {
                            val.getAttribute('data-selected') < 1 && val.setAttribute('data-selected', 1); // data-selected存在字符串的0
                        }else if(val.getAttribute('data-selected') == 1){
                            val.setAttribute('data-selected', 0);
                        }
                    });

                    this.$set(this.$parent, 'containerName', li.getAttribute('data-id'));
                }
            },
        },
        components:{

        }
    }
</script>
