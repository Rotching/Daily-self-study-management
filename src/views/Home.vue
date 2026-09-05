<script setup>
import { onMounted, ref } from 'vue'
import StudySidebar from '@/components/StudySidebar.vue'
import { getGreeting } from '@/api/common'
import { getDailyTasks } from '@/api/tasks'
import { getUserProfile, getUserStatistics } from '@/api/user'

const homeData = ref({
  // 用户信息
  greeting: '今日自律，稳步精进',
  username: '同学',
  subtitle: '不追赶谁，照顾自己的节奏就很好',
  // 核心数据卡片
  todayCompletion: 0,
  weeklyDays: 0,
  unlockedMessages: 0,
  totalHours: 0,
  totalMinutes: 0,
  // 今日任务概况
  totalTasks: 0,
  completedTasks: 0,
  pendingList: [],
  // 今日寄语
  dailyQuote: '你留下的每一滴汗水，都在悄悄浇灌未来的花朵。'
})
const loading = ref(true)
const errorMessage = ref('')

const priorityMeta = {
  1: { key: 'low', label: '低优先级' },
  2: { key: 'medium', label: '中优先级' },
  3: { key: 'high', label: '高优先级' },
  low: { key: 'low', label: '低优先级' },
  medium: { key: 'medium', label: '中优先级' },
  high: { key: 'high', label: '高优先级' }
}

const toDateValue = (date) => `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}-${`${date.getDate()}`.padStart(2, '0')}`
const normalizePriority = (priority) => priorityMeta[String(priority).toLowerCase()] || priorityMeta[2]

const loadHome = async () => {
  loading.value = true
  errorMessage.value = ''
  const results = await Promise.allSettled([
    getUserProfile(), getUserStatistics(), getDailyTasks(toDateValue(new Date())), getGreeting()
  ])
  const [profileResult, statisticsResult, tasksResult, greetingResult] = results
  if (profileResult.status === 'fulfilled') {
    const profile = profileResult.value
    homeData.value.username = profile.displayName || profile.username || '同学'
    homeData.value.subtitle = profile.motto || homeData.value.subtitle
  }
  if (statisticsResult.status === 'fulfilled') {
    const statistics = statisticsResult.value
    const total = Number(statistics.totalStudyDuration) || 0
    homeData.value.todayCompletion = Number(statistics.todayCompletion?.percentage) || 0
    homeData.value.weeklyDays = statistics.weekStatistics?.filter((day) => Number(day.duration) > 0).length || statistics.weekGrowth?.nodeCount || 0
    homeData.value.unlockedMessages = Number(statistics.totalUnlocked) || 0
    homeData.value.totalHours = Math.floor(total / 60)
    homeData.value.totalMinutes = total % 60
  }
  if (tasksResult.status === 'fulfilled') {
    const daily = tasksResult.value || {}
    const tasks = Array.isArray(daily.tasks) ? daily.tasks : []
    if (Number.isFinite(Number(daily.totalCompletion))) homeData.value.todayCompletion = Number(daily.totalCompletion)
    homeData.value.totalTasks = tasks.length
    homeData.value.completedTasks = tasks.filter((task) => task.status === 'completed' || Number(task.progress) >= 100).length
    homeData.value.pendingList = tasks
      .filter((task) => String(task.status).toLowerCase() !== 'completed' && Number(task.progress) < 100)
      .map((task) => ({
        id: task.taskId ?? task.id ?? task.taskName,
        name: task.taskName || task.name || '未命名任务',
        priority: normalizePriority(task.priority)
      }))
  }
  if (greetingResult.status === 'fulfilled' && greetingResult.value?.greeting) {
    homeData.value.dailyQuote = greetingResult.value.greeting
    homeData.value.greeting = `第 ${greetingResult.value.week || '-'} 周 · 今日自律，稳步精进`
  }
  const failures = results.filter((result) => result.status === 'rejected')
  if (failures.length === results.length) errorMessage.value = failures[0].reason?.message || '首页数据加载失败'
  else if (failures.length) errorMessage.value = '部分数据暂时未能加载，已展示可用内容'
  loading.value = false
}

