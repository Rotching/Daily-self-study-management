<script setup>
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import StudySidebar from '@/components/StudySidebar.vue'

const priorityMeta = {
  high: { label: '高优先级', short: '高', tone: 'high', stars: 5 },
  medium: { label: '中优先级', short: '中', tone: 'medium', stars: 3 },
  low: { label: '低优先级', short: '低', tone: 'low', stars: 2 }
}

const taskForm = reactive({
  name: '',
  hours: 1,
  minutes: 0,
  priority: 'high'
})

const createForm = reactive({
  name: '',
  duration: 30,
  priority: 'medium',
  reminderEnabled: false,
  reminderDate: toDateValue(new Date()),
  reminderTime: '08:00'
})

const tasks = ref([
  {
    id: 1,
    name: '英语阅读4篇',
    priority: 'medium',
    minutes: 45,
    progress: 68,
    completed: false,
    rating: 3,
    summary: '',
    reminder: '',
    note: '完成两篇精读后整理生词，剩余两篇用计时阅读。'
  },
  {
    id: 2,
    name: '高数错题整理',
    priority: 'high',
    minutes: 70,
    progress: 68,
    completed: false,
    rating: 3,
    summary: '',
    reminder: '',
    note: '重点复盘极限与导数题型，补齐步骤里的薄弱点。'
  }
])

const viewMode = ref('dashboard')
const activeTaskId = ref(null)
const formError = ref('')
const createError = ref('')
const dailyProgress = ref(75)
const successModalOpen = ref(false)
const datePickerOpen = ref(false)
const selectedDate = ref(toDateValue(new Date()))
const calendarCursor = ref(new Date())

const activeTask = computed(() => tasks.value.find((task) => task.id === activeTaskId.value))

const selectedDateLabel = computed(() => {
  const date = new Date(`${selectedDate.value}T00:00:00`)
  const today = new Date()
  const isToday = date.toDateString() === today.toDateString()
  return isToday ? '今日计划' : `${date.getMonth() + 1}月${date.getDate()}日计划`
})

const calendarTitle = computed(() =>
  `${calendarCursor.value.getFullYear()}年 ${calendarCursor.value.getMonth() + 1}月`
)

const calendarDays = computed(() => {
  const year = calendarCursor.value.getFullYear()
  const month = calendarCursor.value.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const lastDate = new Date(year, month + 1, 0).getDate()
  const previousLastDate = new Date(year, month, 0).getDate()
  return Array.from({ length: 42 }, (_, index) => {
    const offset = index - firstDay + 1
    const date = offset < 1
      ? new Date(year, month - 1, previousLastDate + offset)
      : offset > lastDate
        ? new Date(year, month + 1, offset - lastDate)
        : new Date(year, month, offset)
    return {
      date,
      label: date.getDate(),
      currentMonth: date.getMonth() === month,
      value: toDateValue(date)
    }
  })
})

const taskAverageProgress = computed(() => {
  if (!tasks.value.length) return 0
  const total = tasks.value.reduce((sum, task) => sum + task.progress, 0)
  return Math.round(total / tasks.value.length)
})

const completedCount = computed(() => tasks.value.filter((task) => task.completed).length)
const totalMinutes = computed(() => tasks.value.reduce((sum, task) => sum + task.minutes, 0))

const sortedTasks = computed(() => {
  const order = { high: 0, medium: 1, low: 2 }
  return [...tasks.value].sort((a, b) => order[a.priority] - order[b.priority])
})

const progressStyle = computed(() => ({
  background: `conic-gradient(#739f8c ${dailyProgress.value * 3.6}deg, #d9ebe3 0deg)`
}))

const detailProgressStyle = computed(() => ({
  '--detail-progress': `${activeTask.value?.progress ?? 0}%`
}))

const formatDuration = (minutes) => {
  const hour = Math.floor(minutes / 60)
  const minute = minutes % 60
  if (hour && minute) return `${hour}小时${minute}分钟`
  if (hour) return `${hour}小时`
  return `${minute}分钟`
}

const clampNumber = (value, min, max) => {
  const number = Number(value)
  if (Number.isNaN(number)) return min
  return Math.min(Math.max(number, min), max)
}

function toDateValue(date) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

const normalizeTask = (task) => ({
  rating: 0,
  summary: '',
  reminder: '',
  note: '记录专注过程，完成后可以补充任务小结。',
  ...task
})

const persistTasks = () => {
  localStorage.setItem('daily-study-tasks', JSON.stringify(tasks.value))
}

const addTask = () => {
  const name = taskForm.name.trim()
  const hours = clampNumber(taskForm.hours, 0, 12)
  const minutes = clampNumber(taskForm.minutes, 0, 59)
  const duration = hours * 60 + minutes

  if (!name) {
    formError.value = '请先写下任务名称'
    return
  }

  if (duration <= 0) {
    formError.value = '预计时长至少为 1 分钟'
    return
  }

  const nextTask = normalizeTask({
    id: Date.now(),
    name,
    priority: taskForm.priority,
    minutes: duration,
    progress: 0,
    completed: false,
    note: '新加入清单，开始后可以逐步更新完成状态。'
  })

  tasks.value.unshift(nextTask)
  taskForm.name = ''
  taskForm.hours = 1
  taskForm.minutes = 0
  taskForm.priority = 'high'
  formError.value = ''
  successModalOpen.value = true
}

