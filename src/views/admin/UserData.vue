<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { getAdminUserData, searchAdminUsers } from '@/api/admin/users'

const route = useRoute()
const router = useRouter()
const keyword = ref('')
const searchResults = ref([])
const searchLoading = ref(false)
const searchError = ref('')
const showResults = ref(false)
const searchPanel = ref(null)
const userData = ref(null)
const dataLoading = ref(false)
const dataError = ref('')
const startDate = ref('')
const endDate = ref('')
const dateError = ref('')
let searchTimer
let searchController
let dataController
let ignoreNextKeywordWatch = false

const selectedUserId = computed(() => String(route.query.userId || ''))
const userInfo = computed(() => userData.value?.userInfo || null)
const overview = computed(() => userData.value?.overview || null)
const dailyRecords = computed(() => Array.isArray(userData.value?.dailyRecords) ? userData.value.dailyRecords : [])
const continuousRecords = computed(() => userData.value?.continuousRecords || null)
const latestRecord = computed(() => [...dailyRecords.value].sort((a, b) => String(b.date).localeCompare(String(a.date)))[0] || null)
const timelineRecords = computed(() => [...dailyRecords.value]
  .sort((a, b) => String(a.date).localeCompare(String(b.date)))
  .slice(-6))

const displayValue = (value) => value === undefined || value === null || value === '' ? '--' : value
const roleLabel = (role) => ({ ADMIN: '管理员', MEMBER: '成员' }[role] || displayValue(role))
const recordCompletion = (record) => {
  if (!record || !Number(record.taskCount)) return 0
  return Math.round(Number(record.completedCount || 0) / Number(record.taskCount) * 100)
}

const runSearch = async () => {
  window.clearTimeout(searchTimer)
  searchController?.abort()
  const controller = new AbortController()
  searchController = controller
  searchLoading.value = true
  searchError.value = ''
  showResults.value = true
  try {
    const page = await searchAdminUsers({ keyword: keyword.value.trim(), page: 1, pageSize: 20 }, { signal: controller.signal })
    searchResults.value = Array.isArray(page?.list) ? page.list : []
  } catch (error) {
    if (error?.name !== 'AbortError') {
      searchResults.value = []
      searchError.value = error.message || '用户搜索失败'
    }
  } finally {
    if (!controller.signal.aborted) searchLoading.value = false
  }
}

const scheduleSearch = () => {
  window.clearTimeout(searchTimer)
  searchTimer = window.setTimeout(runSearch, 320)
}

const openSearchResults = () => {
  showResults.value = true
  if (!searchResults.value.length && !searchLoading.value) runSearch()
}

const closeSearchResults = () => {
  window.clearTimeout(searchTimer)
  showResults.value = false
}

const handleOutsidePointer = (event) => {
  if (!searchPanel.value?.contains(event.target)) closeSearchResults()
}

const handleEscape = (event) => {
  if (event.key === 'Escape') closeSearchResults()
}

const selectUser = async (user) => {
  ignoreNextKeywordWatch = true
  keyword.value = user.username || String(user.userId)
  showResults.value = false
  if (String(user.userId) === selectedUserId.value) {
    await loadUserData()
    return
  }
  await router.replace({ query: { ...route.query, userId: String(user.userId) } })
}

const loadUserData = async () => {
  if (!selectedUserId.value) {
    userData.value = null
    dataError.value = ''
    return
  }
  dataController?.abort()
  const controller = new AbortController()
  dataController = controller
  dataLoading.value = true
  dataError.value = ''
  try {
    userData.value = await getAdminUserData(selectedUserId.value, {
      startDate: startDate.value,
      endDate: endDate.value
    }, { signal: controller.signal })
  } catch (error) {
    if (error?.name !== 'AbortError') {
      userData.value = null
      dataError.value = error.message || '用户数据加载失败'
    }
  } finally {
    if (!controller.signal.aborted) dataLoading.value = false
  }
}

