import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);
export function createRouter() {
  return new Router({
    mode: 'history',
    fallback: false,
    scrollBehavior: () => ({ y: 0 }),
    routes: [
      { path: '/main', name: 'Main', component: () => import('../views/Main.vue') },
      { path: '/sub', name: 'Sub', component: () => import('../views/Sub.vue') },
      { path: '/', redirect: '/main' },
    ],
  });
}