onMounted(loadHome)

</script>

<template>
  <div class="home-container">
    <StudySidebar active="home" />

    <!-- 主内容区 -->
    <main class="content">
      <!-- 顶部问候 -->
      <header class="header">
        <div class="greeting">{{ homeData.greeting }}</div>
        <h1 class="welcome">你好，{{ homeData.username }}</h1>
        <div class="subtitle">{{ homeData.subtitle }}</div>
      </header>

      <div class="divider"></div>
      <p v-if="loading || errorMessage" class="load-state" :class="{ error: errorMessage }" role="status">{{ loading ? '正在同步今日数据…' : errorMessage }}</p>

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
                :key="item.id"
                class="pending-item"
              >
                <span class="pending-name">{{ idx + 1 }}. {{ item.name }}</span>
                <span class="priority" :class="item.priority.key">{{ item.priority.label }}</span>
              </div>
              <p v-if="!loading && !homeData.pendingList.length" class="pending-empty">今天没有待完成任务</p>
            </div>
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
.load-state{margin:-8px 0 22px;color:var(--app-green);font-size:13px}.load-state.error{color:#b86a6c}

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
}

/* ============ 主内容区 ============ */
.content {
  flex: 1;
  height: 100%;
  background: white;
  padding: var(--app-page-padding-y) var(--app-page-padding-x) 40px;
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
  font-size: 14px;
  margin-bottom: 16px;
}

.welcome {
  color: rgba(0, 0, 0, 0.70);
  font-size: var(--app-title-size);
  font-weight: 400;
  margin: 0 0 28px 0;
}

.subtitle {
  color: rgba(4.22, 111.74, 43.64, 0.50);
  font-size: 16px;
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
  gap: 18px;
  margin-bottom: 32px;
}

.card {
  min-height: 126px;
  border-radius: var(--app-radius);
  border: 1.5px solid #e6d4b5;
  padding: 22px 24px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.card-label {
  color: #764b00;
  font-size: 15px;
  margin-bottom: 18px;
}

.card-value {
  color: black;
  font-size: 32px;
  font-weight: 400;
}

.unit {
  color: #8fb8a6;
  font-size: 15px;
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
  font-size: 26px;
  font-weight: 400;
  margin: 0;
}

.task-summary {
  color: #70655d;
  font-size: 17px;
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
  border: 1.5px solid #739f8c;
  border-radius: var(--app-radius);
  padding: 30px 28px;
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
  font-size: 17px;
  flex-shrink: 0;
}

.pending-list {
  min-width: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pending-item {
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  color: #948477;
  font-size: 17px;
  line-height: 1.5;
}

.pending-name {
  min-width: 0;
  overflow-wrap: anywhere;
}

.pending-empty {
  margin: 0;
  color: #9aaca3;
  font-size: 15px;
}

.priority {
  min-width: 82px;
  height: 30px;
  flex: 0 0 auto;
  border-radius: 15px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-family: Inter;
}

.priority.low {
  background: #8fb8a6;
}

.priority.medium {
  background: #e6d4b5;
}

.priority.high {
  background: rgba(255, 5.43, 5.43, 0.50);
}

/* ============ 今日寄语 ============ */
.quote {
  color: rgba(4.22, 111.74, 43.64, 0.50);
  font-size: 17px;
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

@media (max-width: 768px) {
  .home-container {
    height: auto;
    min-height: 100%;
    display: block;
    overflow: visible;
  }

  .content {
    height: auto;
    min-height: 0;
    overflow: visible;
  }

  .welcome {
    font-size: var(--app-title-size);
  }

  .cards {
    grid-template-columns: 1fr;
  }

  .task-header {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .task-card,
  .task-pending {
    flex-direction: column;
  }

  .pending-item {
    align-items: flex-start;
  }
}
</style>