const addDetailedTask = () => {
  const name = createForm.name.trim()
  if (!name) {
    createError.value = '请填写任务名称'
    return
  }

  const nextTask = normalizeTask({
    id: Date.now(),
    name,
    priority: createForm.priority,
    minutes: createForm.duration,
    progress: 0,
    completed: false,
    reminder: createForm.reminderEnabled
      ? `${createForm.reminderDate} ${createForm.reminderTime}`
      : ''
  })
  tasks.value.unshift(nextTask)
  createForm.name = ''
  createForm.duration = 30
  createForm.priority = 'medium'
  createForm.reminderEnabled = false
  createError.value = ''
  successModalOpen.value = true
}

const toggleCompleted = (task) => {
  task.completed = !task.completed
  task.progress = task.completed ? 100 : Math.min(task.progress, 68)
}

const openDetail = (taskId) => {
  activeTaskId.value = taskId
  viewMode.value = 'detail'
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const openCreate = () => {
  viewMode.value = 'create'
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const backToDashboard = () => {
  viewMode.value = 'dashboard'
  activeTaskId.value = null
  successModalOpen.value = false
}

const closeSuccess = (continueAdding = false) => {
  successModalOpen.value = false
  if (continueAdding) {
    viewMode.value = 'create'
    requestAnimationFrame(() => document.querySelector('#create-task-name')?.focus())
  } else {
    backToDashboard()
  }
}

const saveTaskDetail = () => {
  if (!activeTask.value) return
  activeTask.value.completed = activeTask.value.progress === 100
  persistTasks()
  backToDashboard()
}

const setRating = (rating) => {
  if (activeTask.value) activeTask.value.rating = rating
}

const shiftMonth = (offset) => {
  calendarCursor.value = new Date(
    calendarCursor.value.getFullYear(),
    calendarCursor.value.getMonth() + offset,
    1
  )
}

const chooseDate = (value) => {
  selectedDate.value = value
  datePickerOpen.value = false
}

const handleEscape = (event) => {
  if (event.key !== 'Escape') return
  if (successModalOpen.value) successModalOpen.value = false
  else if (datePickerOpen.value) datePickerOpen.value = false
  else if (viewMode.value !== 'dashboard') backToDashboard()
}

watch(tasks, persistTasks, { deep: true })

onMounted(() => {
  const savedTasks = localStorage.getItem('daily-study-tasks')
  if (savedTasks) {
    try {
      const parsed = JSON.parse(savedTasks)
      if (Array.isArray(parsed)) tasks.value = parsed.map(normalizeTask)
    } catch {
      localStorage.removeItem('daily-study-tasks')
    }
  }
  window.addEventListener('keydown', handleEscape)
})

onUnmounted(() => window.removeEventListener('keydown', handleEscape))
</script>

<template>
  <div class="study-page">
    <StudySidebar active="task" />

    <main class="main-panel">
      <template v-if="viewMode === 'dashboard'">
      <header class="page-header">
        <div>
          <h1>{{ selectedDateLabel }}</h1>
          <p>自由计划，记录每一次成长</p>
        </div>
        <div class="date-control">
          <button
            class="date-button"
            type="button"
            :aria-expanded="datePickerOpen"
            aria-controls="plan-calendar"
            @click="datePickerOpen = !datePickerOpen"
          >修改日期</button>
          <div v-if="datePickerOpen" id="plan-calendar" class="calendar-popover">
            <div class="calendar-head">
              <button type="button" aria-label="上个月" @click="shiftMonth(-1)">‹</button>
              <strong>{{ calendarTitle }}</strong>
              <button type="button" aria-label="下个月" @click="shiftMonth(1)">›</button>
            </div>
            <div class="calendar-weekdays" aria-hidden="true">
              <span v-for="day in ['日', '一', '二', '三', '四', '五', '六']" :key="day">{{ day }}</span>
            </div>
            <div class="calendar-grid">
              <button
                v-for="day in calendarDays"
                :key="day.value"
                type="button"
                :class="{ muted: !day.currentMonth, selected: day.value === selectedDate }"
                :aria-label="day.value"
                @click="chooseDate(day.value)"
              >{{ day.label }}</button>
            </div>
          </div>
        </div>
      </header>

      <div class="rule"></div>

      <section class="workspace" aria-label="今日自习计划">
        <div class="summary-card" aria-label="今日总进度">
          <div class="summary-title">今日总进度</div>
          <div class="progress-ring" :style="progressStyle">
            <div class="progress-core">
              <strong>{{ dailyProgress }}%</strong>
            </div>
          </div>
          <div class="summary-foot">
            <span>已完成 {{ completedCount }}/{{ tasks.length }}</span>
            <span>{{ formatDuration(totalMinutes) }}</span>
          </div>
        </div>

        <form class="add-panel" @submit.prevent="addTask">
          <div class="form-heading">
            <span>+ 添加新任务</span>
            <button type="button" @click="openCreate">更多</button>
          </div>

          <label class="form-row task-name-row">
            <span class="row-label">任务名称</span>
            <input v-model="taskForm.name" type="text" maxlength="24" aria-label="任务名称" />
          </label>

          <div class="duration-row">
            <span class="row-label">预计时长</span>
            <label class="duration-input">
              <input
                v-model.number="taskForm.hours"
                type="number"
                min="0"
                max="12"
                aria-label="预计小时"
              />
              <span>时</span>
            </label>
            <label class="duration-input">
              <span class="visually-hidden">预计分钟</span>
              <input
                v-model.number="taskForm.minutes"
                type="number"
                min="0"
                max="59"
                aria-label="预计分钟"
              />
              <span>分</span>
            </label>
          </div>

          <fieldset class="priority-field">
            <legend>优先级</legend>
            <label
              v-for="(meta, key) in priorityMeta"
              :key="key"
              class="priority-choice"
              :class="{ selected: taskForm.priority === key }"
            >
              <input v-model="taskForm.priority" type="radio" :value="key" />
              <span>{{ meta.short }}</span>
            </label>
          </fieldset>

          <div class="form-footer">
            <p class="form-error" aria-live="polite">{{ formError }}</p>
            <button class="add-button" type="submit">加入清单</button>
          </div>
        </form>
      </section>

      <section class="task-list" aria-label="自习清单">
        <div class="section-head">
          <h2>自习清单</h2>
          <span>进度：{{ taskAverageProgress }}%</span>
        </div>

        <article
          v-for="task in sortedTasks"
          :key="task.id"
          class="task-card"
          :class="[{ done: task.completed }, priorityMeta[task.priority].tone]"
        >
          <div class="task-main">
            <div class="task-meta">
              <span class="priority-text">{{ priorityMeta[task.priority].label }}</span>
              <span>{{ formatDuration(task.minutes) }}</span>
            </div>
            <button class="complete-toggle" type="button" @click="toggleCompleted(task)">
              <span class="check-dot" aria-hidden="true"></span>
              <span>{{ task.completed ? '已完成' : '进行中' }}</span>
            </button>
            <h3>{{ task.name }}</h3>
          </div>

          <div class="task-side">
            <div class="stars" :aria-label="`${priorityMeta[task.priority].stars}星优先级`">
              <span
                v-for="star in 5"
                :key="star"
                class="star"
                :class="{ filled: star <= priorityMeta[task.priority].stars }"
                aria-hidden="true"
              ></span>
            </div>
            <div class="card-progress">
              <span>进度：</span>
              <strong>{{ task.progress }}%</strong>
            </div>
            <button class="detail-button" type="button" @click="openDetail(task.id)">
              详情 &gt;
            </button>
          </div>
        </article>

      </section>
      </template>

      <template v-else-if="viewMode === 'create'">
        <header class="page-header subpage-header">
          <div>
            <h1>新增任务</h1>
            <p>任务可以随时调整，不必一次做到完美</p>
          </div>
        </header>
        <div class="rule"></div>

        <form class="create-card" @submit.prevent="addDetailedTask">
          <h2>任务基本信息</h2>
          <label class="stack-field">
            <span>任务名称</span>
            <input id="create-task-name" v-model="createForm.name" maxlength="24" type="text" />
          </label>

          <fieldset class="option-group">
            <legend>预计专注时长</legend>
            <button
              v-for="duration in [15, 30, 45, 60]"
              :key="duration"
              type="button"
              :class="{ selected: createForm.duration === duration }"
              @click="createForm.duration = duration"
            >{{ duration }}分钟</button>
            <label class="custom-duration">
              <span class="visually-hidden">自定义分钟数</span>
              <input v-model.number="createForm.duration" type="number" min="1" max="720" />
              <span>自定义</span>
            </label>
          </fieldset>

          <fieldset class="option-group priority-buttons">
            <legend>优先级</legend>
            <button
              v-for="(meta, key) in priorityMeta"
              :key="key"
              type="button"
              :class="{ selected: createForm.priority === key }"
              @click="createForm.priority = key"
            >{{ meta.short }}</button>
          </fieldset>

          <fieldset class="reminder-group">
            <legend>提醒时间（可选）</legend>
            <div class="reminder-controls" :class="{ disabled: !createForm.reminderEnabled }">
              <input v-model="createForm.reminderDate" type="date" :disabled="!createForm.reminderEnabled" />
              <input v-model="createForm.reminderTime" type="time" :disabled="!createForm.reminderEnabled" />
            </div>
            <label class="check-label">
              <input v-model="createForm.reminderEnabled" type="checkbox" />
              <span>开启提醒</span>
            </label>
          </fieldset>

          <p class="form-error" aria-live="polite">{{ createError }}</p>
          <div class="page-actions">
            <button class="secondary-button" type="button" @click="backToDashboard">取消</button>
            <button class="primary-button" type="submit">确认</button>
          </div>
        </form>
      </template>

      <template v-else-if="viewMode === 'detail' && activeTask">
        <header class="detail-header">
          <p>任务详情</p>
          <h1>{{ activeTask.name }}</h1>
        </header>
        <div class="rule"></div>

        <section class="detail-card">
          <div class="task-meta detail-meta">
            <span :class="priorityMeta[activeTask.priority].tone">{{ priorityMeta[activeTask.priority].label }}</span>
            <span>耗时{{ formatDuration(activeTask.minutes) }}</span>
            <span v-if="activeTask.reminder">提醒 {{ activeTask.reminder }}</span>
          </div>

          <div class="progress-editor">
            <div class="detail-section-title">
              <span>当前任务进度</span>
              <strong>{{ activeTask.progress }}%</strong>
            </div>
            <input
              v-model.number="activeTask.progress"
              class="progress-slider"
              type="range"
              min="0"
              max="100"
              step="1"
              :style="detailProgressStyle"
              aria-label="当前任务进度"
            />
            <div class="range-labels"><span>0%</span><span>100%</span></div>
          </div>

          <div class="rating-editor">
            <h2>自我评价</h2>
            <div class="rating-stars" :aria-label="`当前评分 ${activeTask.rating} 星`">
              <button
                v-for="star in 5"
                :key="star"
                type="button"
                :class="{ active: star <= activeTask.rating }"
                :aria-label="`${star}星`"
                @click="setRating(star)"
              >★</button>
            </div>
          </div>

          <label class="summary-editor">
            <span>任务小结（可选）</span>
            <textarea
              v-model="activeTask.summary"
              maxlength="200"
              placeholder="在此处输入任务小结"
            ></textarea>
          </label>

          <div class="page-actions detail-actions">
            <button class="secondary-button" type="button" @click="backToDashboard">退出</button>
            <button class="primary-button" type="button" @click="saveTaskDetail">保存</button>
          </div>
        </section>
      </template>
    </main>

    <div v-if="successModalOpen" class="modal-backdrop" role="presentation" @click.self="closeSuccess(false)">
      <section class="success-modal" role="dialog" aria-modal="true" aria-labelledby="success-title">
        <button class="modal-close" type="button" aria-label="关闭" @click="closeSuccess(false)">×</button>
        <div class="success-icon" aria-hidden="true"></div>
        <h2 id="success-title">加入清单成功！</h2>
        <p>好的开始是成功的一半<br />制定计划后，要坚持完成哦</p>
        <div class="modal-actions">
          <button class="secondary-button" type="button" @click="closeSuccess(true)">继续添加</button>
          <button class="primary-button" type="button" @click="closeSuccess(false)">返回</button>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.study-page {
  --page-bg: #f7f5f0;
  --surface: #ffffff;
  --green: #739f8c;
  --green-strong: #5c8876;
  --green-soft: #d9ebe3;
  --green-muted: rgba(4, 112, 44, 0.5);
  --sand: #e6d4b5;
  --sand-soft: rgba(230, 212, 181, 0.22);
  --brown: #764b00;
  --text: #594f47;
  --text-dark: rgba(0, 0, 0, 0.7);
  --muted: #948477;
  --danger: rgba(249, 0, 0, 0.5);
  min-height: 100vh;
  display: flex;
  background: var(--page-bg);
  color: var(--text);
  overflow: hidden;
}

.sidebar {
  width: clamp(244px, 21.5vw, 310px);
  min-height: 100vh;
  padding: 52px 22px 42px;
  display: flex;
  flex-direction: column;
  gap: 58px;
}

.brand {
  color: var(--green);
  font-size: clamp(24px, 2.2vw, 32px);
  font-weight: 600;
  line-height: 1.25;
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 44px;
}

.menu-item {
  width: 100%;
  height: 65px;
  border: 0;
  border-radius: 10px;
  padding: 0 26px;
  display: flex;
  align-items: center;
  gap: 18px;
  background: var(--sand-soft);
  color: var(--green-muted);
  font: inherit;
  font-size: 24px;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    background 0.2s ease,
    color 0.2s ease;
}

.menu-item:hover {
  transform: translateX(4px);
}

.menu-item.active {
  background: var(--green-muted);
  color: #ffffff;
}

.menu-icon {
  position: relative;
  width: 24px;
  height: 24px;
  flex: 0 0 24px;
  color: currentColor;
}

.icon-home::before {
  content: '';
  position: absolute;
  inset: 7px 3px 3px;
  border: 2px solid currentColor;
  border-top: 0;
  border-radius: 2px;
}

.icon-home::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 3px;
  width: 14px;
  height: 14px;
  border-left: 2px solid currentColor;
  border-top: 2px solid currentColor;
  transform: rotate(45deg);
}

.icon-task,
.icon-message,
.icon-growth {
  border: 2px solid currentColor;
  border-radius: 5px;
}

.icon-task::before,
.icon-task::after {
  content: '';
  position: absolute;
  left: 6px;
  right: 6px;
  height: 2px;
  background: currentColor;
}

.icon-task::before {
  top: 8px;
}

.icon-task::after {
  top: 14px;
}

.icon-message::before {
  content: '';
  position: absolute;
  left: 4px;
  right: 4px;
  top: 8px;
  height: 2px;
  background: currentColor;
  box-shadow: 0 6px 0 currentColor;
}

.icon-growth::before {
  content: '';
  position: absolute;
  left: 5px;
  bottom: 5px;
  width: 4px;
  height: 7px;
  background: currentColor;
  box-shadow:
    6px -4px 0 currentColor,
    12px -9px 0 currentColor;
}

.settings {
  margin-top: auto;
  width: max-content;
  border: 0;
  background: transparent;
  color: rgba(118, 75, 0, 0.5);
  display: flex;
  align-items: center;
  gap: 8px;
  font: inherit;
  font-size: 20px;
  cursor: pointer;
}

.settings-icon {
  width: 30px;
  height: 30px;
  border: 2px solid currentColor;
  border-radius: 50%;
  position: relative;
}

.settings-icon::before {
  content: '';
  position: absolute;
  inset: 8px;
  border: 2px solid currentColor;
  border-radius: 50%;
}

.main-panel {
  flex: 1;
  min-width: 0;
  min-height: 100vh;
  max-height: 100vh;
  overflow-y: auto;
  background: var(--surface);
  padding: 54px clamp(28px, 4vw, 58px) 48px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}

.page-header h1 {
  margin: 0 0 18px;
  color: var(--text-dark);
  font-size: clamp(36px, 4vw, 48px);
  font-weight: 400;
  line-height: 1.05;
}

.page-header p {
  margin: 0;
  color: var(--green-muted);
  font-size: 20px;
  line-height: 1.4;
}

.date-button,
.add-button {
  border: 0;
  border-radius: 10px;
  background: #7cb18d;
  color: #ffffff;
  font: inherit;
  cursor: pointer;
  box-shadow: 0 10px 24px rgba(92, 136, 118, 0.18);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.date-button {
  width: 184px;
  height: 60px;
  font-size: 24px;
}

.date-control {
  position: relative;
  z-index: 20;
}

.calendar-popover {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  width: 318px;
  padding: 16px;
  border: 1px solid var(--sand);
  border-radius: 10px;
  background: #ffffff;
  box-shadow: 0 16px 42px rgba(89, 79, 71, 0.18);
}

.calendar-head,
.calendar-weekdays,
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  align-items: center;
}

.calendar-head {
  grid-template-columns: 36px 1fr 36px;
  margin-bottom: 12px;
}

.calendar-head strong {
  text-align: center;
  font-size: 16px;
  font-weight: 600;
}

.calendar-head button,
.calendar-grid button {
  border: 0;
  background: transparent;
  color: var(--text);
  font: inherit;
  cursor: pointer;
}

.calendar-head button {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  font-size: 24px;
}

.calendar-weekdays span {
  padding: 7px 0;
  color: var(--muted);
  text-align: center;
  font-size: 12px;
}

.calendar-grid button {
  aspect-ratio: 1;
  border-radius: 50%;
  font-size: 13px;
}

.calendar-grid button:hover,
.calendar-head button:hover {
  background: var(--green-soft);
}

.calendar-grid button.muted {
  color: #c6bbb3;
}

.calendar-grid button.selected {
  background: var(--green-strong);
  color: #ffffff;
}

.date-button:hover,
.add-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 28px rgba(92, 136, 118, 0.22);
}

