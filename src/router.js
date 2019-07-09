import Vue from 'vue'
import Router from 'vue-router'
import Join from './components/Join';
import Dashboard from './components/Dashboard';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'dash',
      component: Dashboard,
    },
    {
      path: '/join/:referer',
      name: 'join',
      component: Join,
    },
  ]
})

