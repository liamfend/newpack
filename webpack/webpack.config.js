const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const webpack = require('webpack');
const WebpackBar = require('webpackbar');
// publicPath: "/assets/",
module.exports = function (webpackEnv) { 
    const appBase = process.cwd()
    const appOutputBuild = path.resolve(appBase, "build")
    const appSrcJs = path.resolve(appBase, "src/index.js")
    const appSrc = path.resolve(appBase, "src")
    const appPublic = path.resolve(appBase, "public")
    const appHtmlTemp = path.resolve(appBase, "public/index.html")

    const isEnvProduction = webpackEnv.production
    const isEnvDevelopment = webpackEnv.development // 还有本地 ci 线上ci 等等。。 所以不可以用！isEnvProduction
    return {
        stats: 'minimal',
        mode: isEnvProduction ? 'production' : isEnvDevelopment && 'development',
        bail: isEnvProduction,
        devtool: isEnvProduction ? "source-map" : isEnvDevelopment && 'cheap-module-source-map',
        entry: appSrcJs,
        output: {
            path: isEnvProduction ? appOutputBuild : undefined,
            pathinfo: isEnvDevelopment,
            filename: isEnvProduction
                ? 'static/js/[name].[contenthash:8].js'
                : isEnvDevelopment && 'static/js/bundle.js',
            publicPath: "",
            devtoolModuleFilenameTemplate: isEnvProduction
                ? info =>
                    path
                        .relative(appSrc, info.absoluteResourcePath)
                        .replace(/\\/g, '/')
                : isEnvDevelopment &&
                (info => path.resolve(info.absoluteResourcePath).replace(/\\/g, '/')),
            chunkFilename: isEnvProduction
                ? 'static/js/[name].[contenthash:8].chunk.js'
                : isEnvDevelopment && 'static/js/[name].chunk.js',
        },
        module: {
            strictExportPresence: true,
            rules: [
                {
                    oneOf: [
                        {
                            test: /\.(js|jsx)$/,
                            exclude: /(node_modules)/,
                            loader: require.resolve('babel-loader'),
                            options: {
                                presets: ['@babel/preset-env', "@babel/preset-react"]
                            }
                        },
                        // {
                        //     loader: require.resolve('file-loader'),
                        //     // Exclude `js` files to keep "css" loader working as it injects
                        //     // its runtime that would otherwise be processed through "file" loader.
                        //     // Also exclude `html` and `json` extensions so they get processed
                        //     // by webpacks internal loaders.
                        //     exclude: [/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
                        //     options: {
                        //       name: 'static/media/[name].[hash:8].[ext]',
                        //     },
                        //   },
                    ]
                }

            ]
        },
        devServer: {
            // proxy: { // proxy URLs to backend development server
            //     '/api': 'http://localhost:3000'
            // },
            port: 3000,
            contentBase: appPublic, // boolean | string | array, static file location
            compress: true, // enable gzip compression
            historyApiFallback: true, // true for index.html upon 404, object for multiple paths
            hot: true, // hot module replacement. Depends on HotModuleReplacementPlugin
            https: false, // true for self-signed, object for cert authority
            noInfo: true, // only errors & warns on hot reload 
        },
        plugins: [
            new WebpackBar(),
            new CleanWebpackPlugin(),
            new HtmlWebpackPlugin(
                Object.assign(
                    {},
                    {
                        inject: true,
                        template: appHtmlTemp,
                    },
                    isEnvProduction
                        ? {
                            minify: {
                                removeComments: true,
                                collapseWhitespace: true,
                                removeRedundantAttributes: true,
                                useShortDoctype: true,
                                removeEmptyAttributes: true,
                                removeStyleLinkTypeAttributes: true,
                                keepClosingSlash: true,
                                minifyJS: true,
                                minifyCSS: true,
                                minifyURLs: true,
                            },
                        }
                        : undefined
                )
            ),
        ]
    }

}