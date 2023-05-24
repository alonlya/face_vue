import { createApp } from 'vue';
import App from './App.vue';
import router from './router.js';

// 创建 Vue 应用程序实例并使用路由
const app = createApp(App);
app.use(router);

// 其他代码...

// 挂载应用程序
app.mount('#app');