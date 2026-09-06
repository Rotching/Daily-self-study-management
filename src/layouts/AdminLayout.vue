<script setup>
import StudySidebar from '@/components/StudySidebar.vue'

defineProps({
  active: {
    type: String,
    required: true
  },
  eyebrow: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  }
})

</script>

<template>
  <div class="admin-shell">
    <StudySidebar :active="active" mode="admin" />

    <main class="admin-main">
      <header class="admin-page-header">
        <div class="admin-header-copy">
          <p class="admin-eyebrow">{{ eyebrow }}</p>
          <h1>{{ title }}</h1>
          <p v-if="subtitle" class="admin-subtitle">{{ subtitle }}</p>
        </div>
        <slot name="header-actions" />
      </header>
      <div class="admin-rule"></div>
      <slot />
    </main>
  </div>
</template>

<style scoped>
.admin-shell {
  min-height: 100vh;
  display: flex;
  background: var(--app-page-bg);
}

.admin-main {
  flex: 1;
  min-width: 0;
  min-height: 100vh;
  padding: 48px 42px 46px;
  background: var(--app-surface);
  overflow-x: hidden;
}

.admin-page-header {
  width: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}

.admin-header-copy {
  min-width: 0;
}

.admin-eyebrow {
  margin: 0 0 8px;
  color: rgba(4, 112, 44, 0.5);
  font-size: 13px;
}

.admin-page-header h1 {
  margin: 0;
  color: var(--app-text-strong);
  font-size: 48px;
  font-weight: 400;
  line-height: 1.18;
}

.admin-subtitle {
  margin: 12px 0 0;
  color: rgba(4, 112, 44, 0.5);
  font-size: 16px;
}

.admin-rule {
  height: 1px;
  margin: 26px 0 28px;
  background: var(--app-sand);
}

@media (max-width: 1100px) {
  .admin-main {
    padding-inline: 30px;
  }
}

@media (max-width: 768px) {
  .admin-shell {
    display: block;
  }

  .admin-main {
    min-height: auto;
    padding: 28px 16px 36px;
  }

  .admin-page-header h1 {
    font-size: 34px;
  }

  .admin-page-header {
    gap: 16px;
  }

  .admin-subtitle {
    font-size: 14px;
    line-height: 1.7;
  }

  .admin-rule {
    margin-block: 22px;
  }
}
</style>
