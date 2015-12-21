var path = require('path');
var webpack = require('webpack');

var config = require('./webpack.config.base.js')
config.devtool = 'inline-source-map';
config.entry = './app/index';

config.output.publicPath = '../dist/';

config.plugins = config.plugins.concat([
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      },
      __PROD__: true
    }),
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false
      }
    })
]);

config.module.loaders.push({
    test: /\.js$/,
    loader: 'babel',
    include: path.join(__dirname, 'app'),
    query: {
    "stage": 0,
    "plugins": ["jsx-control-statements/babel"]
    }
});

module.exports = config;