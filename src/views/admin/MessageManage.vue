<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import AdminDateInput from '@/components/AdminDateInput.vue'
import { getAdminMessages } from '@/api/admin/messages'
import messageArrowGreen from '@/assets/icons/message-arrow-green.svg'
import messageArrowBrown from '@/assets/icons/message-arrow-brown.svg'
import messageDetailClose from '@/assets/icons/message-detail-close.svg'

const keyword = ref('')
const messageType = ref('')
const startDate = ref('')
const endDate = ref('')
const currentView = ref('overview')
const libraryStatus = ref('')
const page = ref(1)
const messages = ref([])
const total = ref(0)
const loading = ref(false)
const errorMessage = ref('')
const filterError = ref('')
const selectedMessage = ref(null)
const detailCloseButton = ref(null)
let requestController

const isOverview = computed(() => currentView.value === 'overview')
const currentTitle = computed(() => ({
  overview: '寄语管理',
  library: '寄语内容库',
  review: '寄语审核'
}[currentView.value]))
const currentPageSize = computed(() => isOverview.value ? 3 : 6)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / currentPageSize.value)))
const displayValue = (value) => value === undefined || value === null || value === '' ? '--' : value
const typeLabel = (type) => ({ system: '系统寄语', user: '用户投稿' }[type] || displayValue(type))
const statusLabel = (status) => ({ approved: '已通过', pending: '待审核' }[status] || displayValue(status))

const loadMessages = async () => {
  filterError.value = ''
  if (startDate.value && endDate.value && startDate.value > endDate.value) {
    filterError.value = '开始日期不能晚于结束日期'
    return
  }
  requestController?.abort()
  const controller = new AbortController()
  requestController = controller
  loading.value = true
  errorMessage.value = ''
  try {
    const result = await getAdminMessages({
      page: page.value,
      pageSize: currentPageSize.value,
      status: currentView.value === 'review' ? 'pending' : currentView.value === 'library' ? libraryStatus.value : '',
      keyword: isOverview.value ? '' : keyword.value.trim(),
      type: isOverview.value ? '' : messageType.value,
      startDate: isOverview.value ? '' : startDate.value,
      endDate: isOverview.value ? '' : endDate.value
    }, { signal: controller.signal })
    messages.value = Array.isArray(result?.list) ? result.list : []
    total.value = Number(result?.total || 0)
  } catch (error) {
    if (error?.name !== 'AbortError') {
      messages.value = []
      total.value = 0
      errorMessage.value = error.message || '寄语列表加载失败'
    }
  } finally {
    if (!controller.signal.aborted) loading.value = false
  }
}

const applyFilters = async () => {
  page.value = 1
  await loadMessages()
}

const clearFilters = async () => {
  keyword.value = ''
  messageType.value = ''
  startDate.value = ''
  endDate.value = ''
  filterError.value = ''
  page.value = 1
  await loadMessages()
}

const openView = async (view) => {
  currentView.value = view
  page.value = 1
  await loadMessages()
}

const returnToOverview = async () => {
  currentView.value = 'overview'
  page.value = 1
  await loadMessages()
}

const changeLibraryStatus = async (status) => {
  if (!['', 'pending', 'approved'].includes(status) || loading.value) return
  libraryStatus.value = status
  page.value = 1
  await loadMessages()
}

const changePage = async (nextPage) => {
  if (nextPage < 1 || nextPage > totalPages.value || loading.value) return
  page.value = nextPage
  await loadMessages()
}

const openMessageDetail = async (message) => {
  selectedMessage.value = message
  await nextTick()
  detailCloseButton.value?.focus()
}

const closeMessageDetail = () => {
  selectedMessage.value = null
}

const handleKeydown = (event) => {
  if (event.key === 'Escape' && selectedMessage.value) closeMessageDetail()
}

