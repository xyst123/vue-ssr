const webpack = require('webpack');
const merge = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// const SWPrecachePlugin = require('sw-precache-webpack-plugin');
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin');
const main = require('./webpack.main.config');
const { getConfig, getStyleLoaders } = require('../utils');

const otherConfig = getConfig().other || {};

const config = merge(main, {
  entry: {
    app: './src/entry-client.js',
  },
  resolve: {
    alias: {
      'create-api': './create-api-client.js',
    },
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'dev'),
      'process.env.VUE_ENV': '"client"',
    }),
    // 将整个输出构建为单个JSON文件
    new VueSSRClientPlugin(),
  ],
});

config.module.rules.push(...getStyleLoaders({
  extract: otherConfig.extract,
}));
if (otherConfig.extract) {
  config.plugins.push(new MiniCssExtractPlugin({
    filename: '[name].css',
    chunkFilename: '[id].css',
  }));
}

module.exports = config;
