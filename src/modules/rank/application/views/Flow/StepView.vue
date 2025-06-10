<script setup lang="ts">
import InputNumberComponent from '@/components/design/InputNumberComponent.vue';
import ToggleComponent from '@/components/design/ToggleComponent.vue'
import type { StepRules } from '@/type/steps.type'

const props = defineProps<{
  title: string
  rules: StepRules[]
  isStepSending?: boolean
}>()

const emit = defineEmits<{
  (e: 'onToggleChanged', pointIndex: number, value: boolean): void
  (e: 'onInputChanged', pointIndex: number, value: number | null): void
}>()

const handleToggleChanged = (pointIndex: number, value: boolean) => {
  emit('onToggleChanged', pointIndex, value)
}
const handleInputChanged = (pointIndex: number, value: number | null) => {
  emit('onInputChanged', pointIndex, value)
}
</script>

<template>
  <CRow>
    <CCol :lg="12" :xs="12">
      <CCard class="custom-card">
        <CCardBody>
          <CRow class="mb-3">
            <h4>{{ props.title }}</h4>
          </CRow>
          <CRow v-for="(rule, index) in props.rules" :key="index">
            <CContainer v-if="rule.type === 'toggle'">
              <ToggleComponent :label="rule.title" :checked="rule.checked ?? false" :detail="rule.detail"
                :disabled="props.isStepSending || false"
                @update:checked="(value: boolean) => handleToggleChanged(index, value)" />
            </CContainer>
            <CContainer v-if="rule.type === 'number'">
              <InputNumberComponent :label="rule.title" :value="rule.value" :detail="rule.detail"
                :disabled="props.isStepSending || false"
                @update:number="(value: number | null) => handleInputChanged(index, value)" />
            </CContainer>
          </CRow>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>
</template>

<style scoped>
.input {
  max-width: 3.2rem;
  max-height: 1.7rem;
}

.invalid {
  border-color: red;
  color: red;
}

.errorMsg {
  font-size: 12px;
}

.input-container {
  .question {
    display: flex;
    flex-direction: column;

    .question-input {
      display: flex;
      flex-direction: column;
    }
  }
}

@media (max-width: 769px) {
  .input-container {
    padding-right: unset;
    display: flex;
    justify-content: end;
  }
}
</style>
