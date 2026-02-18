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
</script>

<style scoped>
.editable-text-wrapper {
  display: inline-flex;
  align-items: center;
}

.editable-text {
  cursor: pointer;
  border-bottom: 1px dashed transparent;
  transition: border-color 0.2s;
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color);
}

.editable-text:hover {
  border-color: #409eff;
}

.editable-input {
  font-size: 20px;
  font-weight: bold;
}
</style>
