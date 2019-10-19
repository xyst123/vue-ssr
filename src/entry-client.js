import Vue from 'vue';
import 'es6-promise/auto';
import { createApp } from './app';
import { base64ToUint8Array, request, getStatuses } from './utils';

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

router.beforeEach((to, from, next) => {
  const statuses = getStatuses();
  const { permissions } = to.meta || {};
  if (permissions && !permissions.find(permission => statuses.includes(permission))) {
    next({
      path: '/main',
    });
  } else {
    next();
  }
});

router.afterEach((to) => {
  const currentConfig = to.meta || {};

  // 设置title
  document.title = currentConfig.title || '';

  // 设置b码
  const bCode = currentConfig.bCode || '';
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
    .then((registration) => {
      requestPermission();

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

      subscribeUserToPush(registration, publicKey).then((subscription) => {
        request({
          method: 'POST',
          url: '/push/set',
          data: {
            id: Date.now(),
            subscription,
          },
        });
      }).catch((error) => {
        console.error('订阅消息推送失败', error);
      });

      document.getElementById('record-sync').onclick = () => {
        const tag = 'record-sync';
        registration.sync.register(tag).then(() => {
          console.log('后台同步触发成功', tag);
          window.navigator.serviceWorker.controller.postMessage(
            JSON.stringify({ type: 'record', data: { ua: window.navigator.userAgent } }),
          );
        }).catch((error) => {
          console.error('后台同步触发失败', error);
        });
      };
    }).catch((error) => {
      console.error(error);
    });

  window.navigator.serviceWorker.addEventListener('message', (e) => {
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
