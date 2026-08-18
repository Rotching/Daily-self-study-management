<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = reactive({
  account: '',
  password: ''
})

const handleLogin = () => {
  // 登录逻辑占位，跳转至首页
  router.push('/home')
}
</script>

<template>
  <div class="login-container">
    <!-- 左侧装饰图 -->
    <div class="login-left">
      <img
        class="login-banner"
        src="https://placehold.co/831x1024"
        alt="banner"
      />
    </div>

    <!-- 右侧登录区 -->
    <div class="login-right">
      <h1 class="login-title">日常自习管理平台</h1>

      <div class="login-form">
        <div class="form-item">
          <label class="form-label">账号</label>
          <input
            v-model="form.account"
            class="form-input"
            type="text"
            placeholder="请输入账号"
          />
        </div>
        <div class="form-item">
          <label class="form-label">密码</label>
          <input
            v-model="form.password"
            class="form-input"
            type="password"
            placeholder="请输入密码"
          />
        </div>
      </div>

      <button class="login-btn" @click="handleLogin">
        统一认证平台登录
      </button>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  width: 100%;
  height: 100%;
  display: flex;
  background: #f7f5f0;
  overflow: hidden;
}

/* 左侧 banner 区：约占 57.7%（831/1440） */
.login-left {
  flex: 0 0 57.7%;
  height: 100%;
  overflow: hidden;
}

.login-banner {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* 右侧登录表单区 */
.login-right {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px 60px;
}

.login-title {
  color: #5c8876;
  font-size: 58px;
  font-family: Inter;
  font-weight: 700;
  text-align: center;
  margin-bottom: 60px;
  word-wrap: break-word;
}

.login-form {
  width: 431px;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  gap: 38px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-label {
  color: #8fb8a6;
  font-size: 32px;
  font-family: Inter;
  font-weight: 400;
}

.form-input {
  width: 100%;
  height: 66px;
  border-radius: 10px;
  border: 1px #70655d solid;
  background: transparent;
  outline: none;
  padding: 0 16px;
  font-size: 20px;
  color: #5c8876;
  font-family: Inter;
  box-sizing: border-box;
}

.form-input::placeholder {
  color: #b8c9c0;
  font-size: 18px;
}

.form-input:focus {
  border-color: #5c8876;
}

.login-btn {
  width: 400px;
  max-width: 100%;
  height: 94px;
  margin-top: 80px;
  background: #948477;
  border: none;
  border-radius: 28px;
  color: white;
  font-size: 36px;
  font-family: Inter;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s ease;
}

.login-btn:hover {
  background: #82746a;
}

.login-btn:active {
  background: #6f635a;
}

/* 响应式适配：窗口较窄时缩小字号 */
@media (max-width: 1200px) {
  .login-title {
    font-size: 44px;
  }

  .form-label {
    font-size: 26px;
  }

  .login-btn {
    font-size: 30px;
    height: 80px;
  }
}
</style>
