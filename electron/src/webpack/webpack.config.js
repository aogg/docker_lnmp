// webpack.config.js
const config = require(__dirname + '/../config/config.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const webpack = require('webpack');
const Path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

global.config = config; // 解决nodeStorage

let webpackConfig = {};
webpackConfig = {
    mode: 'development', // production, development
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
        // `loaders` is an array of loaders to use.
        // here we are only configuring vue-loader
        rules: [
            {
                test: /\.vue$/, // a regex for matching all files that end in `.vue`
                use: 'vue-loader',   // loader to use for matched files
            },
            {
                "test": /\.css$/,
                "use": [
                    MiniCssExtractPlugin.loader,
                    // "vue-style-loader",
                    "css-loader"
                ],
            },
            { // 不知为何<% %>解析不了
                "test": /\.html$/,
                "use": "vue-html-loader",
            },
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader',
                    options: { // 使用babel，省去.babelrc
                        // enable stage 0 babel transforms.
                        presets: ['env', 'stage-0'],
                        plugins: ['transform-runtime']
                    }
                },
                exclude: /(node_modules|bower_components)/,
            }
        ]
    },
    resolve:{
        modules: [
            config.rootPath + '/node_modules',
            config.srcPath + '/node_modules'
        ],
        extensions: ['.js', '.vue', '.json', '.css'],
        alias : {
            appMain:"/temp/appMain.js",
            'vue$': 'vue/dist/vue.min.js', // electron/node_modules/vue/dist/README.md
            'vue-router$': 'vue-router/dist/vue-router.min.js',
            appDir: config.srcPath + '/app', // unused
        }
    },
    // resolveLoader: {
    //     modules: [
    //         Path.join(config.rootPath, 'node_modules')
    //     ],
    //     extensions: ['.js', '.vue', '.json', '.css'],
    // },
    devServer:{ // 木有用，直接在server.js中另写了
        hot: true,
        inline: true,
    },
    plugins:[
        new MiniCssExtractPlugin({ // 将css都放到appMain.css中
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: "[name].css",
            chunkFilename: "[id].css"
        }),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"'+webpackConfig.mode+'"'
            }
        }),
        new VueLoaderPlugin(),
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

module.exports = webpackConfig;


if (process.env.NODE_ENV === 'production') {
    module.exports.devtool = '#source-map';
    // http://vue-loader.vuejs.org/en/workflow/production.html
    module.exports.plugins = (module.exports.plugins || []).concat([
        // new webpack.optimize.UglifyJsPlugin({
        //     compress: {
        //         warnings: false
        //     }
        // })
    ])
}