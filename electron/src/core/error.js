let msg = '';



class Error{

    // static msg = '';

    static hasError(){
        return !!Error.msg;
    }

    static getError(){
        return Error.msg;
    }

    static setError(msg){
        Error.msg = msg;
    }
}

// es6只有静态方法，没有静态属性
Error.msg = '';

module.exports = Error;

