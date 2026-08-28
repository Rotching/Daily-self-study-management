<script setup>
// 根组件，仅承载路由出口
</script>

<template>
  <router-view />
</template>

<style>
:root {
  --app-page-bg: #f7f5f0;
  --app-surface: #ffffff;
  --app-green: #739f8c;
  --app-green-strong: #5d8f7a;
  --app-green-soft: #e5f2ec;
  --app-sand: #e6d4b5;
  --app-sand-soft: #faf5ec;
  --app-text: #5a514a;
  --app-text-strong: rgba(0, 0, 0, 0.7);
  --app-muted: #94877d;
  --app-page-padding-x: clamp(28px, 4vw, 52px);
  --app-page-padding-y: 44px;
  --app-radius: 8px;
  --app-control-height: 44px;
  --app-title-size: clamp(36px, 3.6vw, 46px);
  --app-section-size: 24px;
  --app-body-size: 15px;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body,
#app {
  width: 100%;
  height: 100%;
  font-family: Inter, 'PingFang SC', 'Microsoft YaHei', 'Noto Sans CJK SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: var(--app-text);
  font-size: var(--app-body-size);
  line-height: 1.5;
  letter-spacing: 0;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

button,
input,
textarea,
select {
  font: inherit;
  letter-spacing: 0;
}

button:focus-visible,
input:focus-visible,
textarea:focus-visible,
select:focus-visible {
  outline: 3px solid rgba(115, 159, 140, 0.22);
  outline-offset: 2px;
}

@media (max-width: 760px) {
  :root {
    --app-page-padding-x: 16px;
    --app-page-padding-y: 28px;
    --app-title-size: 34px;
    --app-section-size: 22px;
  }
}
</style>
