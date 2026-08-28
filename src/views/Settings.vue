<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import StudySidebar from '@/components/StudySidebar.vue'

const STORAGE_KEY = 'daily-study-settings'

const visibility = ref('friends')
const taskReminder = ref(false)
const messageReminder = ref(true)
const nicknameMode = ref('nickname')
const saved = ref(false)
const dialog = ref(null)
let savedTimer

const visibilityText = computed(() => ({
  private: '仅自己可见',
  friends: '同伴可见',
  public: '公开可见'
}[visibility.value]))

const nicknameText = computed(() => nicknameMode.value === 'nickname' ? '使用昵称' : '匿名展示')

const settingsSnapshot = () => ({
  visibility: visibility.value,
  taskReminder: taskReminder.value,
  messageReminder: messageReminder.value,
  nicknameMode: nicknameMode.value
})

const persistSettings = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settingsSnapshot()))
  saved.value = true
  window.clearTimeout(savedTimer)
  savedTimer = window.setTimeout(() => { saved.value = false }, 1600)
}

const exportGrowthRecord = () => {
  const payload = {
    exportedAt: new Date().toISOString(),
    platform: '日常自习管理平台',
    settings: settingsSnapshot(),
    growthRecords: [
      { date: '2026-07-06', minutes: 80, completion: 72 },
      { date: '2026-07-07', minutes: 105, completion: 55 },
      { date: '2026-07-08', minutes: 180, completion: 100 },
      { date: '2026-07-12', minutes: 150, completion: 85 },
      { date: '2026-07-13', minutes: 250, completion: 100 }
    ]
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `成长记录-${new Date().toISOString().slice(0, 10)}.json`
  anchor.click()
  URL.revokeObjectURL(url)
  dialog.value = 'exported'
}

const requestReset = () => { dialog.value = 'reset' }
const resetSettings = () => {
  visibility.value = 'friends'
  taskReminder.value = false
  messageReminder.value = true
  nicknameMode.value = 'nickname'
  persistSettings()
  dialog.value = null
}

const closeOnEscape = (event) => {
  if (event.key === 'Escape') dialog.value = null
}

onMounted(() => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (stored) {
      visibility.value = stored.visibility ?? visibility.value
      taskReminder.value = stored.taskReminder ?? taskReminder.value
      messageReminder.value = stored.messageReminder ?? messageReminder.value
      nicknameMode.value = stored.nicknameMode ?? nicknameMode.value
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY)
  }
  window.addEventListener('keydown', closeOnEscape)
})

onUnmounted(() => {
  window.clearTimeout(savedTimer)
  window.removeEventListener('keydown', closeOnEscape)
})

watch([visibility, taskReminder, messageReminder, nicknameMode], persistSettings)
</script>

