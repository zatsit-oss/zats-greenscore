<script setup lang="ts">
import { ToastType } from '@/type/toast.type';
import { provide, ref } from 'vue';

export type ToastProvid = {
  showMessage: (toast: Toast) => void,
}

export interface Toast {
  message: string;
  type: ToastType;
  duration?: number;
}

const toasts = ref<Toast[]>([]);

const showMessage = (toast: Toast) => {
  toasts.value.push(toast);
  setTimeout(() => {
    removeToast(0); // Retire le premier toast après un délai
  }, toast.duration || 5000);
};

const removeToast = (index: number) => {
  toasts.value.splice(index, 1);
};

const getToastClass = (type: ToastType) => {
  return {
    'bg-success': type === ToastType.SUCCESS,
    'bg-danger': type === ToastType.ERROR,
    'bg-info': type === ToastType.INFO,
    'bg-warning': type === ToastType.WARNING,
  };
};

provide("toaster", {
  showMessage
})

</script>

<template>
  <div class="position-fixed top-0 end-0 p-3" style="z-index: 1100">
    <div v-for="(toast, index) in toasts" :key="index" class="toast align-items-center text-white show"
      :class="getToastClass(toast.type)" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body">
          {{ toast.message }}
        </div>
        <button type="button" class="btn-close me-2 m-auto" @click="removeToast(index)"></button>
      </div>
    </div>
  </div>
  <slot />
</template>

<style scoped>
.toast {
  min-width: 250px;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}
</style>
