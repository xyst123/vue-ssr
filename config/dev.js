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
    port: 3338,
    enableStaticCache: false,
    enableMock: false,
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
