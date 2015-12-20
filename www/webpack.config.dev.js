var path = require('path');
var webpack = require('webpack');
var Promise = require('es6-promise').Promise;

var config = require('./webpack.config.base.js')
config.devtool = 'inline-source-map';
config.entry = [
    'webpack-hot-middleware/client',
    './src/index'
];

config.plugins = config.plugins.concat([
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
        __PROD__: false
    })
]);

config.module.loaders.push({
    test: /\.js$/,
    loader: 'babel',
    include: path.join(__dirname, 'src'),
    query: {
        "stage": 0,
        "plugins": ["react-transform", "jsx-control-statements/babel"],
        "extra": {
            "react-transform": {
                "transforms": [{
                    "transform": "react-transform-hmr",
                    "imports": ["react"],
                    "locals": ["module"]
                }, {
                    "transform": "react-transform-catch-errors",
                    "imports": ["react", "redbox-react"]
                }]
            }
        }
    }
});

module.exports = config;