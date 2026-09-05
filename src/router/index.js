import { createRouter, createWebHistory } from 'vue-router'
import { isAdmin, isAuthenticated } from '@/api/client'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '首页', requiresAuth: true }
  },
  {
    path: '/task-planning',
    name: 'TaskPlanning',
    component: () => import('@/views/TaskPlanning.vue'),
    meta: { title: '每日任务规划', requiresAuth: true }
  },
  {
    path: '/message-unlock',
    name: 'MessageUnlock',
    component: () => import('@/views/MessageUnlock.vue'),
    meta: { title: '寄语解锁', requiresAuth: true }
  },
  {
    path: '/growth-map',
    name: 'GrowthMap',
    component: () => import('@/views/GrowthMap.vue'),
    meta: { title: '成长轨迹地图', requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/Settings.vue'),
    meta: { title: '设置与隐私', requiresAuth: true }
  },
  {
    path: '/admin/message-manage',
    name: 'MessageManage',
    component: () => import('@/views/admin/MessageManage.vue'),
    meta: { title: '寄语管理', requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/user-data',
    name: 'UserData',
    component: () => import('@/views/admin/UserData.vue'),
    meta: { title: '用户数据', requiresAuth: true, requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫：设置页面标题
router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = `${to.meta.title} - 日常自习管理平台`
  }
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next({ path: '/login', query: { redirect: to.fullPath } })
    return
  }
  if (to.meta.requiresAdmin && !isAdmin()) {
    next('/home')
    return
  }
  if (to.path === '/login' && isAuthenticated()) {
    next(isAdmin() ? '/admin/user-data' : '/home')
    return
  }
  next()
})

export default router
