/* eslint strict: 0 */
'use strict';
const webpack = require('webpack');
const path = require('path');

module.exports = {
  // Allow to access the name of the executing module
  context: __dirname,
  node: {
    __filename: true
  },
  module: {
    loaders: [
      {test: /\.less$/, loader: "style!css!less"},
      {test: /\.css/, loader: "style!css"},
      {test: /\.(png|jpg|gif)$/, loader: 'url?limit=25000'},
      {test: /\.woff(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&mimetype=application/font-woff"},
      {test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&mimetype=application/font-woff"},
      {test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&mimetype=application/octet-stream"},
      {test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: "file"},
      {test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&mimetype=image/svg+xml"}
    ]
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  resolve: {
    extensions: ['', '.js', '.jsx'],
    packageMains: ['webpack', 'browser', 'web', 'browserify', ['jam', 'main'], 'main'],

    root: [
      path.resolve('./app')
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      _: "lodash"
    })
  ],
  externals: [
    // put your node 3rd party libraries which can't be built with webpack here (mysql, mongodb, and so on..)
  ]
};