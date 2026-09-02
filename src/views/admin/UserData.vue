<script setup>
import { ref } from 'vue'
import AdminLayout from '@/layouts/AdminLayout.vue'

const keyword = ref('')
const timelineSlots = Array.from({ length: 6 }, (_, index) => index)
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
      <form class="search-form" role="search" @submit.prevent>
        <label class="sr-only" for="admin-user-search">搜索用户</label>
        <input
          id="admin-user-search"
          v-model="keyword"
          type="search"
          placeholder="搜索用户ID/学号/手机号"
          autocomplete="off"
        />
        <button type="submit" disabled title="登录态存储契约确认后接入搜索接口">搜索</button>
      </form>
    </section>

    <section class="overview-grid" aria-label="用户数据概览">
      <article class="profile-card">
        <div class="profile-head">
          <div class="avatar-placeholder" aria-label="用户头像未提供">--</div>
          <div>
            <h2>--</h2>
            <p>--级 · --</p>
          </div>
        </div>
        <div class="profile-rule"></div>
        <p class="metric-label">累计线上专注时长</p>
        <p class="profile-duration"><strong>--</strong><span>小时</span></p>
      </article>

      <div class="summary-area">
        <div class="metric-grid">
          <article class="metric-card">
            <p>本周自习天数</p>
            <div><strong>--</strong><span>天</span></div>
          </article>
          <article class="metric-card">
            <p>任务平均完成度</p>
            <div><strong>--</strong><span>%</span></div>
          </article>
          <article class="metric-card">
            <p>寄语解锁总数</p>
            <div><strong>--</strong><span>条</span></div>
          </article>
        </div>

        <article class="latest-study">
          <div>
            <h2>最近一次线上自习</h2>
            <p>--　--　耗时 --　自评 --</p>
          </div>
          <span class="completion-pill">完成度 --</span>
        </article>
      </div>
    </section>

    <section class="timeline-panel" aria-labelledby="timeline-title">
      <div class="timeline-header">
        <div>
          <h2 id="timeline-title">个人自律轨迹</h2>
          <p>只呈现该用户个人的连续记录，不与其他用户比较</p>
        </div>
        <button type="button" disabled title="日期格式与数据契约确认后开放">
          选择日期 <span aria-hidden="true">›</span>
        </button>
      </div>

      <div class="timeline-track" aria-label="暂无自律轨迹数据">
        <div v-for="slot in timelineSlots" :key="slot" class="timeline-item">
          <div class="timeline-node">--</div>
          <span>--</span>
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

.search-form {
  width: min(350px, 100%);
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
  cursor: not-allowed;
  opacity: 0.78;
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

.timeline-header button {
  width: 170px;
  min-height: 44px;
  border: 0;
  border-radius: 14px;
  padding: 0 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--app-green-light);
  color: #fff;
  font-size: 16px;
}

.timeline-header button:disabled {
  opacity: 0.84;
  cursor: not-allowed;
}

.timeline-header button span {
  font-size: 28px;
  line-height: 1;
}

.timeline-track {
  margin-top: 18px;
  padding-inline: 18px;
  display: grid;
  grid-template-columns: repeat(6, minmax(70px, 1fr));
  position: relative;
}

.timeline-track::before {
  content: '';
  position: absolute;
  top: 28px;
  left: 9%;
  right: 9%;
  border-top: 2px dashed #9d9d9d;
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

  .metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .metric-card:last-child {
    grid-column: 1 / -1;
  }

  .timeline-track {
    overflow-x: auto;
    grid-template-columns: repeat(6, 90px);
    justify-content: start;
    padding-bottom: 8px;
  }

  .timeline-track::before {
    width: 450px;
    left: 60px;
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

  .timeline-header button {
    width: 100%;
  }
}
</style>