.date-button:focus-visible,
.add-button:focus-visible,
.menu-item:focus-visible,
.settings:focus-visible,
.complete-toggle:focus-visible,
.detail-button:focus-visible,
.form-heading button:focus-visible {
  outline: 3px solid rgba(115, 159, 140, 0.28);
  outline-offset: 3px;
}

.rule {
  height: 1px;
  margin: 34px 0 38px;
  background: var(--sand);
}

.workspace {
  display: grid;
  grid-template-columns: minmax(280px, 363px) minmax(420px, 1fr);
  gap: clamp(28px, 4vw, 47px);
  align-items: stretch;
}

.summary-card {
  min-height: 245px;
  border: 1.5px solid var(--green);
  border-radius: 20px;
  background: rgba(230, 240, 236, 0.2);
  padding: 30px;
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: auto 1fr auto;
  gap: 16px;
}

.summary-title {
  color: var(--text);
  font-size: 24px;
  line-height: 1.25;
}

.progress-ring {
  grid-column: 1 / -1;
  justify-self: center;
  width: 118px;
  height: 118px;
  border-radius: 50%;
  display: grid;
  place-items: center;
}

.progress-core {
  width: 82px;
  height: 82px;
  border-radius: 50%;
  background: var(--surface);
  display: grid;
  place-items: center;
}

