// webpack.config.js
const config = require(__dirname + '/../config/config.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const Path = require('path');
global.config = config; // 解决nodeStorage


module.exports = {
    devtool: '#cheap-module-eval-source-map', // 用生成环境（production supported）为no的可以不显示黄色警告
    // devtool: '#source-map', // 最好的错误提示
    target: 'electron-renderer', // 可以直接require('electron')，而不必window.require('electron')
    // entry point of our application
    entry: {
        appMain: [config.srcPath + '/appMain.js'],
    },
    // where to place the compiled bundle
    output: {
        path: Path.dirname(config.indexHtmlPath), // 和config.mainLoadUrl关联
        filename: '[name].js'
    },
    module: {
        preLoaders: [],
        // `loaders` is an array of loaders to use.
        // here we are only configuring vue-loader
        loaders: [
            {
                test: /\.vue$/, // a regex for matching all files that end in `.vue`
                loader: 'vue-loader',   // loader to use for matched files
                exclude: /node_modules/,
            },
            {
                "test": /\.css?$/,
                "loader": "style!css",
                exclude: /node_modules/,
            },
            { // 不知为何<% %>解析不了
                "test": /\.html$/,
                "loader": "vue-html-loader",
                exclude: /node_modules/,
            },
            {
                test: /\.js$/,
                loader:'babel-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve:{
        root : config.srcPath,
        fallback:config.srcPath + '/node_modules',
        extensions: ['', '.js', '.vue', '.json', '.css'],
        alias : {
            appMain:"/temp/appMain.js",
            'vue$': 'vue/dist/vue.js',
        }
    },
    resolveLoader: {
        root: Path.join(config.rootPath, 'node_modules')
    },
    babel: { // 使用babel，省去.babelrc
        // enable stage 0 babel transforms.
        presets: ['es2015', 'stage-0'],
        plugins: ['transform-runtime']
    },
    devServer:{ // 木有用
        hot: true,
        inline: true,
    },
    plugins:[
        new HtmlWebpackPlugin({ // 让index.html内可自动处理编译后的appMain.js
            filename: config.indexHtmlName,
            template: config.indexHtmlPathSource,
            inject: 'body',
            title: config.title,
        }),
        // new webpack.DllReferencePlugin({ // 会报错
        //     name: `${config.tempPath}/dll/lib.js`, // 优先于manifest.name
        //     context: __dirname,
        //     manifest: require(`${config.tempPath}/manifest.json`),
        // }),
    ]
};