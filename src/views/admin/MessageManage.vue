<script setup>
import AdminLayout from '@/layouts/AdminLayout.vue'

const previewCards = [
  { key: 'pending', tone: 'pending' },
  { key: 'approved', tone: 'approved' },
  { key: 'offline', tone: 'pending' }
]
</script>

<template>
  <AdminLayout
    active="messages"
    eyebrow="内容管理 · 成长寄语审核"
    title="寄语管理"
  >
    <section class="library-banner" aria-label="寄语内容库">
      <span>寄语内容库</span>
      <span aria-hidden="true">›</span>
    </section>

    <section class="review-section" aria-labelledby="review-title">
      <div class="section-heading">
        <h2 id="review-title">寄语审核</h2>
        <span>更多&gt;</span>
      </div>

      <div class="message-grid" aria-label="暂无寄语数据，以下为视觉占位结构">
        <article
          v-for="card in previewCards"
          :key="card.key"
          class="message-card"
          :class="card.tone"
        >
          <p class="message-status">--</p>
          <p class="message-content">--</p>
          <p class="message-author">—— --</p>
          <div class="message-actions" aria-label="写操作尚未开放">
            <button type="button" disabled>--</button>
          </div>
        </article>
      </div>
    </section>

    <section class="system-panel" aria-labelledby="system-title">
      <div class="system-heading">
        <h2 id="system-title">上传系统寄语</h2>
        <span>编辑系统寄语 &gt;</span>
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
  color: #111;
  font-size: 26px;
  font-weight: 300;
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
}
</style>
