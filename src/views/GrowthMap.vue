<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import StudySidebar from '@/components/StudySidebar.vue'

const records = ref([
  { date: '2026-07-06', minutes: 80, completion: 72, milestone: true, tasks: [{ name: '英语阅读精练', progress: 80, rating: 4 }, { name: '复习高数公式', progress: 65, rating: 3 }] },
  { date: '2026-07-07', minutes: 105, completion: 55, tasks: [{ name: '整理英语生词', progress: 60, rating: 3 }, { name: '线性代数习题', progress: 50, rating: 3 }] },
  { date: '2026-07-08', minutes: 180, completion: 100, tasks: [{ name: '完成阅读训练', progress: 100, rating: 5 }, { name: '高数错题复盘', progress: 100, rating: 4 }] },
  { date: '2026-07-09', minutes: 0, completion: 0, rest: true, tasks: [] },
  { date: '2026-07-10', minutes: 145, completion: 85, tasks: [{ name: '概率论章节练习', progress: 90, rating: 4 }, { name: '单词复习', progress: 80, rating: 4 }] },
  { date: '2026-07-11', minutes: 0, completion: 0, rest: true, tasks: [] },
  { date: '2026-07-12', minutes: 150, completion: 85, tasks: [{ name: '线性代数概念复习', progress: 90, rating: 5 }, { name: '英语长难句精读', progress: 80, rating: 4 }, { name: '高数第三章练习', progress: 65, rating: 3 }, { name: 'Java基础复习', progress: 100, rating: 5 }, { name: '整理今日笔记', progress: 90, rating: 4 }] },
  { date: '2026-07-13', minutes: 250, completion: 100, milestone: true, tasks: [{ name: '高数章节测试复习', progress: 100, rating: 5 }, { name: '英语阅读专项训练', progress: 100, rating: 5 }, { name: '算法基础练习', progress: 100, rating: 4 }] }
])

const selectedDate = ref('2026-07-12')
const pickerOpen = ref(false)
const calendarCursor = ref(new Date(2026, 6, 1))

const selectedRecord = computed(() => records.value.find((record) => record.date === selectedDate.value) ?? {
  date: selectedDate.value, minutes: 0, completion: 0, rest: true, tasks: []
})

const selectedDateText = computed(() => {
  const date = parseDate(selectedDate.value)
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
})

const calendarTitle = computed(() => `${calendarCursor.value.getFullYear()}年 ${calendarCursor.value.getMonth() + 1}月`)

const calendarDays = computed(() => {
  const year = calendarCursor.value.getFullYear()
  const month = calendarCursor.value.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const lastDate = new Date(year, month + 1, 0).getDate()
  const previousLast = new Date(year, month, 0).getDate()
  return Array.from({ length: 42 }, (_, index) => {
    const offset = index - firstDay + 1
    const date = offset < 1
      ? new Date(year, month - 1, previousLast + offset)
      : offset > lastDate ? new Date(year, month + 1, offset - lastDate) : new Date(year, month, offset)
    const value = toDateValue(date)
    return { value, label: date.getDate(), currentMonth: date.getMonth() === month, hasRecord: records.value.some((record) => record.date === value) }
  })
})

const durationText = computed(() => {
  const hour = Math.floor(selectedRecord.value.minutes / 60)
  const minute = selectedRecord.value.minutes % 60
  if (!hour) return `${minute} 分钟`
  return minute ? `${hour} 小时 ${minute} 分` : `${hour} 小时`
})