<template>
  <div class="settings-page">
    <StudySidebar active="settings" />

    <main class="settings-main">
      <header class="page-header">
        <div class="eyebrow"><span></span>保护 · 掌控个人空间</div>
        <h1>设置与隐私</h1>
        <p>管理你的偏好，选择适合每个人的隐私边界。</p>
      </header>

      <div class="rule"></div>

      <section class="settings-layout">
        <article class="permission-panel">
          <div class="section-title">
            <span class="gear-icon" aria-hidden="true"></span>
            <h2>权限设置</h2>
            <span v-if="saved" class="saved-state" role="status">已自动保存</span>
          </div>

          <div class="setting-row">
            <div class="setting-copy">
              <strong>自习时长可见范围</strong>
              <span>控制其他人可以查看你的学习时长范围</span>
            </div>
            <label class="select-control">
              <span class="sr-only">自习时长可见范围</span>
              <select v-model="visibility">
                <option value="private">仅自己可见</option>
                <option value="friends">同伴可见</option>
                <option value="public">公开可见</option>
              </select>
            </label>
          </div>

          <div class="setting-row">
            <div class="setting-copy">
              <strong>任务提醒开关</strong>
              <span>开启后，将在计划开始前发送温和提醒</span>
            </div>
            <button class="switch" :class="{ on: taskReminder }" type="button" role="switch" :aria-checked="taskReminder" aria-label="任务提醒" @click="taskReminder = !taskReminder"><span></span></button>
          </div>

          <div class="setting-row">
            <div class="setting-copy">
              <strong>寄语解锁通知开关</strong>
              <span>开启后，解锁成长寄语时会收到提示</span>
            </div>
            <button class="switch" :class="{ on: messageReminder }" type="button" role="switch" :aria-checked="messageReminder" aria-label="寄语解锁通知" @click="messageReminder = !messageReminder"><span></span></button>
          </div>

          <div class="setting-row">
            <div class="setting-copy">
              <strong>投喂默认署名</strong>
              <span>选择你在成长寄语和互动中的默认展示方式</span>
            </div>
            <label class="select-control">
              <span class="sr-only">投喂默认署名</span>
              <select v-model="nicknameMode">
                <option value="nickname">使用昵称</option>
                <option value="anonymous">匿名展示</option>
              </select>
            </label>
          </div>

          <div class="setting-row export-row">
            <div class="setting-copy">
              <strong>导出个人成长记录</strong>
              <span>下载学习时长、完成度及当前隐私偏好的数据副本</span>
            </div>
            <button class="export-button" type="button" @click="exportGrowthRecord"><span aria-hidden="true">↓</span>导出</button>
          </div>
        </article>

        <aside class="privacy-column">
          <section class="privacy-card">
            <div class="privacy-title"><span class="shield-icon" aria-hidden="true"></span><h2>隐私承诺</h2></div>
            <ul>
              <li>不公开你的学习时长</li>
              <li>不生成成绩排名</li>
              <li>不展示同伴学习数据</li>
              <li>支持随时管理隐私状态</li>
            </ul>
          </section>

          <section class="current-state" aria-label="当前设置摘要">
            <p>当前可见范围：<strong>{{ visibilityText }}</strong></p>
            <p>默认署名：<strong>{{ nicknameText }}</strong></p>
            <button type="button" @click="requestReset">恢复默认设置</button>
          </section>
        </aside>
      </section>
    </main>

    <div v-if="dialog" class="dialog-backdrop" role="presentation" @click.self="dialog = null">
      <section class="dialog" role="dialog" aria-modal="true" :aria-labelledby="`${dialog}-title`">
        <button class="dialog-close" type="button" aria-label="关闭弹窗" @click="dialog = null">×</button>
        <template v-if="dialog === 'exported'">
          <div class="dialog-mark success" aria-hidden="true">✓</div>
          <h2 id="exported-title">成长记录已导出至本地</h2>
          <p>数据文件已经生成，你可以在浏览器下载记录中查看。</p>
          <div class="dialog-actions"><button class="secondary" type="button" @click="dialog = null">继续设置</button><button class="primary" type="button" @click="exportGrowthRecord">再次导出</button></div>
        </template>
        <template v-else>
          <div class="dialog-mark" aria-hidden="true">↺</div>
          <h2 id="reset-title">确定恢复默认设置吗？</h2>
          <p>可见范围、提醒和署名方式将恢复为初始状态。</p>
          <div class="dialog-actions"><button class="secondary" type="button" @click="dialog = null">取消</button><button class="primary warm" type="button" @click="resetSettings">确认恢复</button></div>
        </template>
      </section>
    </div>
  </div>
</template>

