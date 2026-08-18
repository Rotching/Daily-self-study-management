<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 菜单项
const menus = [
  { key: 'home', label: '首页', active: true },
  { key: 'task', label: '自习计划', active: false },
  { key: 'message', label: '成长寄语', active: false },
  { key: 'growth', label: '成长轨迹', active: false }
]

// 首页渲染数据（待接入接口）
const homeData = ref({
  // 用户信息
  greeting: '今日自律，稳步精进',
  username: '张三同学',
  subtitle: '不追赶谁，照顾自己的节奏就很好',
  // 核心数据卡片
  todayCompletion: 70, // 今日完成度（%）
  weeklyDays: 5, // 本周自习天数
  unlockedMessages: 12, // 已解锁寄语条数
  totalHours: 28, // 累计自习小时
  totalMinutes: 5, // 累计自习分钟
  // 今日任务概况
  totalTasks: 3,
  completedTasks: 1,
  pendingList: ['英语阅读4篇', '高数错题整理'], // 待完成任务
  // 今日寄语
  dailyQuote: '你留下的每一滴汗水，都在悄悄浇灌未来的花朵。'
})

const handleMenuClick = (key) => {
  // 菜单跳转占位
  const routeMap = {
    home: '/home',
    task: '/task-planning',
    message: '/message-unlock',
    growth: '/growth-map'
  }
  if (routeMap[key]) router.push(routeMap[key])
}

const goSettings = () => {
  // 设置入口占位
}
</script>

<template>
  <div class="home-container">
    <!-- 左侧导航栏 -->
    <aside class="sidebar">
      <div class="logo">日常自习管理平台</div>

      <nav class="menu">
        <div
          v-for="m in menus"
          :key="m.key"
          class="menu-item"
          :class="{ active: m.active }"
          @click="handleMenuClick(m.key)"
        >
          <span class="menu-text">{{ m.label }}</span>
        </div>
      </nav>

      <div class="settings" @click="goSettings">
        <div class="settings-icon"></div>
        <span class="settings-text">设置</span>
      </div>
    </aside>

    <!-- 主内容区 -->
    <main class="content">
      <!-- 顶部问候 -->
      <header class="header">
        <div class="greeting">{{ homeData.greeting }}</div>
        <h1 class="welcome">你好，{{ homeData.username }}</h1>
        <div class="subtitle">{{ homeData.subtitle }}</div>
      </header>

      <div class="divider"></div>

      <!-- 数据卡片 -->
      <section class="cards">
        <div class="card">
          <div class="card-label">今日完成度</div>
          <div class="card-value">{{ homeData.todayCompletion }}<span class="unit">%</span></div>
        </div>
        <div class="card">
          <div class="card-label">本周自习</div>
          <div class="card-value">{{ homeData.weeklyDays }}<span class="unit">天</span></div>
        </div>
        <div class="card">
          <div class="card-label">已解锁寄语</div>
          <div class="card-value">{{ homeData.unlockedMessages }}<span class="unit">条</span></div>
        </div>
        <div class="card">
          <div class="card-label">累计自习</div>
          <div class="card-value">
            {{ homeData.totalHours }}<span class="unit">小时</span>
            {{ homeData.totalMinutes }}<span class="unit">分钟</span>
          </div>
        </div>
      </section>

      <!-- 今日学习任务 -->
      <section class="task-section">
        <div class="task-header">
          <h2 class="task-title">今日学习任务</h2>
          <div class="task-summary">
            共<span class="num">{{ homeData.totalTasks }}</span>项
            已完成<span class="num">{{ homeData.completedTasks }}</span>项
          </div>
          <div class="add-icon"></div>
        </div>

        <div class="task-card">
          <div class="task-pending">
            <div class="pending-label">待完成：</div>
            <div class="pending-list">
              <div
                v-for="(item, idx) in homeData.pendingList"
                :key="idx"
                class="pending-item"
              >
                {{ idx + 1 }}. {{ item }}
              </div>
            </div>
          </div>

          <div class="priority-tags">
            <div class="priority mid">中优先级</div>
            <div class="priority high">高优先级</div>
          </div>
        </div>
      </section>

      <!-- 今日寄语 -->
      <footer class="quote">
        ” {{ homeData.dailyQuote}} “
      </footer>
    </main>
  </div>
</template>

<style scoped>
.home-container {
  width: 100%;
  height: 100%;
  display: flex;
  background: #f7f5f0;
  overflow: hidden;
}

/* ============ 左侧导航栏 ============ */
.sidebar {
  flex: 0 0 22%;
  max-width: 320px;
  min-width: 220px;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 48px 22px 0 27px;
  box-sizing: border-box;
  position: relative;
}

