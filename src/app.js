import Vue from 'vue';
import { sync } from 'vuex-router-sync';
import App from './App.vue';
import { createStore } from './store';
import { createRouter } from './router';
import errorPlugin from './plugins/error';

Vue.use(errorPlugin);

export function createApp() {
  const store = createStore();
  const router = createRouter();

  // 同步路由状态到store
  sync(store, router);

  const app = new Vue({
    router,
    store,
    render: h => h(App),
  });

  return { app, router, store };
}
