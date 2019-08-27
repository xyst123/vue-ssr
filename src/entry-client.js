import Vue from 'vue';
import 'es6-promise/auto';
import { createApp } from './app';
import pageConfig from './config/page';

Vue.mixin({
  beforeRouteUpdate(to, from, next) {
    const { asyncData } = this.$options;
    if (asyncData) {
      asyncData({
        store: this.$store,
        route: to,
      }).then(next).catch(next);
    } else {
      next();
    }
  },
});

const { app, router, store } = createApp();
if (window.__INITIAL_STATE__) {
  store.replaceState(window.__INITIAL_STATE__);
}

router.onReady(() => {
  router.beforeResolve((to, from, next) => {
    const matched = router.getMatchedComponents(to);
    const prevMatched = router.getMatchedComponents(from);
    let diffed = false;
    const activated = matched.filter((component, index) => diffed || (diffed = (prevMatched[index] !== component)));
    const asyncDataHooks = activated.map(component => component.asyncData).filter(data => data);
    if (!asyncDataHooks.length) {
      return next();
    }
    Promise.all(asyncDataHooks.map(hook => hook({ store, route: to })))
      .then(() => {
        next();
      })
      .catch(next);
  });

  app.$mount('#app');
});

router.afterEach((to) => {
  const currentConfig = pageConfig[to.name] || {};

  // 设置title
  document.title = currentConfig.title || pageConfig.title;

  // 设置b码
  const bCode = currentConfig.bCode || pageConfig.bCode;
  const body = document.getElementsByTagName('body')[0];
  body.setAttribute('data-spm', bCode);

  // 插入spm-sdk
  const script = document.createElement('script');
  script.id = 'track';
  script.type = 'text/javascript';
  script.src = '//statics.itc.cn/spm/prod/js/1.0.1/index.js';
  const currentTrackScript = document.getElementById('track');
  if (currentTrackScript) {
    currentTrackScript.parentNode.removeChild(currentTrackScript);
  }
  body.appendChild(script);
});

// service worker
if ((window.location.protocol === 'https:' || window.location.hostname === 'localhost') && window.navigator.serviceWorker) {
  window.navigator.serviceWorker.register('/serviceWorker.js').then((registration) => {
    console.log('service worker注册成功', registration);
  }).catch((error) => {
    console.error('service worker注册失败', error);
  });
}
