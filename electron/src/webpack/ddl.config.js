const config = require(__dirname + '/../config/config.js');
const webpack = require('webpack');





module.exports = {
    output:{
        path: `${config.tempPath}/dll`,
        filename:'[name].js',
        library:'[name]',
    },
    entry:{
        "lib":[
            "vue",
        ]
    },
    plugins:[
        new webpack.DllPlugin({
            path: `${config.tempPath}/manifest.json`,
            name:'[name]', // 这里的name为entry的key
            context: __dirname,
        }),
    ]
};





