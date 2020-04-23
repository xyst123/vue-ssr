import { createApp } from './app';
import { getStatuses, get } from './utils';

// 会被bundleRenderer调用
// 有可能是异步路由钩子函数或组件，所以返回一个Promise
export default context => new Promise((resolve, reject) => {
  const { app, router, store } = createApp();
  const { url } = context;
  const { fullPath } = router.resolve(url).route;

  if (fullPath !== url) {
    return reject({ url: fullPath });
  }

  // 设置服务端路由
  router.push(url);
  router.onReady(() => {
    const matchedComponents = router.getMatchedComponents();
    const statuses = getStatuses();
    const { permissions } = get(router, 'currentRoute.meta', {});
    // 匹配不到的路由返回404
    if (!matchedComponents.length || (permissions && !permissions.find(permission => statuses.includes(permission)))) {
      return reject({ code: 404 });
    }

    // 对所有匹配的路由组件调用asyncData
    Promise.all(matchedComponents.map(({ asyncData }) => asyncData && asyncData({
      store,
      route: router.currentRoute,
    }))).then(() => {
      // 将状态附加到上下文，状态将自动序列化为 window.__INITIAL_STATE__，并注入html
      context.state = store.state;
      // resolve应用程序实例，用于渲染
      resolve(app);
    }).catch(reject);
  }, reject);

  router.beforeEach((to, from, next) => {
    if (to.meta.disabled) {
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
    context.title = currentConfig.title || '';

    // 设置b码
    context.bCode = currentConfig.bCode || '';
  });
});
