/**
 * Webpack test configuration
 * Created by mdesigaud on 17/11/2016.
 */
var helpers = require('./helpers');

module.exports = {
    devtool: 'inline-source-map',

    resolve: {
        extensions: ['*', '.ts', '.js']
    },

    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [{
                    loader: 'awesome-typescript-loader'
                }, {
                    loader: 'angular2-template-loader'
                }]
            },
            {
                test: /\.html$/,
                use: [{
                    loader: 'html-loader'
                }]

            },
            {
                test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
                use: [{
                    loader: 'null-loader'
                }]
            },
            {
                test: /\.css$/,
                exclude: helpers.root('src', 'app'),
                use: [{
                    loader: 'null-loader'
                }]
            },
            {
                test: /\.css$/,
                include: helpers.root('src', 'app'),
                use: [{
                    loader: 'raw-loader'
                }]
            }
        ]
    }
};
