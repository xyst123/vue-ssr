import Vue from 'vue';
import { sync } from 'vuex-router-sync';
import MpUI from 'mp-ui';
import App from './App.vue';
import { createStore } from './store';
import { createRouter } from './router';
import errorPlugin from './plugins/error';
import 'mp-ui/style/index.css';

Vue.use(MpUI);
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