.progress-core strong {
  color: var(--green-strong);
  font-size: 36px;
  font-weight: 400;
}

.summary-foot {
  grid-column: 1 / -1;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  color: var(--muted);
  font-size: 16px;
}

.add-panel {
  min-height: 279px;
  border: 2px solid var(--sand);
  border-radius: 16px;
  padding: 24px 38px 28px 28px;
  display: grid;
  grid-template-columns: 112px minmax(220px, 1fr) auto auto;
  column-gap: 16px;
  row-gap: 20px;
  align-items: end;
}

.form-heading {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--text);
  font-size: 32px;
}

.form-heading button {
  border: 0;
  background: transparent;
  color: var(--muted);
  font: inherit;
  font-size: 18px;
  cursor: pointer;
}

.row-label,
.priority-field legend {
  color: var(--green);
  font-size: 22px;
  line-height: 40px;
}

.form-row {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: 112px minmax(0, 1fr);
  gap: 16px;
  align-items: center;
}

.form-row input,
.duration-input input {
  min-width: 0;
  height: 40px;
  border: 1.5px solid var(--sand);
  border-radius: 10px;
  padding: 0 14px;
  color: var(--text);
  font: inherit;
  font-size: 20px;
  outline: none;
}

.form-row input:focus,
.duration-input input:focus {
  border-color: var(--green);
  box-shadow: 0 0 0 3px rgba(115, 159, 140, 0.16);
}

