<template>
  <div class="login-container">
    <h2>用户登录</h2>
    <form @submit.prevent="login">
      <div class="form-group">
        <label for="username">用户名</label>
        <div class="input-container">
          <input type="text" id="username" v-model="username" required />
        </div>
      </div>
      <div class="form-group">
        <label for="password">密码</label>
        <div class="input-container">
          <input type="password" id="password" v-model="password" required />
        </div>
      </div>
      <button type="submit" class="login-button">登录</button>
    </form>
    <div v-if="showError" class="error-overlay">
      <div class="error-modal">
        <p>密码错误，请重新输入。</p>
        <button @click="reset">确认</button>
      </div>
    </div>
  </div>
</template>

<script>
// import router from '../router';
import { useRouter } from 'vue-router';
export default {
  data() {
    return {
      username: '',
      password: '',
      showError: false,
      token: ''
    };
  },
  setup() {
    const router = useRouter();

    return {
      router
    };
  },
  methods: {
    
    login() {
      // 调用登录接口
      const loginData = {
        username: this.username,
        password: this.password
      };

      // 发起登录请求
      fetch('http://127.0.0.1:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
      })
        .then(response => {
          if (response.status === 401) {
            // 登录失败，显示密码错误弹框
            this.showError = true;
          } else {
            return response.json();
          }
        })
        .then(data => {
          if (data && data.token) {
            // 登录成功，保存token并进行后续操作
            this.token = data.token;
            localStorage.setItem('token', this.token);
            // 跳转到face.vue页面
            this.router.push({ name: 'Face' });
          }
        })
        // .catch(() => {
        //   // 登录请求失败，显示密码错误弹框
        //   this.showError = true;
        // });
    },
    reset() {
      // 重置用户名和密码，并隐藏错误弹框
      this.username = '';
      this.password = '';
      this.showError = false;
    }
  }
};
</script>

<style>
.login-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}


label {
  display: block;
  font-weight: bold;
}

.input-container {
  position: relative;
}

input[type="text"],
input[type="password"] {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
}

.login-button {
  display: block;
  width: 100%;
  padding: 10px 0;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
}

.error-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.error-modal {
  max-width: 300px;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 4px;
  text-align: center;
  background-color: white;
}

.error-modal p {
  margin-bottom: 10px;
}

.error-modal button {
  padding: 8px 12px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
