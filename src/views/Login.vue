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
    <section class="login-left" aria-label="平台寄语">
      <div class="visual-mark" aria-hidden="true"><span></span><span></span><span></span></div>
      <p>把每一天的小进步，认真收藏起来。</p>
      <blockquote>自律不是催促自己，而是温柔地把今天过好。</blockquote>
    </section>

    <main class="login-right">
      <form class="login-panel" @submit.prevent="handleLogin">
        <p class="login-kicker">欢迎回来</p>
        <h1 class="login-title">日常自习管理平台</h1>
        <p class="login-subtitle">登录后继续今天的计划与成长记录</p>

        <div class="login-form">
          <label class="form-item">
            <span class="form-label">账号</span>
          <input
            v-model="form.account"
            class="form-input"
            type="text"
            placeholder="请输入账号"
            autocomplete="username"
          />
          </label>
          <label class="form-item">
            <span class="form-label">密码</span>
          <input
            v-model="form.password"
            class="form-input"
            type="password"
            placeholder="请输入密码"
            autocomplete="current-password"
          />
          </label>
        </div>

        <button class="login-btn" type="submit">统一认证平台登录</button>
      </form>
    </main>
  </div>
</template>

<style scoped>
.login-container {
  width: 100%;
  min-height: 100%;
  display: flex;
  background: var(--app-page-bg);
}

.login-left {
  flex: 0 0 min(46%, 660px);
  min-height: 100vh;
  padding: 72px clamp(42px, 6vw, 88px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: #eef5f1;
  color: var(--app-green-strong);
}

.visual-mark {
  width: 180px;
  height: 110px;
  margin-bottom: 40px;
  display: flex;
  align-items: flex-end;
  gap: 18px;
}

.visual-mark span {
  width: 42px;
  border: 2px solid var(--app-green);
  border-radius: 8px 8px 0 0;
  background: rgba(255, 255, 255, 0.55);
}

.visual-mark span:nth-child(1) { height: 46px; }
.visual-mark span:nth-child(2) { height: 76px; }
.visual-mark span:nth-child(3) { height: 108px; background: var(--app-green); }

.login-left p {
  margin: 0 0 22px;
  font-size: 26px;
  font-weight: 600;
}

.login-left blockquote {
  max-width: 440px;
  color: #71827a;
  font-size: 17px;
  line-height: 1.9;
}

.login-right {
  flex: 1;
  min-height: 100vh;
  padding: var(--app-page-padding-y) var(--app-page-padding-x);
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--app-surface);
}

.login-panel {
  width: min(430px, 100%);
}

.login-kicker {
  margin: 0 0 10px;
  color: var(--app-green);
  font-size: 14px;
}

.login-title {
  margin: 0 0 12px;
  color: var(--app-text-strong);
  font-size: var(--app-title-size);
  font-weight: 500;
  line-height: 1.25;
}

.login-subtitle {
  margin: 0;
  color: var(--app-muted);
  font-size: 15px;
}

.login-form {
  margin-top: 38px;
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  color: var(--app-green-strong);
  font-size: 14px;
}

.form-input {
  width: 100%;
  height: 48px;
  border-radius: var(--app-radius);
  border: 1px solid #b9c9c1;
  background: #fff;
  outline: none;
  padding: 0 16px;
  font-size: 15px;
  color: var(--app-text);
}

.form-input::placeholder {
  color: #b8c9c0;
  font-size: 14px;
}

.form-input:focus {
  border-color: #5c8876;
}

.login-btn {
  width: 100%;
  height: 48px;
  margin-top: 32px;
  background: var(--app-green);
  border: none;
  border-radius: var(--app-radius);
  color: white;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;
}

.login-btn:hover {
  background: var(--app-green-strong);
}

.login-btn:active {
  background: #527966;
}

@media (max-width: 768px) {
  .login-container {
    display: block;
  }

  .login-left {
    min-height: 250px;
    padding: 36px 24px;
  }

  .visual-mark {
    width: 126px;
    height: 68px;
    margin-bottom: 24px;
  }

  .visual-mark span {
    width: 30px;
  }

  .visual-mark span:nth-child(1) { height: 30px; }
  .visual-mark span:nth-child(2) { height: 50px; }
  .visual-mark span:nth-child(3) { height: 68px; }

  .login-left p {
    font-size: 21px;
  }

  .login-left blockquote {
    font-size: 15px;
  }

  .login-right {
    min-height: auto;
    padding-block: 42px;
  }

  .login-title {
    font-size: 34px;
  }
}
</style>