.duration-row {
  grid-column: 1 / 5;
  display: grid;
  grid-template-columns: 112px 92px 92px;
  gap: 16px;
  align-items: center;
}

.duration-row input {
  width: 64px;
  text-align: center;
}

.duration-input {
  display: inline-flex;
  align-items: center;
  gap: 14px;
}

.duration-input span:not(.visually-hidden) {
  color: #8fb8a6;
  font-size: 22px;
  line-height: 40px;
}

.priority-field {
  grid-column: 1 / 5;
  border: 0;
  display: flex;
  align-items: center;
  gap: 18px;
  min-inline-size: 0;
}

.priority-field legend {
  float: left;
  width: 112px;
}

.priority-choice {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #8fb8a6;
  font-size: 22px;
  cursor: pointer;
}

.priority-choice input {
  appearance: none;
  width: 24px;
  height: 24px;
  border: 2px solid #8fb8a6;
  border-radius: 50%;
  display: grid;
  place-items: center;
  cursor: pointer;
}

.priority-choice input::before {
  content: '';
  width: 12px;
  height: 12px;
  border-radius: 50%;
  transform: scale(0);
  background: var(--green-strong);
  transition: transform 0.16s ease;
}

.priority-choice input:checked::before {
  transform: scale(1);
}

.priority-choice.selected {
  color: var(--green-strong);
}

