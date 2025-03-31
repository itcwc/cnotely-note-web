<script setup lang="ts">
import { ref } from "vue";

const message = ref("Hello, Chrome Extension!");
</script>

<template>
  <div class="popup">
    <h2>{{ message }}</h2>
    <button @click="message = 'Clicked!'">Click Me</button>
  </div>
</template>

<style scoped>
.popup {
  width: 200px;
  padding: 10px;
}
</style>
