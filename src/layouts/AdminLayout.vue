<script setup>
import { useRouter } from 'vue-router'

defineProps({
  active: {
    type: String,
    required: true
  },
  eyebrow: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  }
})

const router = useRouter()

const menus = [
  { key: 'messages', label: '寄语管理', route: '/admin/message-manage' },
  { key: 'users', label: '用户数据', route: '/admin/user-data' }
]
</script>

<template>
  <div class="admin-shell">
    <aside class="admin-sidebar">
      <button class="admin-brand" type="button" @click="router.push('/home')">
        日常自习管理平台
      </button>

      <nav class="admin-nav" aria-label="管理员导航">
        <button
          v-for="menu in menus"
          :key="menu.key"
          class="admin-nav-item"
          :class="{ active: active === menu.key }"
          type="button"
          @click="router.push(menu.route)"
        >
          {{ menu.label }}
        </button>
      </nav>

      <div class="admin-sidebar-footer">
        <button class="admin-settings" type="button" @click="router.push('/settings')">
          <span class="settings-icon" aria-hidden="true"></span>
          <span>设置</span>
        </button>
        <button
          class="user-entry"
          type="button"
          aria-label="回到用户端首页"
          @click="router.push('/home')"
        >
          回到用户端
        </button>
      </div>
    </aside>

    <div class="admin-mobile-bar">
      <button class="mobile-brand" type="button" @click="router.push('/home')">
        日常自习管理平台
      </button>
      <nav class="mobile-nav" aria-label="管理员移动端导航">
        <button
          v-for="menu in menus"
          :key="menu.key"
          class="mobile-nav-item"
          :class="{ active: active === menu.key }"
          type="button"
          @click="router.push(menu.route)"
        >
          {{ menu.label }}
        </button>
        <button class="mobile-nav-item" type="button" @click="router.push('/home')">
          回到用户端
        </button>
      </nav>
    </div>

    <main class="admin-main">
      <header class="admin-page-header">
        <p class="admin-eyebrow">{{ eyebrow }}</p>
        <h1>{{ title }}</h1>
        <p v-if="subtitle" class="admin-subtitle">{{ subtitle }}</p>
      </header>
      <div class="admin-rule"></div>
      <slot />
    </main>
  </div>
</template>

<style scoped>
.admin-shell {
  min-height: 100vh;
  display: flex;
  background: var(--app-page-bg);
}

.admin-sidebar {
  width: var(--app-admin-sidebar-width);
  flex: 0 0 var(--app-admin-sidebar-width);
  min-height: 100vh;
  padding: 38px 16px 42px;
  display: flex;
  flex-direction: column;
  background: var(--app-page-bg);
}

.admin-brand {
  margin: 0 5px 38px;
  border: 0;
  padding: 0;
  background: transparent;
  color: var(--app-green);
  font-size: 32px;
  font-weight: 600;
  line-height: 1.3;
  text-align: left;
  cursor: pointer;
}

.admin-nav {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.admin-nav-item {
  width: 100%;
  height: 65px;
  border: 0;
  border-radius: 10px;
  padding: 0 24px;
  background: rgba(230, 212, 181, 0.1);
  color: #7cb08b;
  font-size: 24px;
  text-align: left;
  cursor: pointer;
  transition: background 0.18s ease, color 0.18s ease, transform 0.18s ease;
}

.admin-nav-item:hover {
  transform: translateX(3px);
}

.admin-nav-item.active {
  background: #7cb18d;
  color: #fff;
}

.admin-sidebar-footer {
  margin-top: auto;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 18px;
}

.admin-settings,
.user-entry {
  width: max-content;
  border: 0;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  color: rgba(118, 75, 0, 0.5);
  font-size: 16px;
  cursor: pointer;
  transition: color 0.18s ease, transform 0.18s ease;
}

.admin-settings:hover,
.user-entry:hover {
  transform: translateY(-2px);
}

.user-entry {
  margin-left: auto;
  min-height: 34px;
  border: 1px solid rgba(115, 159, 140, 0.45);
  border-radius: 17px;
  padding: 4px 12px;
  color: var(--app-green-strong);
}

.settings-icon {
  width: 22px;
  height: 22px;
  border: 1.7px solid currentColor;
  border-radius: 50%;
  position: relative;
}

.settings-icon::before {
  content: '';
  position: absolute;
  inset: 6px;
  border: 1.7px solid currentColor;
  border-radius: 50%;
}

.admin-main {
  flex: 1;
  min-width: 0;
  min-height: 100vh;
  padding: 48px 42px 46px;
  background: var(--app-surface);
  overflow-x: hidden;
}

.admin-page-header {
  max-width: 1080px;
}

.admin-eyebrow {
  margin: 0 0 8px;
  color: rgba(4, 112, 44, 0.5);
  font-size: 13px;
}

.admin-page-header h1 {
  margin: 0;
  color: var(--app-text-strong);
  font-size: 48px;
  font-weight: 400;
  line-height: 1.18;
}

.admin-subtitle {
  margin: 12px 0 0;
  color: rgba(4, 112, 44, 0.5);
  font-size: 16px;
}

.admin-rule {
  height: 1px;
  margin: 26px 0 28px;
  background: var(--app-sand);
}

.admin-mobile-bar {
  display: none;
}

@media (max-width: 1100px) {
  .admin-main {
    padding-inline: 30px;
  }
}

@media (max-width: 768px) {
  .admin-shell {
    display: block;
  }

  .admin-sidebar {
    display: none;
  }

  .admin-mobile-bar {
    display: block;
    padding: 18px 16px 14px;
    border-bottom: 1px solid var(--app-sand);
    background: var(--app-page-bg);
  }

  .mobile-brand {
    border: 0;
    padding: 0;
    background: transparent;
    color: var(--app-green);
    font-size: 21px;
    font-weight: 600;
    cursor: pointer;
  }

  .mobile-nav {
    margin-top: 14px;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
  }

  .mobile-nav-item {
    min-height: 42px;
    border: 1px solid rgba(143, 184, 166, 0.45);
    border-radius: 9px;
    padding: 7px 8px;
    background: #fff;
    color: var(--app-green-strong);
    font-size: 14px;
    cursor: pointer;
  }

  .mobile-nav-item.active {
    border-color: var(--app-green-light);
    background: var(--app-green-light);
    color: #fff;
  }

  .admin-main {
    min-height: auto;
    padding: 28px 16px 36px;
  }

  .admin-page-header h1 {
    font-size: 34px;
  }

  .admin-subtitle {
    font-size: 14px;
    line-height: 1.7;
  }

  .admin-rule {
    margin-block: 22px;
  }
}
</style>