.form-footer {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 20px;
}

.form-error {
  min-height: 24px;
  margin: 0 auto 0 0;
  color: var(--danger);
  font-size: 16px;
}

.add-button {
  width: 120px;
  height: 45px;
  font-size: 18px;
}

.section-head {
  margin: 44px 0 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.section-head h2 {
  margin: 0;
  color: var(--green-muted);
  font-size: 40px;
  font-weight: 400;
}

.section-head span {
  color: rgba(4, 112, 44, 0.75);
  font-size: 24px;
}

.task-list {
  padding-bottom: 16px;
}

.task-card {
  min-height: 167px;
  border: 2px solid var(--sand);
  border-radius: 10px;
  padding: 24px 28px 26px;
  display: flex;
  justify-content: space-between;
  gap: 28px;
  transition:
    border-color 0.2s ease,
    background 0.2s ease;
}

.task-card + .task-card {
  margin-top: 36px;
}

.task-card.high {
  border-color: rgba(230, 212, 181, 0.96);
}

.task-card.done {
  background: rgba(230, 240, 236, 0.34);
}

.task-main {
  min-width: 0;
}

.task-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 28px;
  color: var(--muted);
  font-size: 24px;
}

.task-meta .priority-text {
  color: var(--danger);
}

.task-card.medium .priority-text {
  color: var(--muted);
}

.task-card.low .priority-text {
  color: var(--green);
}

.complete-toggle {
  margin-top: 14px;
  border: 0;
  background: transparent;
  color: rgba(4, 112, 44, 0.75);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font: inherit;
  font-size: 16px;
  cursor: pointer;
}

.check-dot {
  width: 16px;
  height: 16px;
  border: 1.5px solid currentColor;
  border-radius: 4px;
  position: relative;
}

.task-card.done .check-dot {
  background: var(--green);
  border-color: var(--green);
}

.task-card.done .check-dot::before {
  content: '';
  position: absolute;
  left: 4px;
  top: 1px;
  width: 5px;
  height: 9px;
  border: solid #ffffff;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.task-card h3 {
  margin: 10px 0 0;
  color: #70655d;
  font-size: 32px;
  font-weight: 400;
  line-height: 1.3;
}

.task-card.high h3 {
  color: rgba(249, 0, 0, 0.5);
}

.task-note {
  max-width: 620px;
  margin: 12px 0 0;
  color: rgba(4, 112, 44, 0.75);
  font-size: 16px;
  line-height: 1.7;
}

.task-side {
  flex: 0 0 168px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 22px;
}

.stars {
  width: 116px;
  height: 18px;
  display: flex;
  flex-direction: row-reverse;
  justify-content: space-between;
}

.star {
  width: 16px;
  height: 16px;
  clip-path: polygon(50% 0, 61% 34%, 98% 35%, 68% 56%, 79% 91%, 50% 70%, 21% 91%, 32% 56%, 2% 35%, 39% 34%);
  border: 1px solid rgba(118, 75, 0, 0.5);
  background: transparent;
}

.star.filled {
  background: #764b00;
}

.card-progress {
  color: rgba(4, 112, 44, 0.75);
  font-size: 32px;
  white-space: nowrap;
}

.card-progress strong {
  font-weight: 400;
}

