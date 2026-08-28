import { createRouter, createWebHistory } from 'vue-router'

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
    meta: { title: '首页' }
  },
  {
    path: '/task-planning',
    name: 'TaskPlanning',
    component: () => import('@/views/TaskPlanning.vue'),
    meta: { title: '每日任务规划' }
  },
  {
    path: '/message-unlock',
    name: 'MessageUnlock',
    component: () => import('@/views/MessageUnlock.vue'),
    meta: { title: '寄语解锁' }
  },
  {
    path: '/growth-map',
    name: 'GrowthMap',
    component: () => import('@/views/GrowthMap.vue'),
    meta: { title: '成长轨迹地图' }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/Settings.vue'),
    meta: { title: '设置与隐私' }
  },
  {
    path: '/admin/message-manage',
    name: 'MessageManage',
    component: () => import('@/views/admin/MessageManage.vue'),
    meta: { title: '寄语管理' }
  },
  {
    path: '/admin/user-data',
    name: 'UserData',
    component: () => import('@/views/admin/UserData.vue'),
    meta: { title: '用户数据' }
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
  next()
})

export default router
