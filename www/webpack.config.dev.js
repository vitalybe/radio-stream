var path = require('path');
var webpack = require('webpack');
var Promise = require('es6-promise').Promise;

module.exports = {
    devtool: 'inline-source-map',
    entry: [
        'webpack-hot-middleware/client',
        './src/index'
    ],
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'bundle.js',
        publicPath: '/'
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin(),
        new webpack.ProvidePlugin({
            _: "lodash",
        })
    ],
    context: __dirname,
    node: {
        __filename: true
    },
    module: {
        loaders: [
            { test: /\.less$/, loader: "style!css!less" },
            { test: /\.css/, loader: "style!css" },
            { test: /\.(png|jpg|gif)$/, loader: 'url?limit=25000' },
            {
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
            }
        ]
    }
};
