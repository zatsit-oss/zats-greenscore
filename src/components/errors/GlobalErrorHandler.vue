<template>
  <slot />
</template>

<script lang="ts" setup>
import { ToastType } from '@/type/toast.type';
import { inject, onErrorCaptured } from 'vue';
import type { ToastProvid } from '../CoreUiToast.vue';
import { ERROR_MESSAGE } from '@/utils/errorHandler';

const toaster = inject<ToastProvid>("toaster")

onErrorCaptured((err) => {
  if (toaster) {
    toaster.showMessage({ message: err.message || ERROR_MESSAGE.default, type: ToastType.ERROR });
    return false; // Empêche l'erreur de se propager plus loin
  }
});

</script>
