<script setup lang="ts">
import { computed, ref } from 'vue'
import ModalComponent from './modalComponent.vue'

const props = defineProps<{
  value: number | null
  disabled: boolean
  label: string
  detail: string | null
}>()

const showModal = ref(false)
let valueRef = ref(props.value)

const emit = defineEmits<{
  (e: 'update:number', value: number | null): void
}>()

const onChange = ((v: number | null) => {
  if (v! <= 0) valueRef.value = 0
  else if (v! > 100) valueRef.value = 100
  emit('update:number', valueRef.value)
})

const openModal = () => {
  showModal.value = true
}
</script>

<template>
  <ModalComponent
      title="Description" :detail="detail"
      v-model:modelValue="showModal" />
  <CRow class="d-flex justify-content-center align-items-center">
    <CCol :lg="10" :xs="9">
      <div class="d-flex align-items-center gap-3">
              <span
                  v-if="props.detail"
                  @click="openModal"
                  class="info-icon"
                  title="Voir plus d'infos"
              >
          ℹ️
        </span>
        <p>
          {{ label }}
        </p>
      </div>
    </CCol>
    <CCol :lg="2" :xs="3">
      <CFormInput id="numberInput" type="number" v-model="valueRef" :min="0" :max="100" :step="1" class="mt-2 input"
        @blur="onChange(valueRef)" />
    </CCol>
  </CRow>
</template>

<style>
.input {
  max-width: 100%;
  width: 5rem;
}
.info-icon {
  cursor: pointer;
  color: var(--cui-body-color, #adb5bd);
  font-weight: bold;
}

p {
  margin-bottom: 0;
  font-size: 0.95rem;
}

.text-light {
  color: #f8f9fa !important;
}

.text-muted {
  color: #6c757d !important;
}
</style>