const applyDateFilter = async () => {
  dateError.value = ''
  if (startDate.value && endDate.value && startDate.value > endDate.value) {
    dateError.value = '开始日期不能晚于结束日期'
    return
  }
  await loadUserData()
}

const clearDateFilter = async () => {
  startDate.value = ''
  endDate.value = ''
  dateError.value = ''
  await loadUserData()
}

watch(keyword, () => {
  if (ignoreNextKeywordWatch) {
    ignoreNextKeywordWatch = false
    return
  }
  scheduleSearch()
})
watch(() => route.query.userId, loadUserData, { immediate: true })

onMounted(() => {
  document.addEventListener('pointerdown', handleOutsidePointer)
  document.addEventListener('keydown', handleEscape)
})
onBeforeUnmount(() => {
  window.clearTimeout(searchTimer)
  searchController?.abort()
  dataController?.abort()
  document.removeEventListener('pointerdown', handleOutsidePointer)
  document.removeEventListener('keydown', handleEscape)
})
</script>

<template>
  <AdminLayout
    active="users"
    eyebrow="个人数据 · 线上自习记录汇总"
    title="用户数据"
    subtitle="仅查看个人自律数据，不排名，不横向比较，也不展示同伴的平均值"
  >
    <section class="archive-banner" aria-labelledby="archive-title">
      <div>
        <h2 id="archive-title">用户自律档案</h2>
        <p>搜索用户，查看专注时长、任务完成度、自我评价与寄语解锁记录</p>
      </div>
      <div ref="searchPanel" class="search-panel">
        <form class="search-form" role="search" @submit.prevent="runSearch">
          <label class="sr-only" for="admin-user-search">搜索用户</label>
          <input
            id="admin-user-search"
            v-model="keyword"
            type="search"
            placeholder="搜索用户名或用户 ID"
            autocomplete="off"
            aria-controls="admin-user-search-results"
            :aria-expanded="showResults"
            @focus="openSearchResults"
          />
          <button type="submit" :disabled="searchLoading">{{ searchLoading ? '搜索中…' : '搜索' }}</button>
        </form>
        <div v-if="showResults" id="admin-user-search-results" class="search-results" role="listbox" aria-label="用户搜索结果">
          <p v-if="searchError" class="search-message error">{{ searchError }}</p>
          <p v-else-if="searchLoading" class="search-message">正在搜索用户…</p>
          <p v-else-if="!searchResults.length" class="search-message">没有找到匹配用户</p>
          <template v-else>
            <button
              v-for="user in searchResults"
              :key="user.userId"
              type="button"
              role="option"
              :aria-selected="String(user.userId) === selectedUserId"
              @click="selectUser(user)"
            >
              <strong>{{ displayValue(user.username) }}</strong>
              <span>ID {{ user.userId }} · {{ roleLabel(user.role) }} · {{ displayValue(user.department) }}</span>
            </button>
          </template>
        </div>
      </div>
    </section>

    <section v-if="dataLoading" class="admin-state" role="status">正在加载用户数据…</section>
    <section v-else-if="dataError" class="admin-state error" role="alert">
      <p>{{ dataError }}</p>
      <button type="button" @click="loadUserData">重试</button>
    </section>
    <section v-else-if="!selectedUserId" class="admin-state">请搜索并选择一名用户查看自律档案。</section>
    <section v-else-if="!userData" class="admin-state">该用户暂无可展示的数据。</section>

    <section v-if="userData" class="overview-grid" aria-label="用户数据概览">
      <article class="profile-card">
        <div class="profile-head">
          <div class="avatar-placeholder" aria-label="用户头像未提供">--</div>
          <div>
            <h2>{{ displayValue(userInfo?.username) }}</h2>
            <p>{{ displayValue(userInfo?.grade) }} · {{ displayValue(userInfo?.department) }}</p>
            <p>ID {{ displayValue(userInfo?.userId) }} · {{ roleLabel(userInfo?.role) }}</p>
          </div>
        </div>
        <div class="profile-rule"></div>
        <p class="metric-label">累计线上专注时长（接口原值）</p>
        <p class="profile-duration"><strong>{{ displayValue(overview?.totalDuration) }}</strong><span>单位待确认</span></p>
      </article>

      <div class="summary-area">
        <div class="metric-grid">
          <article class="metric-card">
            <p>累计自习天数</p>
            <div><strong>{{ displayValue(overview?.totalStudyDays) }}</strong><span>天</span></div>
          </article>
          <article class="metric-card">
            <p>任务平均完成度</p>
            <div><strong>{{ displayValue(overview?.taskCompletionRate) }}</strong><span>%</span></div>
          </article>
          <article class="metric-card">
            <p>寄语解锁总数</p>
            <div><strong>{{ displayValue(overview?.unlockedMessages) }}</strong><span>条</span></div>
          </article>
        </div>

        <article class="latest-study">
          <div>
            <h2>最近一次线上自习</h2>
            <p v-if="latestRecord">
              {{ latestRecord.date }}　完成 {{ latestRecord.completedCount }}/{{ latestRecord.taskCount }} 项　时长原值 {{ latestRecord.duration }}
            </p>
            <p v-else>当前日期范围内暂无每日记录</p>
          </div>
          <span class="completion-pill">完成度 {{ recordCompletion(latestRecord) }}%</span>
        </article>
      </div>
    </section>

    <section v-if="userData" class="timeline-panel" aria-labelledby="timeline-title">
      <div class="timeline-header">
        <div>
          <h2 id="timeline-title">个人自律轨迹</h2>
          <p>当前连续 {{ displayValue(continuousRecords?.current) }} 天，只呈现个人记录</p>
        </div>
        <form class="date-filter" @submit.prevent="applyDateFilter">
          <label>开始日期<input v-model="startDate" type="date" /></label>
          <label>结束日期<input v-model="endDate" type="date" /></label>
          <div class="date-actions">
            <button type="submit" :disabled="dataLoading">筛选</button>
            <button type="button" class="secondary" :disabled="dataLoading" @click="clearDateFilter">清除</button>
          </div>
          <p v-if="dateError" class="date-error" role="alert">{{ dateError }}</p>
        </form>
      </div>

      <div v-if="timelineRecords.length" class="timeline-track" :class="{ 'has-line': timelineRecords.length > 1 }" :style="{ '--timeline-count': timelineRecords.length }">
        <div v-for="record in timelineRecords" :key="record.date" class="timeline-item">
          <div class="timeline-node">{{ record.completedCount }}/{{ record.taskCount }}</div>
          <span>{{ record.date }}</span>
        </div>
      </div>
      <p v-else class="timeline-empty">当前日期范围内暂无自律轨迹</p>
    </section>
  </AdminLayout>
