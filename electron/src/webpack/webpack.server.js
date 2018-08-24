const config = require('../config/config');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config');
const webpackDevServer = require('webpack-dev-server');
let webpackDevServerConfig = config.webpackDevServer;


webpackConfig.plugins.unshift(new webpack.HotModuleReplacementPlugin()); // 加入热替换
webpackConfig.output.publicPath = webpackDevServerConfig.publicPath;

new webpackDevServer(webpack(webpackConfig), {
    publicPath: webpackDevServerConfig.publicPath, // 和webpackConfig.output.publicPath一样
    hot: true,
    inline: true,
    // quiet: true, // lets WebpackDashboard do its thing 静默状态
    stats: {colors: true},
}).listen(webpackDevServerConfig.port, '127.0.0.1', function (error, result) {
    if (error) {
        console.error(error);
    }

    console.log('监听 ' + webpackDevServerConfig.url);
});






// const exec = require('child_process');
// exec.execSync('webpack-dev-server --inline --config ./webpack/webpack.config.js --port 7777 --hot --colors --content-base src/temp ');


// let command = `webpack --config ./src/webpack/webpack.config.js
//  --display-error-details --watch`;
//
//
// exec('webpack-dev-server --help', {}, function (error, stdout, stderr) {
//     // console.log(error, stdout, stderr,1);
// });
//
// console.log(config.color.colorFormat(command));




