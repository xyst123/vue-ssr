const path = require('path');
const configs = require('../config');

const env = process.env.NODE_ENV || 'dev';
function iterateObject(object, handler) {
  const keys = Object.keys(object);
  keys.forEach((key) => {
    const value = object[key];
    handler(value, key, object);
  });
}

module.exports = {
  iterateObject,

  resolve(file) {
    return path.resolve(__dirname, '../', file);
  },

  getConfig() {
    return configs[env];
  },

  getStyleLoaders(options) {
    function generateLoader(loader, loaderOptions) {
      const loaders = [{ loader: 'css-loader' }, { loader: 'postcss-loader' }];

      if (loader) {
        loaders.push({
          loader: `${loader}-loader`,
          options: loaderOptions,
        });
      }

      if (options.extract) {
        const MiniCssExtractPlugin = require('mini-css-extract-plugin');
        return ['vue-style-loader', { loader: MiniCssExtractPlugin.loader }, ...loaders];
      }
      return ['vue-style-loader', ...loaders];
    }

    const loaders = {
      css: generateLoader(),
      postcss: generateLoader(),
      less: generateLoader('less'),
      scss: generateLoader('sass'),
    };

    const output = [];
    iterateObject(loaders, (loader, name) => {
      output.push({
        test: new RegExp(`\\.${name}$`),
        use: loader,
      });
    });
    return output;
  },
};
