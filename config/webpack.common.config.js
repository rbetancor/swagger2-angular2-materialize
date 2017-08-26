/**
 * Webpack common configuration
 * Created by mdesigaud on 16/11/2016.
 */
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var helpers = require('./helpers');

module.exports = {
    entry: {
        'vendor': './src/app/vendor.ts',
        'app': './src/app/boot.ts'
    },

    resolve: {
        extensions: ['*','.ts', '.js']
    },

    module: {
        rules: [// Generate source map for debugging
        {
            enforce: 'pre',
            test: /\.js$/,
            use: [{
                loader: 'source-map-loader'
            }],
            exclude: [helpers.root('./node_modules/rxjs'), helpers.root('./node_modules/jquery'), helpers.root('./node_modules/@angular/compiler')]
        }, {
            test: /\.ts$/,
            use: [{
                loader: 'awesome-typescript-loader'
            }, {
                loader: 'angular2-template-loader'
            }],
            exclude: [/\.(spec|e2e)\.ts$/]
        }, {
            test: /\.html$/,
            use: [{
                loader: 'html-loader'
            }]
        }, {
            test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
            use: [{
                loader: 'file-loader',

                options: {
                    name: 'assets/[name].[hash].[ext]'
                }
            }]
        }, {
            test: /\.css$/,
            exclude: helpers.root('src', 'app'),
            use: ExtractTextPlugin.extract({
                fallback: 'style-loader',
                use: 'css-loader'
            })
        }, {
            test: /\.css$/,
            include: helpers.root('src', 'app'),
            use: [{
                loader: 'raw-loader'
            }]
        }, {
            test: /materialize-css\/bin\//,
            use: [{
                loader: 'imports-loader',

                options: {
                    jQuery: 'jquery, $'
                }
            }]
        }]
    },

    plugins: [
        new webpack.optimize.CommonsChunkPlugin({name: ['app', 'vendor']}),
        new HtmlWebpackPlugin({template: 'src/index.html'}),
        new webpack.ProvidePlugin({
            "$":'jquery',
            "jQuery":'jquery',
            "window.jQuery": "jquery",
            "root.jQuery": "jquery"
        })
    ]
};
