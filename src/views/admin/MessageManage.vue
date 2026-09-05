<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { getAdminMessages } from '@/api/admin/messages'

const keyword = ref('')
const messageType = ref('')
const startDate = ref('')
const endDate = ref('')
const page = ref(1)
const pageSize = 6
const messages = ref([])
const total = ref(0)
const loading = ref(false)
const errorMessage = ref('')
const filterError = ref('')
let requestController

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))
const displayValue = (value) => value === undefined || value === null || value === '' ? '--' : value
const displayTime = (value) => value ? String(value).replace('T', ' ') : '--'
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
      pageSize,
      keyword: keyword.value.trim(),
      type: messageType.value,
      startDate: startDate.value,
      endDate: endDate.value
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

const changePage = async (nextPage) => {
  if (nextPage < 1 || nextPage > totalPages.value || loading.value) return
  page.value = nextPage
  await loadMessages()
}

onMounted(loadMessages)
onBeforeUnmount(() => requestController?.abort())
</script>

<template>
  <AdminLayout
    active="messages"
    eyebrow="内容管理 · 成长寄语审核"
    title="寄语管理"
  >
    <section class="library-banner" aria-label="寄语内容库">
      <span>寄语内容库</span>
      <span>{{ total }} 条</span>
    </section>

    <form class="message-filters" aria-label="寄语筛选" @submit.prevent="applyFilters">
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
        <input v-model="startDate" type="date" />
      </label>
      <label>
        <span>结束日期</span>
        <input v-model="endDate" type="date" />
      </label>
      <div class="filter-actions">
        <button type="submit" :disabled="loading">查询</button>
        <button type="button" class="secondary" :disabled="loading" @click="clearFilters">清除</button>
      </div>
      <p v-if="filterError" class="filter-error" role="alert">{{ filterError }}</p>
    </form>

    <section class="review-section" aria-labelledby="review-title">
      <div class="section-heading">
        <h2 id="review-title">寄语审核</h2>
        <span>第 {{ page }} / {{ totalPages }} 页</span>
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
        >
          <div class="message-card-head">
            <p class="message-status">{{ statusLabel(message.status) }}</p>
            <span>{{ typeLabel(message.type) }}</span>
          </div>
          <p class="message-content">{{ displayValue(message.content) }}</p>
          <dl class="message-meta">
            <div><dt>编号</dt><dd>{{ displayValue(message.messageId) }}</dd></div>
            <div><dt>提交时间</dt><dd>{{ displayTime(message.submitTime) }}</dd></div>
            <div v-if="message.reviewComment"><dt>审核意见</dt><dd>{{ message.reviewComment }}</dd></div>
          </dl>
          <p class="message-author">—— {{ displayValue(message.submitUser) }}</p>
          <div class="message-actions" aria-label="写操作尚未开放">
            <button type="button" disabled>{{ message.status === 'pending' ? '审核契约待确认' : '只读' }}</button>
          </div>
        </article>
      </div>

      <nav v-if="!loading && !errorMessage && totalPages > 1" class="pagination" aria-label="寄语分页">
        <button type="button" :disabled="page <= 1" @click="changePage(page - 1)">上一页</button>
        <span>第 {{ page }} 页，共 {{ total }} 条</span>
        <button type="button" :disabled="page >= totalPages" @click="changePage(page + 1)">下一页</button>
      </nav>
    </section>

    <section class="system-panel" aria-labelledby="system-title">
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
  min-height: 62px;
  border: 2px solid rgba(143, 184, 166, 0.3);
  border-radius: var(--app-panel-radius);
  padding: 0 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(230, 240, 236, 0.4);
  color: rgba(4, 112, 44, 0.75);
  font-size: 20px;
  font-weight: 500;
}

.library-banner span:last-child {
  color: var(--app-green-strong);
  font-size: 14px;
  font-weight: 500;
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

.message-filters input,
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

.section-heading span {
  color: rgba(4, 112, 44, 0.5);
  font-size: 18px;
}

.message-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.message-card {
  min-width: 0;
  min-height: 246px;
  border: 1.5px solid var(--app-sand);
  border-radius: var(--app-panel-radius);
  padding: 16px 16px 12px;
  display: flex;
  flex-direction: column;
  background: rgba(230, 212, 181, 0.08);
  box-shadow: 0 3px 4px rgba(0, 0, 0, 0.16);
}

.message-card.approved {
  border-color: var(--app-green-light);
  background: #f5f9f7;
}

.message-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.message-card-head > span {
  border-radius: 999px;
  padding: 3px 8px;
  background: #edf5f1;
  color: var(--app-green-strong);
  font-size: 11px;
}

.message-status {
  margin: 0;
  color: #764b00;
  font-size: 13px;
}

.message-card.approved .message-status,
.message-card.approved .message-author {
  color: rgba(4, 112, 44, 0.65);
}

.message-content {
  min-height: 72px;
  margin: 16px 0 0;
  color: #111;
  font-size: 17px;
  line-height: 1.65;
  overflow-wrap: anywhere;
}

.message-meta {
  margin: 10px 0;
  display: grid;
  gap: 5px;
  color: #8a817b;
  font-size: 11px;
}

.message-meta div {
  min-width: 0;
  display: grid;
  grid-template-columns: 58px minmax(0, 1fr);
  gap: 6px;
}

.message-meta dt,
.message-meta dd {
  margin: 0;
}

.message-meta dd {
  overflow-wrap: anywhere;
}

.message-author {
  margin: auto 0 8px;
  color: #764b00;
  font-size: 13px;
  text-align: right;
}

.message-actions {
  min-height: 24px;
  display: flex;
  gap: 10px;
}

.message-actions button {
  min-width: 45px;
  min-height: 24px;
  border: 1px solid currentColor;
  border-radius: 999px;
  padding: 1px 10px;
  background: #fdfbf8;
  color: rgba(118, 75, 0, 0.5);
  font-size: 12px;
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

@media (max-width: 1200px) {
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
    grid-template-columns: repeat(2, minmax(0, 1fr));
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
}
</style>
