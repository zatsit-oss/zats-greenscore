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
  <CRow class="align-items-center py-3">
    <!-- Modale -->
    <ModalComponent
        v-if="props.detail"
        title="Description"
        :detail="props.detail"
        v-model:modelValue="showModal"
    />

    <!-- Label + Info -->
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

    <!-- Switch -->
    <CCol :lg="2" :xs="3" class="text-end">
      <CFormSwitch
          size="xl"
          type="checkbox"
          v-bind="$attrs"
          :disabled="props.disabled"
          :checked="props.checked"
          @change="$emit('update:checked', $event.target.checked)"
      />
    </CCol>
  </CRow>
</template>

<style scoped>
.form-switch-xl .form-check-input {
  width: 3rem;
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