.detail-button {
  margin-top: auto;
  border: 0;
  background: transparent;
  color: rgba(4, 112, 44, 0.75);
  font: inherit;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.subpage-header {
  min-height: 82px;
}

.create-card,
.detail-card {
  border: 1.5px solid var(--sand);
  border-radius: 8px;
  padding: clamp(28px, 4vw, 52px);
}

.create-card h2 {
  margin: 0 0 28px;
  color: var(--text);
  font-size: 30px;
  font-weight: 600;
}

.stack-field,
.summary-editor {
  display: grid;
  gap: 10px;
  color: var(--green);
  font-size: 18px;
}

.stack-field input,
.custom-duration input,
.reminder-controls input,
.summary-editor textarea {
  border: 1.5px solid rgba(115, 159, 140, 0.7);
  border-radius: 8px;
  background: #ffffff;
  color: var(--text);
  font: inherit;
  outline: none;
}

.stack-field input {
  height: 48px;
  padding: 0 14px;
  font-size: 18px;
}

.stack-field input:focus,
.custom-duration input:focus,
.reminder-controls input:focus,
.summary-editor textarea:focus {
  border-color: var(--green-strong);
  box-shadow: 0 0 0 3px rgba(115, 159, 140, 0.15);
}

.option-group,
.reminder-group {
  margin-top: 28px;
  padding: 0;
  border: 0;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.option-group legend,
.reminder-group legend {
  width: 100%;
  margin-bottom: 2px;
  color: var(--green);
  font-size: 18px;
}

.option-group > button,
.custom-duration {
  min-width: 92px;
  height: 42px;
  border: 1.5px solid rgba(115, 159, 140, 0.58);
  border-radius: 8px;
  background: #ffffff;
  color: var(--green);
  display: inline-grid;
  place-items: center;
  font: inherit;
  font-size: 16px;
  cursor: pointer;
}

.option-group > button.selected {
  border-color: var(--green);
  background: var(--green);
  color: #ffffff;
}

.custom-duration {
  position: relative;
  min-width: 118px;
  overflow: hidden;
}

.custom-duration input {
  position: absolute;
  inset: 0;
  width: 100%;
  padding: 0 10px;
  opacity: 0;
  cursor: text;
}

.custom-duration:focus-within input {
  opacity: 1;
}

.custom-duration:focus-within span:last-child {
  opacity: 0;
}

.priority-buttons > button {
  min-width: 84px;
}

.reminder-group {
  gap: 12px;
}

.reminder-controls {
  display: flex;
  gap: 10px;
}

.reminder-controls.disabled {
  opacity: 0.48;
}

.reminder-controls input {
  height: 40px;
  padding: 0 10px;
}

.check-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--green);
  font-size: 15px;
  cursor: pointer;
}

.check-label input {
  accent-color: var(--green-strong);
}

.page-actions {
  margin-top: 34px;
  display: flex;
  justify-content: flex-end;
  gap: 18px;
}

.primary-button,
.secondary-button {
  min-width: 112px;
  height: 44px;
  border-radius: 7px;
  font: inherit;
  font-size: 16px;
  cursor: pointer;
}

.primary-button {
  border: 1px solid var(--green);
  background: var(--green);
  color: #ffffff;
}

.secondary-button {
  border: 1px solid #8f8984;
  background: #ffffff;
  color: #625b56;
}

.primary-button:hover,
.secondary-button:hover {
  transform: translateY(-1px);
}

.detail-header p {
  margin: 0 0 16px;
  color: var(--green);
  font-size: 16px;
}

.detail-header h1 {
  margin: 0;
  color: var(--text-dark);
  font-size: clamp(34px, 4vw, 48px);
  font-weight: 400;
}

.detail-card {
  display: grid;
  gap: 42px;
}

.detail-meta {
  gap: 18px;
  font-size: 17px;
}

.detail-meta .high {
  color: var(--danger);
}

.detail-meta .medium {
  color: var(--muted);
}

.detail-meta .low {
  color: var(--green);
}

.detail-section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  color: var(--text);
  font-size: 22px;
}

.detail-section-title strong {
  color: var(--green-strong);
  font-size: 34px;
  font-weight: 400;
}

.progress-slider {
  width: 100%;
  height: 8px;
  margin: 26px 0 6px;
  appearance: none;
  border-radius: 999px;
  background: linear-gradient(
    to right,
    var(--green-strong) 0 var(--detail-progress),
    var(--green-soft) var(--detail-progress) 100%
  );
  cursor: pointer;
}

.progress-slider::-webkit-slider-thumb {
  width: 22px;
  height: 22px;
  appearance: none;
  border: 0;
  border-radius: 50%;
  background: var(--green-strong);
  box-shadow: 0 2px 8px rgba(92, 136, 118, 0.28);
}

.range-labels {
  display: flex;
  justify-content: space-between;
  color: var(--muted);
  font-size: 14px;
}

.rating-editor h2 {
  margin: 0 0 16px;
  color: var(--text);
  font-size: 22px;
  font-weight: 400;
}

.rating-stars {
  display: flex;
  gap: 10px;
}

.rating-stars button {
  border: 0;
  padding: 0;
  background: transparent;
  color: #d8c8aa;
  font-size: 32px;
  line-height: 1;
  cursor: pointer;
}

.rating-stars button.active {
  color: #f0c832;
}

.summary-editor textarea {
  min-height: 78px;
  padding: 14px;
  resize: vertical;
}

.detail-actions {
  margin-top: 0;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(48, 45, 42, 0.34);
  backdrop-filter: blur(1px);
}

.success-modal {
  position: relative;
  width: min(430px, 100%);
  padding: 38px 38px 30px;
  border-radius: 10px;
  background: #ffffff;
  box-shadow: 0 24px 70px rgba(48, 45, 42, 0.22);
  text-align: center;
}

