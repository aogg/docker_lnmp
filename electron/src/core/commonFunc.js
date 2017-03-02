


module.exports = {


    /**
     * 异步任务的队列
     *
     * @returns {Function}
     */
    queueAsync(){
        let i = 0;
        let tempCallback = null;

        return function (callback, once = false) {
            tempCallback = callback;
            let call = function(func, bool = false){
                if (i > 0 && (i < 2 || bool)){
                    tempCallback(func);
                }
            },func = function(){
                if (i > 1 && once){
                    i = 1;
                }else{
                    --i;
                }
                call(func, true);
            };
            ++i;
            call(func);
        };
    },


    /**
     * 获取data的属性proto
     */
    getObjectProto(data, proto, defaultData = ''){
        proto = (typeof proto === 'string'? proto.split('.') :proto) || [];
        if (data && typeof data === 'object' && proto.length){
            let first = proto.shift();
            if (Reflect.has(data, first)){
                return this.getObjectProto(data[first], proto);
            }else{
                return defaultData;
            }
        }
        
        return data;
    },
    setObjectProto(data, proto, value){
        let bool = this.isObject(data);
        if (!proto && bool && this.isObject(value)){ // 直接合并
            return Object.assign(data, value);
        }

        proto = (typeof proto === 'string'? proto.split('.') :proto) || [];
        if (bool && proto.length){
            let first = proto.shift();
            
            if (proto.length){ // 最后
                data[first] = this.setObjectProto(data[first] || {}, proto, value);
            }else{
                data[first] = value;
            }
        }

        return data;
    },


    /**
     * 递归何必对象
     */
    objectMergeRecursive(source, target, options = {}){
        if (options.recursive || this.isObject(source) && this.isObject(target)){
            options = Object.assign({recursive: true}, options);
            for (let key in target){
                if (!options.objectCover && this.isObject(source[key]) && this.isObject(target[key])){ // 递归对象
                    source[key] = this.objectMergeRecursive(source[key], target[key], options);
                }else if (
                    (options.arrayEmptyCover || options.arrayCover) &&
                    Array.isArray(source[key]) && Array.isArray(target[key])
                ){ // 追加数组
                    source[key] = source[key].concat(target[key]);
                }else{
                    source[key] = target[key];
                }

            }
        }

        return source;
    },

    isObject(data){
        return data && typeof data === 'object';
    },


    /**
     * 递归判断对象是否存在指定的多个属性
     *
     * @param args
     * @returns {*}
     */
    isRePropertyObject(...args){
        let length = args.length,
            first = args.shift();
        if (length < 2) {
            return first != undefined;
        }

        if (typeof first !== 'object') {
            return false;
        }

        let key = args.shift();

        if (!key || !first.hasOwnProperty(key)) {
            return false;
        }

        return this.isRePropertyObject(first[key], ...args);
    },


    pointString(str){
        let arr = [];
        for (let i=0; i < str.length; i++){
            arr[i] = str.codePointAt(i);
        }

        return "\\u"+arr.join("\\u");
    },

    atString(str) {
        return String.fromCodePoint(...str.split("\\u"));
    },

    // 转译为实体
    html2Escape(str){
        let map = {
            '<':'&lt;',
            '>':'&gt;',
            // '&':'&amp;',
            '"':'&quot;',
            "'": "\'", // &apos;无效
        };
        return (str && String(str).replace(
            /[<>&"']/g, 
            (m) => {
                return map[m]
            }
        )) || '';
    },


    /**
     * 预定义一个Map对象
     * @returns {Function}
     */
    mapData(){
        let data = new Map();
        // proxy，的key不能是一个对象
        return {
            getData(key){
                return data.get(key);
            },
            setData(key, value){
                return data.set(key, value);
            },
            deleteData(key){
                return data.delete(key);
            }
        }
    },
};

