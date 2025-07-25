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
        <span class="fw-medium">{{ props.label }}</span>
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
  margin-top: 2px; /* décale légèrement vers le bas pour un meilleur alignement */
  font-size: 1.1rem;
  color: #5a5a5a;
}

.info-icon:hover {
  opacity: 1;
}
</style>
