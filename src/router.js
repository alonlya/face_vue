import { createRouter, createWebHistory } from 'vue-router';
import LoginForm from './components/LoginForm.vue';
import FaceForm from './components/FaceForm.vue';
import TestForm from './components/TestForm.vue';

// 其他导入语句...

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes: [
    // 定义路由规则
    // ...
    {
        path: '/',
        redirect: '/Login' // 添加重定向规则
      },
    {
        path: '/Login',
        name: 'Login',
        component: LoginForm
      },
    {
      path: '/Face',
      name: 'Face',
      component: FaceForm
      },
    {
        path: '/Test',
        name: 'Test',
        component: TestForm
      },
    // ...
  ]
});

// 导出路由实例
export default router;