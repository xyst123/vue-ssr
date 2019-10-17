import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);
export function createRouter() {
  return new Router({
    mode: 'history',
    fallback: false,
    scrollBehavior: () => ({ y: 0 }),
    routes: [
      {
        path: '/main',
        name: 'Main',
        component: () => import('../views/Main.vue'),
        meta: {
          title: 'main',
          bCode: 'main'
        }
      },
      {
        path: '/sub',
        name: 'Sub',
        component: () => import('../views/Sub.vue'),
        meta: {
          title: 'sub',
          bCode: 'sub',
          permissions: ['master']
        },
      },
      { path: '/', redirect: '/main' },
    ],
  });
}
