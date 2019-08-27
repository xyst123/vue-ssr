const merge = require('webpack-merge');
const { VueLoaderPlugin } = require('vue-loader');
const { resolve, getConfig } = require('../utils');

const webpackConfig = getConfig().webpack || {};


const baseConfig = {
  output: {
    path: resolve('dist'),
    publicPath: '/dist/',
    filename: '[name].[chunkhash].js',
  },
  resolve: {
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
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: '[name].[ext]?[hash]',
        },
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
  ],
};

module.exports = merge(baseConfig, webpackConfig);
