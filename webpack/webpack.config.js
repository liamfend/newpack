const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const webpack = require('webpack')
const WebpackBar = require('webpackbar')
const babelPlugins = require('./plugins')
const jsonImporter = require('node-sass-json-importer')
// const CompressionPlugin = require("compression-webpack-plugin");
const TerserPlugin = require('terser-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
// const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const postcssNormalize = require('postcss-normalize')
const safePostCssParser = require('postcss-safe-parser')
const getCSSModuleLocalIdent = require('./getCSSModuleLocalIdent')
// publicPath: "/assets/",

const cssRegex = /\.css$/
const cssModuleRegex = /\.module\.css$/
const sassRegex = /\.(scss|sass)$/
const lessRegex = /\.less$/
const sassModuleRegex = /\.module\.(scss|sass)$/

module.exports = function (webpackEnv) {
  const appBase = process.cwd()
  const appOutputBuild = path.resolve(appBase, 'build')
  const appSrcJs = path.resolve(appBase, 'src/index')
  const appSrc = path.resolve(appBase, 'src')
  const appCssImg = path.resolve(appBase, 'src/css/imgs')
  const appPublic = path.resolve(appBase, 'public')
  const appHtmlTemp = path.resolve(appBase, 'public/index.html')
  const isEnvProduction = webpackEnv.production
  const isEnvDevelopment = webpackEnv.development // 还有本地 ci 线上ci 等等。。 所以不可以用！isEnvProduction
  const isEnvProductionProfile = isEnvProduction && process.argv.includes('--profile')
  const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== 'false'
  const imageInlineSizeLimit = parseInt(process.env.IMAGE_INLINE_SIZE_LIMIT || '10000')

  const getStyleLoaders = (cssOptions, preProcessor, preProcessorOption) => {
    const loaders = [
      isEnvDevelopment && require.resolve('style-loader'),
      isEnvProduction && {
        loader: MiniCssExtractPlugin.loader,
        options: { publicPath: '../../' },
        // options: paths.publicUrlOrPath.startsWith('.')
        //   ? { publicPath: '../../' }
        //   : {},
      },
      {
        loader: require.resolve('css-loader'),
        options: cssOptions,
      },
      {
        loader: require.resolve('postcss-loader'),
        options: {
          postcssOptions: {
            plugins: [
              require('postcss-flexbugs-fixes'),
              require('postcss-preset-env')({
                autoprefixer: {
                  flexbox: 'no-2009',
                },
                stage: 3,
              }),
              postcssNormalize(),
            ],
          },
        },
      },
    ].filter(Boolean)
    if (preProcessor) {
      loaders.push(
        {
          loader: require.resolve('resolve-url-loader'),
          options: {
            sourceMap: isEnvProduction ? true : isEnvDevelopment,
            root: appCssImg,
            //debug:isEnvDevelopment
          },
        },
        {
          loader: require.resolve(preProcessor),
          options: Object.assign({ sourceMap: true }, preProcessorOption),
        },
      )
    }
    return loaders
  }

  return {
    stats: 'minimal',
    mode: isEnvProduction ? 'production' : isEnvDevelopment && 'development',
    bail: isEnvProduction,
    devtool: isEnvProduction ? 'source-map' : isEnvDevelopment && 'cheap-module-source-map',
    entry: appSrcJs,
    output: {
      path: isEnvProduction ? appOutputBuild : undefined,
      pathinfo: isEnvDevelopment,
      filename: isEnvProduction
        ? 'static/js/[name].[contenthash:8].js'
        : isEnvDevelopment && 'static/js/bundle.[name].js',
      publicPath: '/',
      devtoolModuleFilenameTemplate: isEnvProduction
        ? info => path.relative(appSrc, info.absoluteResourcePath).replace(/\\/g, '/')
        : isEnvDevelopment && (info => path.resolve(info.absoluteResourcePath).replace(/\\/g, '/')),
      chunkFilename: isEnvProduction
        ? 'static/js/[name].[contenthash:8].chunk.js'
        : isEnvDevelopment && 'static/js/[name].chunk.js',
    },
    optimization: {
      minimize: isEnvProduction,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            parse: {
              ecma: 8,
            },
            compress: {
              ecma: 5,
              warnings: false,
              comparisons: false,
              inline: 2,
            },
            mangle: {
              safari10: true,
            },
            keep_classnames: isEnvProductionProfile,
            keep_fnames: isEnvProductionProfile,
            output: {
              ecma: 5,
              comments: false,
              ascii_only: true,
            },
          },
          // sourceMap: shouldUseSourceMap,
        }),
        new CssMinimizerPlugin(),
      ],
      splitChunks: {
        chunks: 'all',
        //  name: isEnvDevelopment ? 'bundle' : false,
      },
      runtimeChunk: {
        name: entrypoint => `runtime-${entrypoint.name}`,
      },
    },
    module: {
      rules: [
        {
          oneOf: [
            {
              test: [/\.avif$/],
              loader: require.resolve('url-loader'),
              options: {
                limit: imageInlineSizeLimit,
                mimetype: 'image/avif',
                name: 'static/media/[name].[hash:8].[ext]',
              },
            },
            {
              test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
              loader: require.resolve('url-loader'),
              options: {
                limit: imageInlineSizeLimit,
                name: 'static/media/[name].[hash:8].[ext]',
              },
            },
            {
              test: /\.(js|jsx)$/,
              include: appSrc,
              exclude: /(node_modules)/,
              loader: require.resolve('babel-loader'),
              options: {
                presets: ['@babel/preset-env', '@babel/preset-react'],
                plugins: [...babelPlugins.plugins],
              },
            },
            {
              test: cssRegex,
              exclude: cssModuleRegex,
              use: getStyleLoaders({
                importLoaders: 1,
                sourceMap: isEnvProduction ? shouldUseSourceMap : isEnvDevelopment,
              }),
              sideEffects: true,
            },
            {
              test: cssModuleRegex,
              use: getStyleLoaders({
                importLoaders: 1,
                sourceMap: isEnvProduction ? shouldUseSourceMap : isEnvDevelopment,
                modules: {
                  getLocalIdent: getCSSModuleLocalIdent,
                },
              }),
            },
            {
              test: lessRegex,
              use: getStyleLoaders(
                {
                  importLoaders: 3,
                  sourceMap: isEnvProduction ? shouldUseSourceMap : isEnvDevelopment,
                },
                'less-loader',
                {
                  lessOptions: {
                    javascriptEnabled: true,
                    math: 'always',
                  },
                },
              ),
              sideEffects: true,
            },
            {
              test: sassRegex,
              exclude: sassModuleRegex,
              use: getStyleLoaders(
                {
                  importLoaders: 3,
                  sourceMap: isEnvProduction ? shouldUseSourceMap : isEnvDevelopment,
                },
                'sass-loader',
              ),
              sideEffects: true,
            },
            {
              test: sassRegex,
              exclude: sassModuleRegex,
              use: getStyleLoaders(
                {
                  importLoaders: 3,
                  sourceMap: isEnvProduction ? shouldUseSourceMap : isEnvDevelopment,
                },
                'sass-loader',
              ),
              sideEffects: true,
            },
            {
              test: /\.yml$/,
              use: ['file-loader?name=[name].json', 'yaml-loader'],
              include: path.resolve(appSrc, 'resources/translations'),
            },
            {
              loader: require.resolve('file-loader'),
              exclude: [/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/, /\.bin$/, /^$/],
              options: {
                name: 'static/media/[name].[hash:8].[ext]',
              },
            },
          ],
        },
      ],
    },
    resolve: {
      alias: {
        '@pages': path.resolve(appBase, 'src/pages'),
      },
      fallback: {
        util: require.resolve('util/'),
      },
    },
    devServer: isEnvDevelopment && {
      port: 3000,
      contentBase: appPublic, // boolean | string | array, static file location
      publicPath: '/',
      compress: true, // enable gzip compression
      historyApiFallback: true, // true for index.html upon 404, object for multiple paths
      hot: true, // hot module replacement. Depends on HotModuleReplacementPlugin
      https: false, // true for self-signed, object for cert authority
      noInfo: true, // only errors & warns on hot reload
    },
    plugins: [
      new WebpackBar(),
      isEnvProduction && new CleanWebpackPlugin(),
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
            : undefined,
        ),
      ),
      isEnvProduction &&
        new CopyPlugin({
          patterns: [
            {
              from: appPublic,
              to: appOutputBuild,
              globOptions: {
                ignore: ['**/index.html'],
              },
            },
          ],
          options: {
            concurrency: 100,
          },
        }),
      //  isEnvProduction &&
      new MiniCssExtractPlugin({
        filename: 'static/css/[name].[contenthash:8].css',
        chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
      }),
    ].filter(Boolean),
  }
}
