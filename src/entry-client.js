import Vue from 'vue';
import 'es6-promise/auto';
import { createApp } from './app';
import pageConfig from './config/page';
import { base64ToUint8Array, request } from './utils';

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
function requestPermission() {
  return new Promise((resolve, reject) => {
    const permissionPromise = Notification.requestPermission((result) => {
      resolve(result);
    });
    if (permissionPromise) {
      permissionPromise.then(resolve, reject);
    }
  }).then((result) => {
    if (result !== 'granted') {
      throw new Error('用户拒绝接收通知');
    }
  });
}

function subscribeUserToPush(registration, publicKey) {
  const subscribeOptions = {
    userVisibleOnly: true,
    applicationServerKey: base64ToUint8Array(publicKey),
  };
  return registration.pushManager.subscribe(subscribeOptions).then((pushSubscription) => {
    console.log('订阅推送成功：', JSON.stringify(pushSubscription));
    return pushSubscription;
  });
}

if ((window.location.protocol === 'https:' || window.location.hostname === 'localhost') && window.navigator.serviceWorker) {
  const publicKey = 'BOEQSjdhorIf8M0XFNlwohK3sTzO9iJwvbYU-fuXRF0tvRpPPMGO6d_gJC_pUQwBT7wD8rKutpNTFHOHN3VqJ0A';
  window.navigator.serviceWorker.register('/serviceWorker.js')
    .then(registration => Promise.all([
      registration,
      requestPermission(),
      subscribeUserToPush(registration, publicKey),
    ])).then((result) => {
      const registration = result[0];
      const title = '欢迎来到vue-ssr';
      const options = {
        body: '加油哦',
        icon: '/static/images/favicon.png',
        actions: [{
          action: 'show-note',
          title: '查看笔记',
        }, {
          action: 'contact-me',
          title: '联系我',
        }],
        tag: 'welcome',
        renotify: true,
      };
      registration.showNotification(title, options);

      const subscription = result[2];
      request({
        method: 'POST',
        url: '/push/set',
        data: {
          id: Date.now(),
          subscription,
        },
      });
    }).catch((error) => {
      console.error(error);
    });

  navigator.serviceWorker.addEventListener('message', (e) => {
    const { data } = e;
    switch (data) {
      case 'show-note':
        window.open('https://github.com/xyst123/codes');
        break;
      case 'contact-me':
        window.location.href = 'mailto:2273136383@qq.com';
        break;
      default:
        console.log('没有匹配的消息处理器');
    }
  });
}
