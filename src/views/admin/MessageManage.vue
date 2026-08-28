<script setup>
// 寄语管理页占位组件
</script>

<template>
  <main class="page">
    <section class="placeholder">
      <p>管理后台</p>
      <h1>寄语管理</h1>
      <span>页面功能正在建设中</span>
    </section>
  </main>
</template>

<style scoped>
.page {
  min-height: 100vh;
  padding: var(--app-page-padding-y) var(--app-page-padding-x);
  display: grid;
  place-items: center;
  background: var(--app-page-bg);
}

.placeholder {
  width: min(560px, 100%);
  padding: 42px;
  border: 1.5px solid var(--app-sand);
  border-radius: var(--app-radius);
  background: var(--app-surface);
  text-align: center;
}

.placeholder p { margin: 0 0 10px; color: var(--app-green); font-size: 14px; }
.placeholder h1 { margin: 0 0 12px; color: var(--app-text-strong); font-size: var(--app-title-size); font-weight: 400; }
.placeholder span { color: var(--app-muted); font-size: 15px; }

@media (max-width: 760px) {
  .placeholder { padding: 30px 20px; }
}
</style>
