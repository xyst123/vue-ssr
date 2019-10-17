const webpack = require('webpack');
const merge = require('webpack-merge');
const { resolve, getConfig } = require('../utils');

const webpackConfig = getConfig().webpack || {};
const library = '[name]_lib';

module.exports = merge({
  entry: {
    vendors: ['axios', 'es6-promise', 'vue', 'vue-router', 'vuex'],
  },
  output: {
    path: resolve('server/static/js'),
    filename: '[name].dll.js',
    library,
  },

  plugins: [
    new webpack.DllPlugin({
      path: resolve('[name]-manifest.json'),
      name: library,
    }),
  ],
}, webpackConfig);
