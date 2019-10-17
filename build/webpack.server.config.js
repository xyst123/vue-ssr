const webpack = require('webpack');
const merge = require('webpack-merge');
const nodeExternals = require('webpack-node-externals');
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin');
const main = require('./webpack.main.config');
const { getConfig, getStyleLoaders } = require('../utils');

const serverConfig = getConfig().server || {};

// 传递给createBundleRenderer的server bundle
const config = merge(main, {
  target: 'node',
  entry: './src/entry-server.js',
  output: {
    filename: 'server-bundle.js',
    // 使用Node风格导出模块
    libraryTarget: 'commonjs2',
  },
  resolve: {

  },
  // 防止将某些import的包打包到bundle中，在运行时再去从外部获取这些扩展依赖
  externals: nodeExternals({
    whitelist: /\.css$/,
  }),
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'dev'),
      'process.env.VUE_ENV': '"server"',
      'process.env.PORT': serverConfig.port,
    }),
    // 将整个输出构建为单个JSON文件
    new VueSSRServerPlugin(),
  ],
});

config.module.rules.push(...getStyleLoaders({ extract: false }));

module.exports = config;