onMounted(() => {
  loadMessages()
  document.addEventListener('keydown', handleKeydown)
})
onBeforeUnmount(() => {
  requestController?.abort()
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <AdminLayout
    active="messages"
    eyebrow="内容管理 · 成长寄语审核"
    :title="currentTitle"
  >
    <template #header-actions>
      <button v-if="!isOverview" class="back-overview" type="button" @click="returnToOverview">返回概览</button>
    </template>

    <button v-if="isOverview" class="library-banner" type="button" @click="openView('library')">
      <span>寄语内容库</span>
      <span aria-hidden="true">›</span>
    </button>

    <div v-if="currentView === 'library'" class="library-tabs" aria-label="寄语状态筛选">
      <button type="button" :class="{ active: libraryStatus === '' }" @click="changeLibraryStatus('')">全部</button>
      <button type="button" :class="{ active: libraryStatus === 'pending' }" @click="changeLibraryStatus('pending')">待审核</button>
      <button type="button" :class="{ active: libraryStatus === 'approved' }" @click="changeLibraryStatus('approved')">已通过</button>
      <button type="button" disabled title="状态枚举待后端确认">已下架</button>
      <button type="button" disabled title="状态枚举待后端确认">草稿箱</button>
    </div>

    <form v-if="!isOverview" class="message-filters" aria-label="寄语筛选" @submit.prevent="applyFilters">
      <label class="keyword-field">
        <span>关键词</span>
        <input v-model="keyword" type="search" placeholder="搜索内容或投稿人" />
      </label>
      <label>
        <span>寄语类型</span>
        <select v-model="messageType">
          <option value="">全部类型</option>
          <option value="user">用户投稿</option>
          <option value="system">系统寄语</option>
        </select>
      </label>
      <label>
        <span>开始日期</span>
        <AdminDateInput v-model="startDate" />
      </label>
      <label>
        <span>结束日期</span>
        <AdminDateInput v-model="endDate" />
      </label>
      <div class="filter-actions">
        <button type="submit" :disabled="loading">查询</button>
        <button type="button" class="secondary" :disabled="loading" @click="clearFilters">清除</button>
      </div>
      <p v-if="filterError" class="filter-error" role="alert">{{ filterError }}</p>
    </form>

    <section class="review-section" :class="{ 'detail-view': !isOverview }" aria-labelledby="review-title">
      <div class="section-heading">
        <h2 v-if="isOverview" id="review-title">寄语审核</h2>
        <span v-else id="review-title" class="sr-only">{{ currentTitle }}</span>
        <button v-if="isOverview" type="button" @click="openView('review')">更多&gt;</button>
        <span v-else>第 {{ page }} / {{ totalPages }} 页</span>
      </div>

      <div v-if="loading" class="message-state" role="status">正在加载寄语…</div>
      <div v-else-if="errorMessage" class="message-state error" role="alert">
        <p>{{ errorMessage }}</p>
        <button type="button" @click="loadMessages">重试</button>
      </div>
      <div v-else-if="!messages.length" class="message-state">当前筛选条件下没有寄语。</div>
      <div v-else class="message-grid" aria-label="寄语列表">
        <article
          v-for="message in messages"
          :key="message.messageId"
          class="message-card"
          :class="message.status"
          role="button"
          tabindex="0"
          :aria-label="`查看寄语详情：${displayValue(message.content)}`"
          @click="openMessageDetail(message)"
          @keydown.enter="openMessageDetail(message)"
          @keydown.space.prevent="openMessageDetail(message)"
        >
          <div v-if="isOverview" class="message-card-head">
            <p class="message-status">{{ statusLabel(message.status) }} - {{ typeLabel(message.type) }}</p>
          </div>
          <img
            v-else
            class="detail-arrow"
            :src="message.status === 'approved' ? messageArrowGreen : messageArrowBrown"
            alt=""
          />
          <p class="message-content">“ {{ displayValue(message.content) }}</p>
          <p class="message-author">——{{ displayValue(message.submitUser) }}</p>
          <div v-if="isOverview" class="message-actions" aria-label="写操作尚未开放">
            <button type="button" disabled>{{ message.status === 'pending' ? '通过' : '下架' }}</button>
            <button v-if="message.status === 'pending'" type="button" disabled>驳回</button>
          </div>
        </article>
      </div>

      <nav v-if="!loading && !errorMessage && totalPages > 1" class="pagination" aria-label="寄语分页">
        <button type="button" :disabled="page <= 1" @click="changePage(page - 1)">上一页</button>
        <span>第 {{ page }} 页，共 {{ total }} 条</span>
        <button type="button" :disabled="page >= totalPages" @click="changePage(page + 1)">下一页</button>
      </nav>
    </section>

    <section v-if="isOverview" class="system-panel" aria-labelledby="system-title">
      <div class="system-heading">
        <h2 id="system-title">上传系统寄语</h2>
        <span>发布契约待确认</span>
      </div>

      <div class="system-form" aria-label="系统寄语写操作尚未开放">
        <label class="message-input">
          <span class="sr-only">系统寄语内容</span>
          <textarea disabled placeholder="创建一条系统寄语"></textarea>
          <small>0/100</small>
        </label>

        <div class="system-options">
          <label class="signature-field">
            <span>署名</span>
            <input type="text" disabled value="--" />
          </label>
          <label class="visibility-field">
            <span>是否展示</span>
            <input type="checkbox" disabled />
          </label>
          <div class="system-actions">
            <button type="button" disabled>取消</button>
            <button type="button" class="primary" disabled>投递</button>
          </div>
        </div>
      </div>
    </section>

    <Teleport to="body">
      <div v-if="selectedMessage" class="detail-overlay" @click.self="closeMessageDetail">
        <section class="message-detail-dialog" role="dialog" aria-modal="true" aria-labelledby="message-detail-title">
          <button ref="detailCloseButton" class="detail-close" type="button" aria-label="关闭寄语详情" @click="closeMessageDetail">
            <img :src="messageDetailClose" alt="" />
          </button>
          <h2 id="message-detail-title">寄语详情</h2>
          <div class="detail-rule"></div>

          <div class="detail-field">
            <h3>寄语内容</h3>
            <div class="detail-content">“ {{ displayValue(selectedMessage.content) }} ”</div>
          </div>

          <div class="detail-field signature-detail">
            <h3>署名</h3>
            <div class="detail-signature">{{ displayValue(selectedMessage.submitUser) }}</div>
          </div>

          <div v-if="selectedMessage.type === 'user'" class="detail-notice">
            温馨提示：投稿进入待审核库，审核通过后，将以学生成长寄语的形式推荐给正在自习的同学们。
          </div>

          <div class="detail-footer">
            <button type="button" @click="closeMessageDetail">关闭</button>
          </div>
        </section>
      </div>
    </Teleport>
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

.library-banner {
  width: 100%;
  min-height: 62px;
  border: 2px solid rgba(143, 184, 166, 0.3);
  border-radius: var(--app-panel-radius);
  padding: 0 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(230, 240, 236, 0.4);
  color: rgba(4, 112, 44, 0.75);
  font: inherit;
  font-size: 20px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.18s ease, background 0.18s ease;
}

.library-banner span:last-child {
  color: #111;
  font-size: 30px;
  font-weight: 300;
  line-height: 1;
}

.library-banner:hover {
  border-color: rgba(143, 184, 166, 0.62);
  background: rgba(230, 240, 236, 0.65);
}

.back-overview {
  min-width: 108px;
  min-height: 42px;
  border: 1px solid var(--app-green-light);
  border-radius: 10px;
  padding: 0 18px;
  background: #fff;
  color: var(--app-green-strong);
  cursor: pointer;
  transition: background 0.18s ease, color 0.18s ease;
}

.back-overview:hover {
  background: var(--app-green);
  color: #fff;
}

.library-tabs {
  display: grid;
  grid-template-columns: repeat(5, minmax(120px, 1fr));
  gap: 18px;
}

.library-tabs button {
  min-height: 58px;
  border: 1px solid rgba(4, 112, 44, 0.75);
  border-radius: 10px;
  background: #fff;
  color: rgba(4, 112, 44, 0.75);
  font-size: 22px;
  font-weight: 500;
  cursor: pointer;
}

.library-tabs button.active {
  border-color: #82b896;
  background: #82b896;
  color: #fff;
}

.library-tabs button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.message-filters {
  margin-top: 18px;
  border: 1px solid #dce7e1;
  border-radius: var(--app-card-radius);
  padding: 16px;
  display: grid;
  grid-template-columns: minmax(180px, 1.4fr) minmax(130px, 0.75fr) repeat(2, minmax(145px, 0.8fr)) auto;
  align-items: end;
  gap: 12px;
  background: #fff;
}

.message-filters label {
  min-width: 0;
  display: grid;
  gap: 6px;
  color: var(--app-muted);
  font-size: 12px;
}

.message-filters .keyword-field input,
.message-filters select {
  width: 100%;
  min-width: 0;
  height: 40px;
  border: 1px solid #bfd2c8;
  border-radius: 8px;
  padding: 0 10px;
  background: #fff;
  color: var(--app-text);
  font: inherit;
}

.filter-actions {
  display: flex;
  gap: 7px;
}

.filter-actions button,
.message-state button,
.pagination button {
  min-height: 40px;
  border: 0;
  border-radius: 8px;
  padding: 0 14px;
  background: var(--app-green);
  color: #fff;
  cursor: pointer;
}

.filter-actions .secondary,
.pagination button {
  border: 1px solid #bfd2c8;
  background: #fff;
  color: var(--app-green-strong);
}

.filter-actions button:disabled,
.pagination button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.filter-error {
  grid-column: 1 / -1;
  margin: 0;
  color: #b94747;
  font-size: 12px;
}

.review-section {
  margin-top: 20px;
}

.review-section.detail-view {
  margin-top: 24px;
}

.review-section.detail-view .section-heading {
  justify-content: flex-end;
  margin-bottom: 12px;
}

.section-heading {
  margin: 0 28px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.section-heading h2 {
  margin: 0;
  color: rgba(4, 112, 44, 0.75);
  font-size: 25px;
  font-weight: 500;
}

.section-heading span,
.section-heading button {
  color: rgba(4, 112, 44, 0.5);
  font-size: 18px;
}

.section-heading button {
  border: 0;
  padding: 6px 0 6px 12px;
  background: transparent;
  font: inherit;
  cursor: pointer;
}

.section-heading button:hover {
  color: var(--app-green-strong);
}

.message-grid {
  display: grid;
  grid-template-columns: repeat(3, 324px);
  gap: 18px;
  justify-content: start;
}

.detail-view .message-grid {
  gap: 33px;
}

.message-card {
  width: 324px;
  max-width: 100%;
  height: 246px;
  min-width: 0;
  border: 2px solid var(--app-sand);
  border-radius: 25px;
  padding: 0;
  overflow: hidden;
  background: rgba(230, 212, 181, 0.1);
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
  position: relative;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.message-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 18px rgba(0, 0, 0, 0.2);
}

.message-card:focus-visible {
  outline: 3px solid rgba(115, 159, 140, 0.3);
  outline-offset: 3px;
}

.message-card.approved {
  border-color: var(--app-green-light);
  background: #f5f9f7;
}

.message-card-head {
  position: absolute;
  top: 18px;
  left: 16px;
  right: 16px;
  height: 24px;
}

.detail-arrow {
  position: absolute;
  top: 15px;
  right: 13px;
  width: 14px;
  height: 14px;
}

.message-status {
  margin: 0;
  color: #764b00;
  font-size: 16px;
  line-height: normal;
}

.message-card.approved .message-status,
.message-card.approved .message-author {
  color: rgba(4, 112, 44, 0.65);
}

.message-content {
  width: 287px;
  max-width: calc(100% - 32px);
  height: 123px;
  margin: 0;
  position: absolute;
  top: 59px;
  left: 16px;
  overflow: hidden;
  color: #111;
  font-size: 20px;
  line-height: 35px;
  overflow-wrap: anywhere;
}

.message-author {
  width: 157px;
  height: 28px;
  margin: 0;
  position: absolute;
  top: 174px;
  right: 20px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  color: #764b00;
  font-size: 16px;
  line-height: normal;
  text-align: right;
}

.message-actions {
  height: 24px;
  position: absolute;
  top: 208px;
  left: 24px;
  display: flex;
  gap: 14px;
}

.message-actions button {
  min-width: 45px;
  min-height: 24px;
  border: 1px solid currentColor;
  border-radius: 999px;
  padding: 0 9px;
  background: #fdfbf8;
  color: rgba(118, 75, 0, 0.5);
  font-size: 14px;
  line-height: 22px;
}

.message-actions button:disabled {
  cursor: not-allowed;
}

.message-state {
  min-height: 220px;
  border: 1px dashed #c7d9d0;
  border-radius: var(--app-panel-radius);
  padding: 30px;
  display: grid;
  place-items: center;
  color: var(--app-muted);
  text-align: center;
}

.message-state.error {
  color: #b94747;
}

.message-state p {
  margin: 0 0 14px;
}

.pagination {
  margin-top: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  color: var(--app-muted);
  font-size: 13px;
}

.system-panel {
  margin-top: 24px;
  min-height: 289px;
  border: 2px solid var(--app-green-light);
  border-radius: var(--app-panel-radius);
  padding: 20px 28px 24px;
  background: #f5f9f7;
}

.system-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.system-heading h2 {
  margin: 0;
  color: var(--app-green-strong);
  font-size: 27px;
  font-weight: 500;
}

.system-heading span {
  color: rgba(115, 159, 140, 0.72);
  font-size: 14px;
}

.system-form {
  margin-top: 16px;
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(270px, 0.8fr);
  gap: 34px;
}

.message-input {
  min-height: 116px;
  border: 1px solid rgba(4, 112, 44, 0.5);
  border-radius: 10px;
  padding: 14px 12px 8px;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.message-input textarea {
  min-height: 72px;
  flex: 1;
  border: 0;
  outline: 0;
  resize: none;
  background: transparent;
  color: var(--app-text);
  font-size: 16px;
}

.message-input textarea::placeholder {
  color: #b3b3b3;
}

.message-input small {
  color: #b3b3b3;
  text-align: right;
}

.system-options {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.signature-field,
.visibility-field {
  display: grid;
  grid-template-columns: 86px minmax(0, 1fr);
  align-items: center;
  gap: 10px;
  color: #111;
  font-size: 15px;
}

.signature-field input {
  width: 100%;
  height: 40px;
  border: 1px solid rgba(4, 112, 44, 0.5);
  border-radius: 10px;
  padding: 0 12px;
  background: #fff;
  color: #948477;
}

.visibility-field input {
  width: 20px;
  height: 20px;
  accent-color: var(--app-green-strong);
}

.system-actions {
  margin-top: auto;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.system-actions button {
  min-width: 80px;
  min-height: 40px;
  border: 1px solid var(--app-green-light);
  border-radius: 7px;
  background: #fff;
  color: #5d6f67;
}

.system-actions .primary {
  background: var(--app-green);
  color: #fff;
}

.system-actions button:disabled {
  cursor: not-allowed;
  opacity: 0.82;
}

.detail-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  padding: 24px;
  display: grid;
  place-items: center;
  overflow-y: auto;
  background: rgba(120, 120, 120, 0.2);
}

.message-detail-dialog {
  width: 739px;
  max-width: 100%;
  height: min(811px, calc(100vh - 48px));
  min-height: 600px;
  border: 1px solid #948477;
  border-radius: 16px;
  padding: 38px 44px 24px;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  background: #fff;
  box-shadow: 4px 8px 8px rgba(120, 120, 120, 0.2);
}

.message-detail-dialog h2 {
  margin: 0;
  color: #594f47;
  font-size: 32px;
  font-weight: 500;
  line-height: normal;
}

.detail-close {
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 50%;
  padding: 12px;
  position: absolute;
  top: 16px;
  right: 20px;
  display: grid;
  place-items: center;
  background: transparent;
  cursor: pointer;
}

.detail-close:hover {
  background: rgba(148, 132, 119, 0.1);
}

.detail-close img {
  width: 12px;
  height: 12px;
}

.detail-rule {
  height: 1px;
  margin-top: 9px;
  background: #948477;
}

.detail-field {
  margin-top: 31px;
}

.detail-field h3 {
  margin: 0 0 13px;
  color: rgba(4, 112, 44, 0.7);
  font-size: 20px;
  font-weight: 300;
}

.detail-content,
.detail-signature {
  border: 1px solid #e6d4b5;
  border-radius: 16px;
  background: rgba(230, 212, 181, 0.2);
}

.detail-content {
  min-height: 175px;
  padding: 19px 18px;
  color: #000;
  font-size: 20px;
  line-height: 35px;
  overflow-wrap: anywhere;
}

.signature-detail {
  margin-top: 35px;
}

.detail-signature {
  min-height: 47px;
  padding: 10px 18px;
  color: #848485;
  font-size: 18px;
  font-weight: 200;
}

.detail-notice {
  min-height: 141px;
  margin-top: 53px;
  border: 1px solid #8fb8a6;
  border-radius: 16px;
  padding: 31px 46px;
  display: flex;
  align-items: center;
  background: rgba(230, 240, 236, 0.4);
  color: #000;
  font-size: 16px;
  font-weight: 200;
  line-height: 30px;
}

.detail-footer {
  margin-top: auto;
  padding-top: 24px;
  display: flex;
  justify-content: flex-end;
}

.detail-footer button {
  width: 112px;
  min-height: 40px;
  border: 1px solid #70655d;
  border-radius: 8px;
  background: #fff;
  color: #303030;
  cursor: pointer;
}

.detail-footer button:hover {
  background: rgba(112, 101, 93, 0.08);
}

@media (prefers-reduced-motion: reduce) {
  .message-card {
    transition: none;
  }

  .message-card:hover {
    transform: none;
  }
}

@media (max-width: 1200px) {
  .library-tabs {
    grid-template-columns: repeat(2, minmax(120px, 204px));
  }

  .message-filters {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .keyword-field {
    grid-column: 1 / -1;
  }

  .filter-actions {
    justify-content: flex-end;
  }

  .message-grid {
    grid-template-columns: repeat(2, 324px);
  }

  .message-card:last-child {
    grid-column: 1 / -1;
  }
}

@media (max-width: 920px) {
  .system-form {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .back-overview {
    min-width: auto;
    min-height: 40px;
    padding-inline: 12px;
  }

  .library-tabs {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .library-tabs button {
    min-height: 48px;
    font-size: 18px;
  }

  .library-banner {
    padding-inline: 20px;
  }

  .section-heading {
    margin-inline: 8px;
  }

  .message-filters {
    grid-template-columns: 1fr;
  }

  .keyword-field,
  .filter-error {
    grid-column: auto;
  }

  .filter-actions button {
    flex: 1;
  }

  .message-grid {
    grid-template-columns: 1fr;
  }

  .message-card {
    justify-self: center;
  }

  .message-card:last-child {
    grid-column: auto;
  }

  .system-panel {
    padding: 20px 18px;
  }

  .system-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .system-heading h2 {
    font-size: 24px;
  }

  .signature-field,
  .visibility-field {
    grid-template-columns: 78px minmax(0, 1fr);
  }

  .system-actions button {
    flex: 1;
  }

  .pagination {
    flex-wrap: wrap;
  }

  .detail-overlay {
    padding: 12px;
  }

  .message-detail-dialog {
    height: auto;
    min-height: min(680px, calc(100vh - 24px));
    max-height: calc(100vh - 24px);
    padding: 28px 20px 20px;
  }

  .message-detail-dialog h2 {
    font-size: 26px;
  }

  .detail-content {
    font-size: 18px;
    line-height: 31px;
  }

  .detail-notice {
    margin-top: 32px;
    padding: 22px;
  }
}
</style>
