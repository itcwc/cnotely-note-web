<template>
  <el-dialog
    v-model="localVisible"
    :title="t('compile_view.export')"
    width="400px"
  >
    <el-form label-position="top">
      <el-form-item :label="t('compile_view.select_export_format')">
        <el-select
          v-model="localSelectValue"
          :placeholder="t('compile_view.select')"
          style="width: 100%"
        >
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="getOptionLabel(item)"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">{{ t("common.cancel") }}</el-button>
        <el-button type="primary" @click="handleConfirm">{{
          t("common.confirm")
        }}</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

// 定义选项类型
interface ExportOption {
  value: string;
  label: string;
}

// 定义props
const props = withDefaults(defineProps<{
  visible: boolean;
  selectValue: string;
  options: ExportOption[];
}>(), {
  visible: false,
  selectValue: 'md',
  options: () => [
    { value: "md", label: "compile_view.export_md" },
    { value: "pdf", label: "compile_view.export_pdf" },
    { value: "html", label: "compile_view.export_html" },
    { value: "docx", label: "compile_view.export_docx" },
    { value: "txt", label: "compile_view.export_txt" },
  ]
});

// 定义emit事件
const emit = defineEmits([
  'update:visible',
  'confirm',
  'cancel',
  'update:selectValue'
]);

// 使用i18n
const { t } = useI18n();

// 本地visible状态，用于v-model双向绑定
const localVisible = ref(props.visible);

// 本地selectValue状态，用于v-model双向绑定
const localSelectValue = ref(props.selectValue);

// 监听visible变化，更新本地状态
watch(
  () => props.visible,
  (newVal) => {
    localVisible.value = newVal;
    if (newVal) {
      // 当对话框打开时，同步最新的selectValue
      localSelectValue.value = props.selectValue;
    }
  }
);

// 监听localVisible变化，通知父组件
watch(
  () => localVisible.value,
  (newVal) => {
    emit('update:visible', newVal);
  }
);

// 监听selectValue变化，通知父组件
watch(
  () => localSelectValue.value,
  (newVal) => {
    emit('update:selectValue', newVal);
  }
);

// 获取选项标签
const getOptionLabel = (item: { value: string; label: string }) => {
  return t(item.label);
};

// 处理确认
const handleConfirm = () => {
  emit('confirm', localSelectValue.value);
  emit('update:visible', false);
};

// 处理取消
const handleCancel = () => {
  emit('cancel');
  emit('update:visible', false);
};
</script>
