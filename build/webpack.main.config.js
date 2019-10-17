const os = require('os');
const webpack = require('webpack');
const merge = require('webpack-merge');
const HappyPack = require('happypack');
const { VueLoaderPlugin } = require('vue-loader');
const { resolve, getConfig } = require('../utils');

const webpackConfig = getConfig().webpack || {};
const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length });

const baseConfig = {
  output: {
    path: resolve('dist'),
    publicPath: '/dist/',
    filename: '[name].[chunkhash].js',
  },
  resolve: {
    modules: [resolve('node_modules')],
    extensions: [
      '.js', '.vue', '.json',
    ],
    alias: {
      '@': resolve('src'),
      static: resolve('static'),
    },
  },
  module: {
    // es6-promise库没有依赖其他包，无需解析
    noParse: /es6-promise\.js$/,
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          compilerOptions: {
            // 使用默认的vue-template-compiler的时候，消除模板标签之间的空格
            preserveWhitespace: false,
          },
        },
        include: resolve('src'),
        exclude: /node_modules/,
      },
      {
        test: /\.js$/,
        use: ['happypack/loader?id=babel'],
        include: resolve('src'),
        exclude: /node_modules/,
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        use: ['happypack/loader?id=url'],
        include: [resolve('src/assets/images'), resolve('src/assets/fonts')],
      },
    ],
  },
  performance: {
    // 不展示性能提示（资源过大等）
    hints: false,
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        // 将依赖模块提取到vendor chunk以获得更好的缓存
        vendors: {
          name: 'vender',
          test(module) {
            return /node_modules/.test(module.context) && !/\.css$/.test(module.request);
          },
          chunks: 'initial',
          priority: 1, // 优先级，数值越大越优先处理
        },
        // 分离出共享模块
        commons: {
          name: 'common',
          test: /[\\/]src[\\/]common[\\/]/,
          chunks: 'initial',
          priority: -1,
          reuseExistingChunk: true, // 允许使用已经存在的代码块
        },
      },
    },
  },
  plugins: [
    new VueLoaderPlugin(),
    new webpack.DllReferencePlugin({
      context: resolve('server/static/js'),
      manifest: require('../vendors-manifest.json'),
    }),
    new HappyPack({
      id: 'babel',
      loaders: ['babel-loader'],
      threadPool: happyThreadPool,
      cache: true,
      // 是否允许HappyPack输出日志
      verbose: true,
    }),
    new HappyPack({
      id: 'url',
      loaders: [{
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: '[name].[ext]?[hash]',
        },
      }],
      threadPool: happyThreadPool,
      cache: true,
      verbose: true,
    }),
  ],
};

module.exports = merge(baseConfig, webpackConfig);
