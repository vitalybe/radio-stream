const webpack = require('webpack');
const webpackTargetElectronRenderer = require('webpack-target-electron-renderer');

/* eslint strict: 0 */
'use strict';
const baseConfig = require('./webpack.config.base.dev');
const config = Object.create(baseConfig);

config.output.libraryTarget = 'commonjs2';
config.target = webpackTargetElectronRenderer(config);

config.plugins.push(
  new webpack.DefinePlugin({
    '__WEB__': false
  })
);


module.exports = config;
