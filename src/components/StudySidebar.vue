<script setup>
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import { logout } from '@/api/auth'
import { getAuthSession } from '@/api/client'

defineProps({
  active: {
    type: String,
    required: true
  }
})

const router = useRouter()
const loggingOut = ref(false)
const isAdmin = String(getAuthSession()?.role).toUpperCase() === 'ADMIN'

const handleLogout = async () => {
  if (loggingOut.value) return
  loggingOut.value = true
  try { await logout() } catch {
    // The local session is cleared by logout even when the server is unavailable.
  } finally {
    loggingOut.value = false
    await router.replace('/login')
  }
}

const menus = [
  { key: 'home', label: '首页', route: '/home' },
  { key: 'task', label: '自习计划', route: '/task-planning' },
  { key: 'message', label: '成长寄语', route: '/message-unlock' },
  { key: 'growth', label: '成长轨迹', route: '/growth-map' }
]
</script>

<template>
  <aside class="study-sidebar">
    <button class="brand" type="button" @click="router.push('/home')">日常自习管理平台</button>

    <nav class="menu" aria-label="主导航">
      <button
        v-for="menu in menus"
        :key="menu.key"
        class="menu-item"
        :class="{ active: active === menu.key }"
        type="button"
        @click="router.push(menu.route)"
      >
        <span class="menu-icon" :class="`icon-${menu.key}`" aria-hidden="true"></span>
        <span>{{ menu.label }}</span>
      </button>
    </nav>

    <div class="sidebar-footer">
      <button class="settings" :class="{ active: active === 'settings' }" type="button" aria-label="设置" @click="router.push('/settings')">
        <span class="settings-icon" aria-hidden="true"></span>
        <span>设置</span>
      </button>
      <button
        v-if="active === 'home' && isAdmin"
        class="admin-entry"
        type="button"
        aria-label="进入管理端用户数据页"
        @click="router.push('/admin/user-data')"
      >
        管理端
      </button>
      <button class="logout-entry" type="button" :disabled="loggingOut" @click="handleLogout">{{ loggingOut ? '退出中…' : '退出' }}</button>
    </div>
  </aside>
</template>

<style scoped>
.study-sidebar {
  width: 244px;
  flex: 0 0 244px;
  min-height: 100vh;
  padding: 44px 18px 38px;
  display: flex;
  flex-direction: column;
  gap: 54px;
  background: #f7f5f0;
  color: #739f8c;
}

.brand {
  border: 0;
  padding: 0;
  background: transparent;
  color: #739f8c;
  font: inherit;
  font-size: 24px;
  font-weight: 600;
  line-height: 1.25;
  text-align: left;
  cursor: pointer;
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 26px;
}

.menu-item {
  width: 100%;
  height: 54px;
  border: 0;
  border-radius: 7px;
  padding: 0 18px;
  display: flex;
  align-items: center;
  gap: 15px;
  background: rgba(230, 212, 181, 0.13);
  color: rgba(4, 112, 44, 0.5);
  font: inherit;
  font-size: 18px;
  cursor: pointer;
  transition: background 0.18s ease, color 0.18s ease, transform 0.18s ease;
}

.menu-item:hover {
  transform: translateX(3px);
}

.menu-item.active {
  background: rgba(4, 112, 44, 0.5);
  color: #ffffff;
}

.menu-icon {
  width: 20px;
  height: 20px;
  border: 1.8px solid currentColor;
  border-radius: 4px;
  position: relative;
  flex: 0 0 20px;
}

.icon-home {
  border: 0;
}

.icon-home::before {
  content: '';
  position: absolute;
  inset: 7px 3px 1px;
  border: 1.8px solid currentColor;
  border-top: 0;
}

.icon-home::after {
  content: '';
  position: absolute;
  left: 4px;
  top: 2px;
  width: 12px;
  height: 12px;
  border-left: 1.8px solid currentColor;
  border-top: 1.8px solid currentColor;
  transform: rotate(45deg);
}

.icon-task::before,
.icon-message::before {
  content: '';
  position: absolute;
  left: 4px;
  right: 4px;
  top: 6px;
  height: 1.8px;
  background: currentColor;
  box-shadow: 0 5px 0 currentColor;
}

.icon-growth::before {
  content: '';
  position: absolute;
  left: 4px;
  bottom: 4px;
  width: 3px;
  height: 6px;
  background: currentColor;
  box-shadow: 5px -3px 0 currentColor, 10px -7px 0 currentColor;
}

.sidebar-footer {
  margin-top: auto;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 18px;
}

.settings,
.admin-entry,
.logout-entry {
  width: max-content;
  border: 0;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 7px;
  background: transparent;
  color: rgba(118, 75, 0, 0.5);
  font: inherit;
  font-size: 15px;
  cursor: pointer;
  transition: color 0.18s ease, transform 0.18s ease;
}

.settings:hover,
.admin-entry:hover,
.logout-entry:hover {
  transform: translateY(-2px);
}

.settings.active {
  color: #5d8f7a;
  font-weight: 600;
}

.admin-entry {
  margin-left: auto;
  min-height: 32px;
  border: 1px solid rgba(115, 159, 140, 0.45);
  border-radius: 16px;
  padding: 4px 12px;
  color: var(--app-green-strong);
}
.logout-entry{margin-left:auto;color:rgba(118,75,0,.5)}.admin-entry+.logout-entry{margin-left:0}.logout-entry:disabled{cursor:wait;opacity:.6}

.settings-icon {
  width: 24px;
  height: 24px;
  border: 1.8px solid currentColor;
  border-radius: 50%;
  position: relative;
}

.settings-icon::before {
  content: '';
  position: absolute;
  inset: 7px;
  border: 1.8px solid currentColor;
  border-radius: 50%;
}

@media (max-width: 768px) {
  .study-sidebar {
    width: 100%;
    min-width: 0;
    flex-basis: auto;
    min-height: auto;
    padding: 22px 16px;
    gap: 20px;
  }

  .brand {
    font-size: 23px;
  }

  .menu {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .menu-item {
    height: 50px;
    padding-inline: 14px;
    font-size: 17px;
  }

  .sidebar-footer {
    margin-top: 2px;
    justify-content: flex-start;
    min-height: 40px;
  }
}
</style>