.logo {
  color: #739f8c;
  font-size: 28px;
  font-family: Inter;
  font-weight: 600;
  word-wrap: break-word;
  margin-bottom: 60px;
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 44px;
}

.menu-item {
  width: 250px;
  max-width: 100%;
  height: 65px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  background: rgba(230.31, 212.15, 180.80, 0.10);
  cursor: pointer;
  transition: background 0.2s ease;
}

.menu-item.active {
  background: rgba(4.22, 111.74, 43.64, 0.50);
}

.menu-text {
  color: rgba(4.22, 111.74, 43.64, 0.50);
  font-size: 24px;
  font-family: Inter;
  font-weight: 400;
}

.menu-item.active .menu-text {
  color: white;
}

.settings {
  position: absolute;
  left: 27px;
  bottom: 42px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.settings-icon {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(118.04, 74.76, 0, 0.50);
  border-radius: 50%;
  box-sizing: border-box;
}

.settings-text {
  color: rgba(118.04, 74.76, 0, 0.50);
  font-size: 20px;
  font-family: Inter;
}

/* ============ 主内容区 ============ */
.content {
  flex: 1;
  height: 100%;
  background: white;
  padding: 52px 54px 48px 48px;
  box-sizing: border-box;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.header {
  margin-bottom: 24px;
}

.greeting {
  color: rgba(4.22, 111.74, 43.64, 0.50);
  font-size: 16px;
  font-family: Inter;
  margin-bottom: 16px;
}

.welcome {
  color: rgba(0, 0, 0, 0.70);
  font-size: 44px;
  font-family: Inter;
  font-weight: 400;
  margin: 0 0 28px 0;
}

.subtitle {
  color: rgba(4.22, 111.74, 43.64, 0.50);
  font-size: 20px;
  font-family: Inter;
}

.divider {
  width: 100%;
  height: 0;
  border-top: 1px solid #e6d4b5;
  margin: 24px 0;
}

/* ============ 数据卡片 ============ */
.cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 40px;
}

.card {
  height: 142px;
  border-radius: 16px;
  border: 2px solid #e6d4b5;
  padding: 25px 30px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.card-label {
  color: #764b00;
  font-size: 20px;
  font-family: Inter;
  margin-bottom: 18px;
}

.card-value {
  color: black;
  font-size: 40px;
  font-family: Inter;
  font-weight: 400;
}

.unit {
  color: #8fb8a6;
  font-size: 20px;
  margin-left: 6px;
}

/* ============ 今日学习任务 ============ */
.task-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.task-header {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 16px;
}

.task-title {
  color: rgba(0, 0, 0, 0.80);
  font-size: 32px;
  font-family: Inter;
  font-weight: 400;
  margin: 0;
}

.task-summary {
  color: #70655d;
  font-size: 24px;
  font-family: Inter;
}

.task-summary .num {
  color: rgba(4.22, 111.74, 43.64, 0.75);
  margin: 0 6px;
}

.add-icon {
  margin-left: auto;
  width: 24px;
  height: 24px;
  border: 2px solid #739f8c;
  border-radius: 50%;
  position: relative;
  cursor: pointer;
}

.add-icon::before,
.add-icon::after {
  content: '';
  position: absolute;
  background: #739f8c;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.add-icon::before {
  width: 12px;
  height: 2px;
}

.add-icon::after {
  width: 2px;
  height: 12px;
}

.task-card {
  flex: 1;
  border: 2px solid #739f8c;
  border-radius: 10px;
  padding: 40px 34px;
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  min-height: 160px;
}

.task-pending {
  flex: 1;
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.pending-label {
  color: #948477;
  font-size: 24px;
  font-family: Inter;
  flex-shrink: 0;
}

.pending-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.pending-item {
  color: #948477;
  font-size: 24px;
  font-family: Inter;
  line-height: 1.5;
}

.priority-tags {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-self: flex-start;
}

.priority {
  width: 120px;
  height: 32px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  font-family: Inter;
}

.priority.mid {
  background: #e6d4b5;
}

.priority.high {
  background: rgba(255, 5.43, 5.43, 0.50);
}

/* ============ 今日寄语 ============ */
.quote {
  color: rgba(4.22, 111.74, 43.64, 0.50);
  font-size: 22px;
  font-family: 'Li Xuke', Inter;
  font-weight: 500;
  line-height: 35px;
  text-align: center;
  padding: 16px 0;
}

/* ============ 响应式适配 ============ */
@media (max-width: 1200px) {
  .cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .welcome {
    font-size: 36px;
  }

  .task-title {
    font-size: 26px;
  }
}
</style>
