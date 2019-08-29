// 识别webpack错误类别，并整理，以提供更好的开发体验
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');

module.exports = {
  webpack: {
    mode: 'development',
    devtool: 'source-map',
    plugins: [
      new FriendlyErrorsPlugin(),
    ],
  },
  server: {
    protocol: 'http',
    port: 3340,
    enableStaticCache: false,
    enableMock: false,
    autoOpen: true,
    proxy: {
      '/wrj': {
        target: 'http://wrj.sohu.com',
        changeOrigin: true,
        pathRewrite: {
          '^/wrj': '',
        },
      },
    },
  },
  other: {
    extract: true,
  },
};
