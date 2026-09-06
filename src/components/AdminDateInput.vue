<script setup>
import { ref } from 'vue'

const model = defineModel({
  type: String,
  default: ''
})

const inputRef = ref(null)

const openPicker = () => {
  try {
    inputRef.value?.showPicker?.()
  } catch {
    // Browsers without showPicker still keep the native date-input behavior.
  }
}
</script>

<template>
  <span class="admin-date-input" :class="{ empty: !model }">
    <input
      ref="inputRef"
      v-model="model"
      type="date"
      placeholder="点击选择日期"
      @click="openPicker"
    />
    <span v-if="!model" class="date-placeholder" aria-hidden="true">点击选择日期</span>
  </span>
</template>

<style scoped>
.admin-date-input {
  width: 100%;
  min-width: 0;
  position: relative;
  display: block;
}

input {
  width: 100%;
  min-width: 0;
  height: 40px;
  border: 1px solid #bfd2c8;
  border-radius: 8px;
  padding: 0 10px;
  background: #fff;
  color: var(--app-text);
  font: inherit;
  cursor: pointer;
}

.empty input {
  color: transparent;
}

.date-placeholder {
  position: absolute;
  inset: 1px 38px 1px 1px;
  border-radius: 7px 0 0 7px;
  padding-left: 10px;
  display: flex;
  align-items: center;
  overflow: hidden;
  background: #fff;
  color: var(--app-muted);
  pointer-events: none;
  white-space: nowrap;
}
</style>
