<template>
  <CoreUiToast ref="toastContainer" />
  <slot />
</template>

<script lang="ts" setup>
import { ref, onErrorCaptured } from 'vue';
import CoreUiToast from '../CoreUiToast.vue';

const toastContainer = ref<InstanceType<typeof CoreUiToast> | null>(null);

onErrorCaptured((err) => {
  showToast(err.message || 'Une erreur est survenue', 'error');
  return false; // Empêche l'erreur de se propager plus loin
});

const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
  toastContainer.value?.addToast({
    message,
    type,
    duration: 5000,
  });
};
</script>
