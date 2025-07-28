<script setup lang="ts">
import { CButton, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle } from '@coreui/vue'

const props = defineProps<{
  title: string
  detail: string | null
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const close = () => emit('update:modelValue', false)
</script>

<template>
  <CModal :visible="modelValue" @close="close">
    <CModalHeader>
      <CModalTitle>{{ title }}</CModalTitle>
    </CModalHeader>

    <CModalBody>
      {{ detail }}
    </CModalBody>

    <CModalFooter>
      <CButton color="primary" @click="close">Close</CButton>
    </CModalFooter>
  </CModal>
</template>
