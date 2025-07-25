<script setup lang="ts">
import InputNumberComponent from '@/components/design/InputNumberComponent.vue'
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
          <h4 class="mb-4">{{ props.title }}</h4>

          <CRow
              v-for="(rule, index) in props.rules"
              :key="index"
              :class="['rule-row', index % 2 === 0 ? 'bg-light' : '', 'align-items-center']"
          >
            <CCol class="d-flex justify-content-between align-items-center">
              <div class="w-100">
                <ToggleComponent
                    v-if="rule.type === 'toggle'"
                    :label="rule.title"
                    :checked="rule.checked ?? false"
                    :detail="rule.detail"
                    :disabled="props.isStepSending || false"
                    @update:checked="(value: boolean) => handleToggleChanged(index, value)"
                />

                <InputNumberComponent
                    v-if="rule.type === 'number'"
                    :label="rule.title"
                    :value="rule.value"
                    :detail="rule.detail"
                    :disabled="props.isStepSending || false"
                    @update:number="(value: number | null) => handleInputChanged(index, value)"
                />
              </div>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>
</template>

<style scoped>
.rule-row {
  padding: 1rem 0;
  border-bottom: 1px solid #e0e0e0;
  transition: background-color 0.2s ease-in-out;
}

.rule-row:hover {
  background-color: #f1f1f1;
}

.bg-light {
  background-color: #f8f9fa;
}

.custom-card {
  border-radius: 12px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.04);
}

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
