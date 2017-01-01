/* eslint strict: 0 */
'use strict';

const webpack = require('webpack');
const baseConfig = require('./webpack.config.base');
const path = require('path');

const config = Object.create(baseConfig);

config.debug = true;

config.devtool = 'inline-source-map';

config.entry = [
  'webpack-hot-middleware/client?path=http://localhost:3000/__webpack_hmr',
  'babel-polyfill',
  './app/index'
];

config.output.publicPath = 'http://localhost:3000/dist/';

config.module.loaders.push({
  test: /\.js$/,
  loader: 'babel',
  include: path.join(__dirname, 'app')
});

config.plugins.push(
  new webpack.HotModuleReplacementPlugin(),
  new webpack.NoErrorsPlugin(),
  new webpack.DefinePlugin({
    '__PROD__': false,
    'process.env': {
      'NODE_ENV': JSON.stringify('development')
    }
  }));

module.exports = config;