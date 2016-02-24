/* eslint strict: 0 */
'use strict';
const webpack = require('webpack');

const baseConfig = require('./webpack.config.base.prod');
const config = Object.create(baseConfig);

config.output.publicPath = '/';

config.plugins.push(
  new webpack.DefinePlugin({
    '__WEB__': true
  })
);


module.exports = config;
