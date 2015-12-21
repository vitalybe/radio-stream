/* eslint strict: 0 */
'use strict';

const webpack = require('webpack');
const baseConfig = require('./webpack.config.base.production');

const config = Object.create(baseConfig);

module.exports = config;