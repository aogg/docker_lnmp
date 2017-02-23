const config = require('../config/config');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config');
const webpackDevServer = require('webpack-dev-server');
let webpackDevServerConfig = config.webpackDevServer;


webpackConfig.entry.appMain.push('webpack/hot/dev-server', `webpack-dev-server/client?${webpackDevServerConfig.url}`);
webpackConfig.plugins.unshift(new webpack.HotModuleReplacementPlugin());
webpackConfig.output.publicPath = webpackDevServerConfig.publicPath;

new webpackDevServer(webpack(webpackConfig), {
    publicPath: webpackDevServerConfig.publicPath,
    hot: true,
    inline: true,
    stats: {colors: true},
}).listen(webpackDevServerConfig.port, function (error, result) {
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




