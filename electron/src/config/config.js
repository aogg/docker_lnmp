const Path = require('path');

// 已配置为全局对象
let config = {
    appDev: 0, // 是否开发模式webpack-dev-server
    electorn_devtron: 1, // 开启devtron工具
    openDevTools: 0, // 是否开启开发者工具
    dockerNodeCommandLog: false, // 执行docker命令之后的console.log是否显示在命令行中
    processExecCommandLog: false, // 执行命令的console.log是否显示在命令行中



    nodeStorage(){
        return require('../core/nodeStorage');
    },


    get title(){ // 软件标题
        return this.nodeStorage().getItem('app-title') || 'docker_lnmp';
    },


    BrowserWindow:{
        width: 500, height: 195,
        get title(){
            return config.title;
        },
        backgroundColor: '#3C3F41', // 和body颜色要保持一致
        useContentSize: true,
        webPreferences:{
            devTools: true  // 是否允许使用F12
        },
        maximizable: false, // 不能最大化
        // resizable: false, // 是否可调整大小
        fullscreen:false, // 是否允许全屏
        // 是否显示菜单栏，无边框
        // transparent: true, // 透明
        frame: false,
        show: true, // 是否显示
    },
    get nodeStoragePath(){
        return Path.join(this.srcPath, './config/nodeStorageJson.json');
    },

    
    
    
    rootPath: Path.join(__dirname, '../..'),
    indexHtmlSuf:'.html',
    get indexHtmlName(){
        return 'index' + this.indexHtmlSuf;
    },
    get srcPath(){
        return this.rootPath + '/src';
    },
    get tempPath(){
        return this.srcPath + '/temp';
    },
    get indexHtmlPath(){ // 编译后index.html放在哪
        return Path.join(this.tempPath, this.indexHtmlName);
    },
    get indexHtmlPathSource(){
        let fullPath;
        [this.indexHtmlSuf, suf] = ['.ejs', this.indexHtmlSuf]; // ejs模板文件可用于HtmlWebpackPlugin的模板传参
        fullPath = Path.join(this.rootPath, this.indexHtmlName);
        this.indexHtmlSuf = suf;

        return fullPath;
    },
    /**
     * 根据是否开发模式使用webpack-dev-server
     * @param fileBool 是否返回file协议
     * @returns {string}
     */
    mainLoadUrl(fileBool = true){
        let url, indexHtmlPath;
        if (this.appDev) {
            url = this.webpackDevServer.url + this.webpackDevServer.publicPath + this.indexHtmlName;
        } else {
            url = fileBool ? `file://${this.indexHtmlPath}` : this.indexHtmlPath;
        }

        return url;
    },


    // webpack-dev-server
    webpackDevServer:{
        publicPath: '/', // 在url的根目录
        port: 7777,
        host:'localhost',
        get url(){
            return 'http://' + this.host + ':' + this.port + '/';
        }
    },


    // console颜色
    color:{
        dockerColor: '\x1b[34m',
        webpackColor: '\x1b[33m',
        electronColor: '\x1b[32m',
        endColor: '\x1b[0m',
        commandAfterSpace:'  ',
        /**
         *
         * @param command
         * @param type  返回命令名称
         * @param local 自定义颜色
         * @returns {string}
         */
        colorFormat (command, type = 0, local = '') {
            command = command.toString().trim();
            let startCommand = command.split(/\s+/, 1),
                color = '',
                colorFunc = (command, color) =>  color?`${color}${command}${this.endColor}`:command,
                space = this.commandAfterSpace;

            if (local) { // todo 可添加去除前缀功能
                color = local
            } else {
                color = this.hasOwnProperty(startCommand + 'Color') ? this[startCommand + 'Color'] : '';
            }

            if (type == 1) { // 全部命令都是改变颜色
                return colorFunc(command, color) + '\n';
            } else { // 提取命令名称并改变颜色
                return colorFunc(startCommand, color) + space + command.replace(/\n/g, '\n' + ' '.repeat(startCommand.length + space.length)) + '\n';
            }

        }
    }
};


module.exports = config;