</template>

<style scoped>
.sr-only {
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

.archive-banner {
  min-height: 74px;
  border: 2px solid rgba(143, 184, 166, 0.3);
  border-radius: var(--app-panel-radius);
  padding: 14px 18px 14px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  background: rgba(230, 240, 236, 0.4);
}

.archive-banner h2 {
  margin: 0 0 4px;
  color: #33483f;
  font-size: 20px;
  font-weight: 500;
}

.archive-banner p {
  margin: 0;
  color: var(--app-green-strong);
  font-size: 13px;
}

.search-panel {
  width: min(410px, 100%);
  position: relative;
  z-index: 5;
}

.search-form {
  width: 100%;
  height: 40px;
  border: 1px solid var(--app-green);
  border-radius: 16px;
  padding-left: 14px;
  display: flex;
  align-items: center;
  background: #fff;
  overflow: hidden;
}

.search-form input {
  min-width: 0;
  flex: 1;
  border: 0;
  outline: 0;
  color: var(--app-text);
  font-size: 14px;
}

.search-form input::placeholder {
  color: #8e8e93;
}

.search-form button {
  align-self: stretch;
  border: 0;
  border-radius: 13px;
  padding: 0 16px;
  background: #e6f0ec;
  color: var(--app-green-strong);
  font-size: 14px;
}

.search-form button:disabled {
  cursor: wait;
  opacity: 0.78;
}

.search-results {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  max-height: 290px;
  border: 1px solid #d7e3dd;
  border-radius: 12px;
  padding: 6px;
  overflow-y: auto;
  background: #fff;
  box-shadow: 0 14px 34px rgba(39, 74, 60, 0.16);
}

.search-results button {
  width: 100%;
  min-height: 58px;
  border: 0;
  border-radius: 8px;
  padding: 8px 10px;
  display: grid;
  gap: 4px;
  background: transparent;
  color: var(--app-text);
  text-align: left;
  cursor: pointer;
}

.search-results button:hover,
.search-results button[aria-selected='true'] {
  background: #eef6f2;
}

.search-results button strong {
  font-size: 14px;
  font-weight: 600;
}

.search-results button span,
.search-message {
  color: var(--app-muted);
  font-size: 12px;
}

.search-message {
  margin: 0;
  padding: 14px 10px;
}

.search-message.error,
.admin-state.error,
.date-error {
  color: #b94747;
}

.admin-state {
  min-height: 150px;
  margin-top: 28px;
  border: 1px dashed #c7d9d0;
  border-radius: var(--app-card-radius);
  padding: 28px;
  display: grid;
  place-items: center;
  color: var(--app-muted);
  text-align: center;
}

.admin-state p {
  margin: 0 0 14px;
}

.admin-state button {
  min-height: 40px;
  border: 0;
  border-radius: 8px;
  padding: 0 18px;
  background: var(--app-green);
  color: #fff;
  cursor: pointer;
}

.overview-grid {
  margin-top: 28px;
  display: grid;
  grid-template-columns: 324px minmax(0, 1fr);
  gap: 32px;
}

.profile-card {
  min-height: 246px;
  border: 1.5px solid var(--app-sand);
  border-radius: var(--app-card-radius);
  padding: 22px 18px 18px;
  background: rgba(230, 212, 181, 0.08);
}

.profile-head {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar-placeholder {
  width: 62px;
  height: 62px;
  flex: 0 0 62px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: #e6f0ec;
  color: var(--app-green);
  font-size: 15px;
}

.profile-head h2 {
  margin: 0 0 6px;
  color: #757575;
  font-size: 21px;
  font-weight: 600;
}

.profile-head p,
.metric-label {
  margin: 0;
  color: #9b928c;
  font-size: 13px;
}

.profile-rule {
  height: 1px;
  margin: 18px 0 12px;
  background: var(--app-sand);
}

.profile-duration {
  margin: 8px 0 0;
  color: #274a3c;
}

.profile-duration strong {
  font-size: 30px;
  font-weight: 400;
}

.profile-duration span {
  margin-left: 10px;
  font-size: 13px;
}

.summary-area {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.metric-card {
  min-height: 115px;
  border: 1px solid var(--app-sand);
  border-radius: var(--app-card-radius);
  padding: 16px 18px;
}

.metric-card p {
  margin: 0;
  color: #70655d;
  font-size: 13px;
}

.metric-card div {
  margin-top: 10px;
  color: #274a3c;
}

.metric-card strong {
  font-size: 29px;
  font-weight: 400;
}

.metric-card span {
  margin-left: 10px;
  font-size: 13px;
}

.latest-study {
  min-height: 97px;
  border: 1px solid var(--app-green-light);
  border-radius: var(--app-card-radius);
  padding: 14px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.latest-study h2 {
  margin: 0 0 5px;
  color: #594f47;
  font-size: 17px;
  font-weight: 500;
}

.latest-study p {
  margin: 0;
  color: #70655d;
  font-size: 13px;
}

.completion-pill {
  flex: 0 0 auto;
  border-radius: 999px;
  padding: 4px 8px;
  background: #e6f0ec;
  color: var(--app-green-strong);
  font-size: 12px;
}

.timeline-panel {
  margin-top: 30px;
  border: 2px solid var(--app-green-light);
  border-radius: var(--app-panel-radius);
  padding: 22px 28px 20px;
}

.timeline-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}

.timeline-header h2 {
  margin: 0 0 5px;
  color: #70655d;
  font-size: 28px;
  font-weight: 500;
}

.timeline-header p {
  margin: 0;
  color: var(--app-green);
  font-size: 13px;
}

.date-filter {
  min-width: min(470px, 100%);
  display: grid;
  grid-template-columns: repeat(2, minmax(130px, 1fr)) auto;
  align-items: end;
  gap: 10px;
}

.date-filter label {
  display: grid;
  gap: 5px;
  color: var(--app-muted);
  font-size: 12px;
}

.date-filter input {
  min-width: 0;
  height: 40px;
  border: 1px solid #bfd2c8;
  border-radius: 8px;
  padding: 0 9px;
  background: #fff;
  color: var(--app-text);
}

.date-actions {
  display: flex;
  gap: 7px;
}

.date-actions button {
  min-height: 40px;
  border: 0;
  border-radius: 8px;
  padding: 0 13px;
  background: var(--app-green);
  color: #fff;
  cursor: pointer;
}

.date-actions .secondary {
  border: 1px solid #bfd2c8;
  background: #fff;
  color: var(--app-green-strong);
}

.date-actions button:disabled {
  cursor: wait;
  opacity: 0.7;
}

.date-error {
  grid-column: 1 / -1;
  margin: 0;
  font-size: 12px;
}

.timeline-track {
  margin-top: 18px;
  padding-inline: 18px;
  display: grid;
  grid-template-columns: repeat(var(--timeline-count), minmax(90px, 1fr));
  position: relative;
}

.timeline-track.has-line::before {
  content: '';
  position: absolute;
  top: 28px;
  left: 9%;
  right: 9%;
  border-top: 2px dashed #9d9d9d;
}

.timeline-empty {
  margin: 28px 0 8px;
  color: var(--app-muted);
  text-align: center;
}

.timeline-item {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
  color: #948477;
  font-size: 12px;
}

.timeline-node {
  width: 58px;
  height: 58px;
  border: 5px solid #e5e7eb;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: #fff;
  color: #9b9b9b;
  font-size: 12px;
}

@media (max-width: 1080px) {
  .overview-grid {
    grid-template-columns: 1fr;
  }

  .profile-card {
    min-height: auto;
  }
}

@media (max-width: 900px) {
  .archive-banner {
    align-items: stretch;
    flex-direction: column;
  }

  .search-form {
    width: 100%;
  }

  .search-panel {
    width: 100%;
  }

  .metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .metric-card:last-child {
    grid-column: 1 / -1;
  }

  .timeline-track {
    overflow-x: auto;
    grid-template-columns: repeat(var(--timeline-count), 110px);
    justify-content: start;
    padding-bottom: 8px;
  }

  .timeline-track::before {
    width: calc((var(--timeline-count) - 1) * 110px);
    left: 55px;
    right: auto;
  }
}

@media (max-width: 768px) {
  .archive-banner,
  .timeline-panel {
    padding: 20px 18px;
  }

  .archive-banner h2 {
    font-size: 19px;
  }

  .metric-grid {
    grid-template-columns: 1fr;
  }

  .metric-card:last-child {
    grid-column: auto;
  }

  .latest-study,
  .timeline-header {
    align-items: stretch;
    flex-direction: column;
  }

  .completion-pill {
    align-self: flex-start;
  }

  .timeline-header h2 {
    font-size: 24px;
  }

  .date-filter {
    min-width: 0;
    grid-template-columns: 1fr;
  }

  .date-actions button {
    flex: 1;
  }
}
</style>
