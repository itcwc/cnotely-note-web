<template>
  <div class="editable-text-wrapper">
    <!-- 编辑状态 -->
    <el-input
      v-if="isEditing"
      v-model="localValue"
      :placeholder="placeholder"
      size="small"
      ref="inputRef"
      @blur="stopEdit"
      @keyup.enter="stopEdit"
      class="editable-input"
    />
    <!-- 展示状态 -->
    <span v-else class="editable-text" @click="startEdit">
      {{ localValue || placeholder }}
    </span>

    <!-- <el-text v-else class="mx-1" size="large" @click="startEdit" >{{ localValue || placeholder }}</el-text> -->
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from "vue";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "点击编辑",
  },
});

const emit = defineEmits(["update:modelValue"]);

const localValue = ref(props.modelValue);
const isEditing = ref(false);
const inputRef = ref(null);

watch(
  () => props.modelValue,
  (val) => {
    localValue.value = val;
  },
);

const startEdit = () => {
  isEditing.value = true;
  nextTick(() => {
    inputRef.value?.focus();
  });
};

const stopEdit = () => {
  isEditing.value = false;
  emit("update:modelValue", localValue.value.trim());
};

defineExpose({
  startEdit,
});
</script>

<style scoped>
.editable-text-wrapper {
  display: inline-flex;
  align-items: center;
}

.editable-text {
  cursor: pointer;
  transition: color 0.2s;
  font-size: 15px;
  font-weight: 500;
  color: var(--dt-text-primary);
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.editable-text:hover {
  color: var(--dt-accent);
}

.editable-input {
  font-size: 14px;
  font-weight: 500;
  width: 200px;
}

.editable-input :deep(.el-input__wrapper) {
  background: var(--dt-bg-app);
  border: 1px solid var(--dt-border);
  box-shadow: none;
}

.editable-input :deep(.el-input__wrapper:hover) {
  border-color: var(--dt-accent);
}

.editable-input :deep(.el-input__wrapper.is-focus) {
  border-color: var(--dt-accent);
  box-shadow: 0 0 0 1px var(--dt-accent) inset;
}

.editable-input :deep(.el-input__inner) {
  color: var(--dt-text-primary);
  font-weight: 600;
}

.editable-input :deep(.el-input__inner::placeholder) {
  color: var(--dt-text-muted);
}
</style>
