// https://github.com/michael-ciniawsky/postcss-load-config
module.exports = {
  "plugins": {
    "autoprefixer": {},
    'postcss-px-to-viewport': {
      viewportWidth: 750,
      viewportHeight: 1334,
      unitPrecision: 3, // 保留小数位数
      viewportUnit: 'vw',
      selectorBlackList: ['.ignore', '.hairlines'], // 不转换为vw单位的类
      minPixelValue: 1, // 小于或等于1px不转换为vw单位
      mediaQuery: false,
    }
  }
}