<style scoped>
.settings-page{--green:#739f8c;--green-strong:#5d8f7a;--green-soft:#eef7f3;--sand:#e6d4b5;--text:#5b534d;--muted:#94877d;min-height:100vh;display:flex;background:var(--app-page-bg);color:var(--text)}
.settings-main{flex:1;min-width:0;min-height:100vh;padding:var(--app-page-padding-y) var(--app-page-padding-x) 48px;background:#fff}.page-header{max-width:1080px}.eyebrow{display:flex;align-items:center;gap:9px;color:var(--green);font-size:12px}.eyebrow span{width:28px;height:1px;background:var(--sand)}.page-header h1{margin:12px 0 10px;color:var(--app-text-strong);font-size:var(--app-title-size);font-weight:400;line-height:1.15}.page-header p{color:rgba(4,112,44,.5);font-size:16px}.rule{height:1px;margin:28px 0 32px;background:var(--sand)}
.settings-layout{max-width:1040px;display:grid;grid-template-columns:minmax(0,1fr) 270px;align-items:start;gap:28px}.permission-panel{border:1.5px solid var(--sand);border-radius:8px;padding:28px 30px;background:#fff}.section-title{min-height:28px;display:flex;align-items:center;gap:10px}.section-title h2,.privacy-title h2{font-size:23px;font-weight:500}.gear-icon,.shield-icon{width:22px;height:22px;border:1.7px solid currentColor;border-radius:50%;position:relative;color:var(--text)}.gear-icon:after{content:'';position:absolute;inset:6px;border:1.7px solid currentColor;border-radius:50%}.saved-state{margin-left:auto;color:var(--green-strong);font-size:12px}.setting-row{min-height:92px;border-bottom:1px solid #eee8de;display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:28px}.setting-row:last-child{border-bottom:0}.setting-copy{min-width:0;display:grid;gap:6px}.setting-copy strong{font-size:16px;font-weight:500}.setting-copy span{color:var(--muted);font-size:12px;line-height:1.55}.select-control select{width:152px;height:40px;border:1px solid #ded8d0;border-radius:6px;padding:0 34px 0 12px;background:#fff;color:var(--text);cursor:pointer}.switch{width:44px;height:24px;border:0;border-radius:12px;padding:3px;background:#c8cbd0;cursor:pointer;transition:background .18s ease}.switch span{display:block;width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.18);transition:transform .18s ease}.switch.on{background:var(--green)}.switch.on span{transform:translateX(20px)}.export-button{height:40px;border:0;border-radius:6px;padding:0 17px;display:inline-flex;align-items:center;gap:8px;background:var(--green);color:#fff;cursor:pointer}.export-button:hover,.primary:hover{background:var(--green-strong)}
.privacy-column{display:grid;gap:22px}.privacy-card{border-radius:8px;padding:28px 24px;background:var(--green-soft)}.privacy-title{display:flex;align-items:center;gap:10px}.shield-icon{border-radius:45% 45% 55% 55%}.privacy-card ul{margin:24px 0 0;display:grid;gap:18px;list-style:none}.privacy-card li{position:relative;padding-left:24px;color:#6f7772;font-size:13px;line-height:1.5}.privacy-card li:before{content:'✓';position:absolute;left:0;color:var(--green-strong);font-weight:700}.current-state{padding:0 6px;color:var(--muted);font-size:12px}.current-state p{margin-bottom:8px}.current-state strong{color:var(--text);font-weight:500}.current-state button{margin-top:8px;border:0;border-bottom:1px solid currentColor;padding:0 0 2px;background:transparent;color:var(--muted);font-size:12px;cursor:pointer}
.dialog-backdrop{position:fixed;inset:0;z-index:100;display:grid;place-items:center;padding:20px;background:rgba(52,48,45,.42)}.dialog{width:min(440px,100%);border-radius:8px;padding:34px;position:relative;background:#fff;text-align:center;box-shadow:0 22px 60px rgba(44,39,35,.25)}.dialog-close{position:absolute;right:16px;top:12px;border:0;background:transparent;color:var(--muted);font-size:24px;cursor:pointer}.dialog-mark{width:44px;height:44px;margin:0 auto 16px;border-radius:50%;display:grid;place-items:center;background:#f3eee4;color:#8a7556;font-size:23px}.dialog-mark.success{background:var(--green-soft);color:var(--green-strong)}.dialog h2{font-size:22px;font-weight:500}.dialog p{margin:12px auto 24px;max-width:320px;color:var(--muted);font-size:13px;line-height:1.7}.dialog-actions{display:flex;justify-content:center;gap:12px}.dialog-actions button{min-width:112px;height:40px;border-radius:6px;padding:0 16px;cursor:pointer}.secondary{border:1px solid #d8d1c8;background:#fff;color:var(--text)}.primary{border:0;background:var(--green);color:#fff}.primary.warm{background:#8a755f}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
@media(max-width:980px){.settings-layout{grid-template-columns:1fr}.privacy-column{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}.current-state{align-self:center}}
@media(max-width:760px){.settings-page{display:block}.settings-main{min-height:auto;padding:28px 16px 40px}.settings-layout{gap:18px}.permission-panel{padding:22px 18px}.setting-row{min-height:116px;grid-template-columns:1fr auto;gap:14px}.setting-copy span{max-width:230px}.select-control select{width:134px}.privacy-column{grid-template-columns:1fr}.dialog{padding:32px 22px}.dialog-actions{flex-direction:column-reverse}.dialog-actions button{width:100%}}
@media(max-width:430px){.setting-row{grid-template-columns:1fr}.switch,.select-control,.export-button{justify-self:start}.select-control select{width:min(240px,calc(100vw - 70px))}}
</style>
