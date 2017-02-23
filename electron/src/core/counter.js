// 计数器，可用于判断对象是否更新

let data = {};
let emptySymbol = Symbol('Counter'); // 第一次获取数据时

class Counter {
    constructor(name) {
        this.name = name;
        data[name] || (data[name] = {});
    }

    symbol(key = ''){ // 不能是数组
        return Symbol(this.name);
        // return Symbol(key?{key, [this.name]:data[this.name][key]}:{[this.name]:data[this.name]});
    }

    // 获取symbolValue
    getUpdate(key = ''){
        return (key ? data[this.name][key] : data[this.name]) || emptySymbol;
    }

    // 执行更新
    update(key = '') {
        if (key) {
            data[this.name][key] = this.symbol(key);
        } else {
            data[this.name] = this.symbol();
        }

        return this;
    }

    // 判断是否更新，true为已更新
    isUpdate(symbolValue, key = ''){
        if (!symbolValue || typeof symbolValue !== 'symbol'){
            return true;
        }


        return key ? (
                data[this.name][key] && data[this.name][key] !== symbolValue
            ) : (
                data[this.name] && data[this.name] !== symbolValue
            );
    }
}

module.exports = Counter;