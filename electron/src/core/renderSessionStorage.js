


// 如果改成Proxy应该可以保证onStorage事件触发
class renderSessionStorage{


    constructor() {
        let tempData = {};
        this.key = 'renderSession';
        this.startTime = window.appStartTime;
        try{
            tempData = JSON.parse(localStorage.getItem(this.key));
        }catch (e){
        }

        this.data = Object.assign({
            data: {},
            time: this.startTime,
        }, tempData || {});

        if (this.data.time !== this.startTime){ // 不是一次打开
            this.clear();
        }
    }

    getItem(key){
        return this.data.data[key];
    }

    setItem(key, value){
        if (key === null){ // 清空
            this.data.data = (value || {});
        }else{ // 赋值
            this.data.data[key] = value;
        }

        localStorage.setItem(this.key, JSON.stringify(this.data));

        return this;
    }

    clear(){
        return this.data = {
            data: {},
            time: this.startTime,
        },
            this.setItem(null, {}), this;
    }

}




// export default new renderSessionStorage();
module.exports = new renderSessionStorage();
