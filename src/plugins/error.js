import { iterateObject } from '../utils';

function isPromise(ret) {
  return (ret && typeof ret.then === 'function' && typeof ret.catch === 'function');
}

function errorHandler(error, vm, info) {
  console.group('------全局异常------');
  console.log('错误   ', error);
  console.log('组件   ', vm);
  console.log('信息   ', info);
  console.groupEnd();
}

function actionsHandler(actions) {
  iterateObject(actions, (fn, key) => {
    actions[key] = function method(...args) {
      const ret = fn.apply(this, args);
      if (isPromise(ret)) {
        // 统一添加catch
        return ret.catch(errorHandler);
      }
      return ret;
    };
  });
}

const registerVue = (instance) => {
  const { methods } = instance.$options;
  if (methods) {
    const actions = methods || {};
    actionsHandler(actions);
  }
};

const registerVuex = (instance) => {
  const { store } = instance.$options;
  if (store) {
    const actions = store._actions || {};
    const tempActions = {};
    iterateObject(actions, (value, key) => {
      [tempActions[key]] = value;
    });
    actionsHandler(tempActions);
  }
};

export default {
  install(Vue) {
    Vue.config.errorHandler = errorHandler;
    Vue.mixin({
      beforeCreate() {
        registerVue(this);
        registerVuex(this);
      },
    });
    Vue.prototype.$throw = errorHandler;
  },
};
