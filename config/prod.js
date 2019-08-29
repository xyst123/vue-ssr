module.exports = {
  webpack: {
    mode: 'production',
    devtool: false,
  },
  server: {
    protocol: 'http',
    port: 3338,
    enableStaticCache: true, // 静态资源是否缓存
    proxy: {

    },
  },
  other: {
    extract: true,
  },
};
