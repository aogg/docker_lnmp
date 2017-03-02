const fs = require('fs');
const commonFunc = require('./commonFunc');
const Counter = require('./counter');
let CounterClass = new Counter('nodeStorage');

let options = {
    encoding: 'utf8',
    flag: 'r',
},
    queue = commonFunc.queueAsync(),
    data = {};




try{
    data = fs.readFileSync(config.nodeStoragePath, options);
    data = (data && JSON.parse(data)) || {};
}catch(error){
    throw `${config.nodeStoragePath}文件不是正确的json文件或没有读取权限`;
}

options.flag = 'w+'; // 前面不需要写入


module.exports = {
    getItem(proto, defaultData = ''){
        return commonFunc.getObjectProto(data, proto, defaultData);
    },
    setItem(proto, value){
        proto = (typeof proto === 'string'? proto.split('.') : proto) || [];
        if (proto[0]){
            CounterClass.update(proto[0]); // 只处理一层
            data = commonFunc.setObjectProto(data, proto, value);

            queue(function (func) {
                fs.writeFile(
                    config.nodeStoragePath,
                    1 ? JSON.stringify(data, null, '\t') : JSON.stringify(data), // 是否美化json
                    options,
                    function () {
                        func();
                        func = null;
                    }
                );
            }, true);
        }
    },
    // 判断返回值是否相等
    isUpdate(symbolValue, key){
        return CounterClass.isUpdate(symbolValue, key);
    },
    getUpdate(key){
        return CounterClass.getUpdate(key);
    }
};