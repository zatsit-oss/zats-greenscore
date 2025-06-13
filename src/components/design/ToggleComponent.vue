<script setup lang="ts">
import { ref } from 'vue'
import ModalComponent from './modalComponent.vue'

const props = defineProps<{
  checked: boolean
  disabled: boolean
  label: string
  detail: string | null
}>()

const showModal = ref(false)

const openModal = () => {
  showModal.value = true
}
</script>

<template>
  <CRow class="d-flex justify-content-center align-items-center">
    <CCol :lg="10" :xs="9">
      <p>
        {{ label }} <span @click="openModal">ℹ️</span>
      </p>
    </CCol>
    <CCol :lg="2" :xs="3">
      <CFormSwitch size="xl" v-bind="$attrs" type="checkbox" :disabled="disabled" :checked="checked"
        @change="$emit('update:checked', $event.target.checked)" />
    </CCol>
  </CRow>

  <ModalComponent title="Description" :detail="detail" v-model:modelValue="showModal" />
</template>

<style>
.form-switch-xl .form-check-input {
  width: 3rem;
}
</style>