.modal-close {
  position: absolute;
  top: 14px;
  right: 16px;
  width: 30px;
  height: 30px;
  border: 0;
  background: transparent;
  color: var(--text);
  font-size: 22px;
  cursor: pointer;
}

.success-icon {
  width: 54px;
  height: 54px;
  margin: 0 auto 22px;
  border: 3px solid var(--green);
  border-radius: 50%;
  position: relative;
}

.success-icon::before {
  content: '';
  position: absolute;
  left: 15px;
  top: 9px;
  width: 15px;
  height: 25px;
  border: solid var(--green);
  border-width: 0 3px 3px 0;
  transform: rotate(45deg);
}

.success-modal h2 {
  margin: 0 0 22px;
  color: var(--text);
  font-size: 28px;
}

.success-modal p {
  margin: 0;
  padding: 16px;
  border-radius: 8px;
  background: #e9f5ef;
  color: #6f8279;
  font-size: 14px;
  line-height: 1.8;
}

.modal-actions {
  margin-top: 22px;
  display: flex;
  justify-content: center;
  gap: 14px;
}

@media (max-width: 1180px) {
  .study-page {
    overflow: auto;
  }

  .sidebar {
    width: 236px;
    padding-inline: 18px;
  }

  .menu {
    gap: 24px;
  }

  .menu-item {
    height: 58px;
    font-size: 21px;
  }

  .workspace {
    grid-template-columns: 1fr;
  }

  .add-panel {
    grid-template-columns: 104px minmax(0, 1fr);
  }

  .form-row {
    grid-template-columns: 104px minmax(0, 1fr);
  }

  .duration-row,
  .priority-field,
  .form-footer {
    grid-column: 1 / -1;
  }
}

@media (max-width: 760px) {
  .study-page {
    display: block;
  }

  .sidebar {
    width: 100%;
    min-height: auto;
    padding: 24px 18px;
    gap: 22px;
  }

  .brand {
    font-size: 24px;
  }

  .menu {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .menu-item {
    height: 52px;
    padding-inline: 16px;
    font-size: 18px;
  }

  .settings {
    display: none;
  }

  .main-panel {
    min-height: auto;
    max-height: none;
    padding: 28px 18px 36px;
  }

  .page-header {
    align-items: stretch;
    flex-direction: column;
  }

  .date-button {
    width: 100%;
    height: 52px;
    font-size: 20px;
  }

  .calendar-popover {
    left: 0;
    right: auto;
    width: min(318px, calc(100vw - 36px));
  }

  .add-panel {
    padding: 22px 18px;
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  .form-row,
  .duration-row {
    display: grid;
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .duration-row {
    row-gap: 12px;
  }

  .duration-input {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 28px;
  }

  .duration-row input {
    width: 100%;
  }

  .priority-field {
    flex-wrap: wrap;
  }

  .priority-field legend {
    float: none;
    width: 100%;
  }

  .form-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .add-button {
    width: 100%;
  }

  .section-head {
    align-items: flex-start;
    flex-direction: column;
  }

  .section-head h2 {
    font-size: 34px;
  }

  .task-card {
    flex-direction: column;
    gap: 18px;
  }

  .task-side {
    flex: none;
    align-items: flex-start;
  }

  .card-progress {
    font-size: 26px;
  }

  .create-card,
  .detail-card {
    padding: 24px 18px;
  }

  .option-group > button,
  .custom-duration {
    min-width: calc(50% - 8px);
  }

  .reminder-controls {
    width: 100%;
    flex-direction: column;
  }

  .page-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .page-actions button {
    width: 100%;
  }

  .detail-card {
    gap: 32px;
  }

  .success-modal {
    padding-inline: 24px;
  }
}

/* Shared type and spacing scale used across all primary pages. */
.main-panel {
  padding: var(--app-page-padding-y) var(--app-page-padding-x) 40px;
}

.page-header h1,
.detail-header h1 {
  font-size: var(--app-title-size);
}

.page-header p {
  font-size: 16px;
}

.date-button {
  width: 158px;
  height: var(--app-control-height);
  border-radius: var(--app-radius);
  font-size: 16px;
}

.summary-card,
.add-panel,
.task-card,
.create-card,
.detail-card,
.success-modal {
  border-radius: var(--app-radius);
}

.summary-title {
  font-size: 18px;
}

.progress-core strong {
  font-size: 30px;
}

.form-heading {
  font-size: 24px;
}

.row-label,
.priority-field legend,
.priority-choice,
.duration-input span:not(.visually-hidden) {
  font-size: 16px;
}

.form-row input,
.duration-input input {
  font-size: 16px;
}

.section-head h2 {
  font-size: 30px;
}

.section-head span,
.task-meta {
  font-size: 17px;
}

.task-card h3 {
  font-size: 24px;
}

.card-progress {
  font-size: 22px;
}

.create-card h2 {
  font-size: 26px;
}

.detail-section-title,
.rating-editor h2 {
  font-size: 19px;
}

.detail-section-title strong {
  font-size: 30px;
}

@media (max-width: 760px) {
  .main-panel {
    padding: var(--app-page-padding-y) var(--app-page-padding-x) 36px;
  }

  .date-button {
    width: 100%;
  }

  .section-head h2 {
    font-size: 27px;
  }
}
</style>
