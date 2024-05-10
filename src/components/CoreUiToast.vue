<template>
    <div class="position-fixed top-0 end-0 p-3" style="z-index: 1100">
      <div
        v-for="(toast, index) in toasts"
        :key="index"
        class="toast align-items-center text-white show"
        :class="getToastClass(toast.type)"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        <div class="d-flex">
          <div class="toast-body">
            {{ toast.message }}
          </div>
          <button
            type="button"
            class="btn-close me-2 m-auto"
            @click="removeToast(index)"
          ></button>
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts" setup>
  import { ref } from 'vue';
  
  interface Toast {
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    duration?: number;
  }
  
  const toasts = ref<Toast[]>([]);
  
  const addToast = (toast: Toast) => {
    toasts.value.push(toast);
    setTimeout(() => {
      removeToast(0); // Retire le premier toast après un délai
    }, toast.duration || 5000);
  };
  
  const removeToast = (index: number) => {
    toasts.value.splice(index, 1);
  };
  
  defineExpose({ addToast });
  
  const getToastClass = (type: string) => {
    return {
      'bg-success': type === 'success',
      'bg-danger': type === 'error',
      'bg-info': type === 'info',
      'bg-warning': type === 'warning',
    };
  };
  </script>
  
  <style scoped>
  .toast {
    min-width: 250px;
    max-width: 400px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
  </style>
  