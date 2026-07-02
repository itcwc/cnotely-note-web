<template>
  <div class="not-found-page">
    <div class="not-found-content">
      <div class="not-found-icon">404</div>
      <h1 class="not-found-title">{{ $t('not_found.title') }}</h1>
      <p class="not-found-desc">{{ $t('not_found.description') }}</p>
      <p class="not-found-countdown">{{ $t('not_found.auto_redirect', { seconds: countdown }) }}</p>
      <el-button type="primary" size="large" @click="goHome">
        {{ $t('common.back_to_home') }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const countdown = ref(3);
let timer: ReturnType<typeof setInterval> | null = null;

const goHome = () => {
  if (timer) clearInterval(timer);
  router.push('/');
};

onMounted(() => {
  timer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      goHome();
    }
  }, 1000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<style scoped>
.not-found-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: var(--dt-bg-primary, #f5f5f5);
}

.not-found-content {
  text-align: center;
  padding: 40px;
}

.not-found-icon {
  font-size: 120px;
  font-weight: 700;
  color: var(--dt-text-muted, #c0c4cc);
  line-height: 1;
  user-select: none;
}

.not-found-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--dt-text-primary, #303133);
  margin: 16px 0 8px;
}

.not-found-desc {
  font-size: 14px;
  color: var(--dt-text-secondary, #606266);
  margin-bottom: 8px;
}

.not-found-countdown {
  font-size: 14px;
  color: var(--dt-text-muted, #909399);
  margin-bottom: 24px;
}
</style>