function parseDate(value) { return new Date(`${value}T00:00:00`) }
function toDateValue(date) {
  return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}-${`${date.getDate()}`.padStart(2, '0')}`
}

const shortDate = (value) => {
  const date = parseDate(value)
  return `${`${date.getMonth() + 1}`.padStart(2, '0')}-${`${date.getDate()}`.padStart(2, '0')}`
}

const chooseDate = (value) => {
  selectedDate.value = value
  localStorage.setItem('growth-selected-date', value)
  const date = parseDate(value)
  calendarCursor.value = new Date(date.getFullYear(), date.getMonth(), 1)
  pickerOpen.value = false
}

const shiftMonth = (offset) => {
  calendarCursor.value = new Date(calendarCursor.value.getFullYear(), calendarCursor.value.getMonth() + offset, 1)
}

const closeOnEscape = (event) => { if (event.key === 'Escape') pickerOpen.value = false }

onMounted(() => {
  const saved = localStorage.getItem('growth-selected-date')
  if (/^\d{4}-\d{2}-\d{2}$/.test(saved ?? '')) chooseDate(saved)
  window.addEventListener('keydown', closeOnEscape)
})
onUnmounted(() => window.removeEventListener('keydown', closeOnEscape))
</script>

<template>
  <div class="growth-page">
    <StudySidebar active="growth" />
    <main class="growth-main">
      <header class="page-header">
        <div>
          <h1>我的成长轨迹</h1>
          <p>不比较，不焦虑，只见证自己的前行之路</p>
        </div>
        <div class="date-control">
          <button class="date-button" type="button" :aria-expanded="pickerOpen" @click="pickerOpen = !pickerOpen">选择日期 <span>⌄</span></button>
          <section v-if="pickerOpen" class="calendar" aria-label="选择成长记录日期">
            <div class="calendar-head">
              <button type="button" aria-label="上个月" @click="shiftMonth(-1)">‹</button>
              <strong>{{ calendarTitle }}</strong>
              <button type="button" aria-label="下个月" @click="shiftMonth(1)">›</button>
            </div>
            <div class="calendar-weekdays" aria-hidden="true"><span v-for="day in ['日', '一', '二', '三', '四', '五', '六']" :key="day">{{ day }}</span></div>
            <div class="calendar-grid">
              <button v-for="day in calendarDays" :key="day.value" type="button" :class="{ muted: !day.currentMonth, selected: day.value === selectedDate, recorded: day.hasRecord }" :aria-label="day.value" @click="chooseDate(day.value)">{{ day.label }}</button>
            </div>
          </section>
        </div>
      </header>

      <div class="rule"></div>

      <section class="timeline-panel">
        <h2>光阴长河 · 成长自律轨迹</h2>
        <div class="timeline">
          <button v-for="record in records" :key="record.date" class="timeline-point" :class="{ active: record.date === selectedDate, rest: record.rest, milestone: record.milestone }" type="button" :aria-label="`${record.date}，完成度${record.completion}%`" @click="chooseDate(record.date)">
            <span class="point-value">{{ record.rest ? '—' : `${record.completion}%` }}</span>
            <span class="point-date">{{ shortDate(record.date) }}</span>
          </button>
        </div>
        <div class="legend">
          <span><i class="legend-dot done"></i>自律日</span><span><i class="legend-dot selected"></i>当前记录</span><span><i class="legend-dot rest"></i>休息日</span><span><i class="legend-dot milestone"></i>阶段节点</span>
        </div>
      </section>

      <section class="record-grid">
        <article class="summary-panel">
          <div class="panel-title"><h2>{{ selectedDateText }} 的回溯</h2><p>{{ selectedRecord.tasks.length ? '这一天的努力，已经被认真记录' : '这一天暂时没有留下自习记录' }}</p></div>
          <div class="metric-grid">
            <div class="metric green"><span>当日学习时长</span><strong>{{ durationText }}</strong></div>
            <div class="metric sand"><span>任务完成度</span><strong>{{ selectedRecord.completion }}%</strong></div>
          </div>
        </article>

        <article class="tasks-panel">
          <div class="panel-title"><h2>自习任务清单（{{ selectedRecord.tasks.length }}项）</h2><p v-if="selectedRecord.tasks.length">{{ selectedRecord.tasks.filter((task) => task.progress === 100).length }} 项已完成</p></div>
          <div v-if="selectedRecord.tasks.length" class="record-tasks">
            <div v-for="(task, index) in selectedRecord.tasks" :key="task.name" class="record-task">
              <span class="task-index">{{ index + 1 }}</span>
              <div class="task-copy"><strong>{{ task.name }}</strong><span class="task-stars" :aria-label="`${task.rating}星评价`"><i v-for="star in 5" :key="star" :class="{ filled: star <= task.rating }">★</i></span></div>
              <span class="task-progress">{{ task.progress }}%</span>
            </div>
          </div>
          <div v-else class="empty-record"><span aria-hidden="true">○</span><p>给自己留一点休息，也是一种稳稳的前进。</p></div>
        </article>
      </section>
    </main>
  </div>
</template>

<style scoped>
.growth-page{--green:#739f8c;--green-strong:#5d8f7a;--green-soft:#dcece5;--sand:#e6d4b5;--sand-soft:#f8f3ea;--text:#5b534d;--muted:#94877d;min-height:100vh;display:flex;background:#f7f5f0;color:var(--text)}
.growth-main{flex:1;min-width:0;min-height:100vh;padding:var(--app-page-padding-y) var(--app-page-padding-x) 40px;background:#fff}.page-header{display:flex;justify-content:space-between;align-items:flex-start;gap:24px}.page-header h1{margin:0 0 16px;color:rgba(0,0,0,.7);font-size:var(--app-title-size);font-weight:400}.page-header p{margin:0;color:rgba(4,112,44,.5);font-size:16px}.date-control{position:relative;z-index:10}.date-button{width:158px;height:var(--app-control-height);border:0;border-radius:var(--app-radius);background:#7caf91;color:#fff;font:inherit;font-size:16px;cursor:pointer}.date-button span{margin-left:12px}.rule{height:1px;margin:28px 0 32px;background:var(--sand)}
.calendar{position:absolute;top:calc(100% + 10px);right:0;width:300px;padding:15px;border:1px solid var(--sand);border-radius:8px;background:#fff;box-shadow:0 16px 38px rgba(75,67,61,.18)}.calendar-head,.calendar-weekdays,.calendar-grid{display:grid;grid-template-columns:repeat(7,1fr);align-items:center}.calendar-head{grid-template-columns:32px 1fr 32px;margin-bottom:8px}.calendar-head strong{text-align:center;font-size:15px}.calendar-head button,.calendar-grid button{border:0;background:transparent;color:var(--text);font:inherit;cursor:pointer}.calendar-head button{height:30px;font-size:22px}.calendar-weekdays span{padding:6px 0;color:var(--muted);text-align:center;font-size:11px}.calendar-grid button{aspect-ratio:1;border-radius:50%;position:relative;font-size:12px}.calendar-grid button.muted{color:#c9c0b9}.calendar-grid button.recorded:after{content:'';position:absolute;left:50%;bottom:2px;width:4px;height:4px;border-radius:50%;background:var(--green);transform:translateX(-50%)}.calendar-grid button.selected{background:#5d5a57;color:#fff}.calendar-grid button.selected:after{background:#fff}
.timeline-panel,.summary-panel,.tasks-panel{border:1.5px solid var(--sand);border-radius:8px;background:#fff}.timeline-panel{padding:30px 34px 24px}.timeline-panel h2,.panel-title h2{margin:0;color:var(--text);font-size:23px;font-weight:500}.timeline{margin:36px 18px 24px;display:grid;grid-template-columns:repeat(8,minmax(52px,1fr));position:relative}.timeline:before{content:'';position:absolute;left:4%;right:4%;top:25px;height:2px;background:repeating-linear-gradient(to right,#a6c8b8 0 10px,transparent 10px 16px)}.timeline-point{border:0;padding:0;display:grid;justify-items:center;gap:10px;background:transparent;color:var(--muted);font:inherit;cursor:pointer;position:relative;z-index:1}.point-value{width:52px;height:52px;border:2px solid #9ec5b4;border-radius:50%;display:grid;place-items:center;background:#fff;color:var(--green-strong);font-size:12px;transition:transform .18s ease,background .18s ease}.timeline-point:hover .point-value{transform:translateY(-3px)}.timeline-point.active .point-value{background:var(--green-strong);color:#fff}.timeline-point.rest .point-value{border-color:#cdd9d3;border-style:dashed;color:#b7c1bc}.timeline-point.milestone .point-value{border-color:#e8c82a;color:#d1a900}.timeline-point.milestone.active .point-value{background:#f2d63e;color:#6c5900}.point-date{font-size:12px}.legend{display:flex;justify-content:center;flex-wrap:wrap;gap:24px;color:var(--muted);font-size:12px}.legend span{display:inline-flex;align-items:center;gap:6px}.legend-dot{width:9px;height:9px;border:1px solid var(--green);border-radius:50%}.legend-dot.selected{background:var(--green)}.legend-dot.rest{border-style:dashed;border-color:#b8c4be}.legend-dot.milestone{border-color:#e8c82a;background:#f2d63e}
.record-grid{margin-top:28px;display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr);align-items:start;gap:28px}.summary-panel,.tasks-panel{min-width:0;padding:28px}.tasks-panel{border-color:var(--green)}.panel-title p{margin:9px 0 0;color:var(--green);font-size:13px}.metric-grid{margin-top:28px;display:grid;grid-template-columns:1fr 1fr;gap:16px}.metric{min-height:112px;border-radius:7px;padding:20px;display:flex;flex-direction:column;justify-content:space-between}.metric.green{background:#eef7f3}.metric.sand{background:var(--sand-soft)}.metric span{color:var(--muted);font-size:13px}.metric strong{color:var(--text);font-size:27px;font-weight:500}.record-tasks{margin-top:20px;display:grid;gap:12px}.record-task{min-height:48px;display:grid;grid-template-columns:30px 1fr auto;align-items:center;gap:12px}.task-index{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:#dcece5;color:var(--green-strong);font-size:12px}.task-copy{min-width:0;display:flex;align-items:center;justify-content:space-between;gap:12px}.task-copy strong{overflow:hidden;color:var(--text);font-size:14px;font-weight:500;text-overflow:ellipsis;white-space:nowrap}.task-stars{flex:0 0 auto;color:#d8caa8;font-size:10px}.task-stars i{font-style:normal}.task-stars i.filled{color:#e8bd1d}.task-progress{color:var(--green-strong);font-size:13px}.empty-record{min-height:140px;display:grid;place-items:center;align-content:center;gap:14px;color:var(--muted);text-align:center}.empty-record span{font-size:42px;color:#b8cec4}.empty-record p{margin:0;line-height:1.6}
@media(max-width:1060px){.timeline{overflow-x:auto;grid-template-columns:repeat(8,82px);justify-content:start;padding-bottom:8px}.record-grid{grid-template-columns:1fr}}@media(max-width:768px){.growth-page{display:block}.growth-main{min-height:auto;padding:28px 16px 36px}.page-header{flex-direction:column}.date-control,.date-button{width:100%}.calendar{left:0;right:auto;width:min(300px,calc(100vw - 32px))}.timeline-panel,.summary-panel,.tasks-panel{padding:22px 18px}.metric-grid{grid-template-columns:1fr}.task-copy{display:grid}}
</style>
