<script setup lang="ts">
import ModalComponent from '@/components/design/modalComponent.vue'
import ToggleComponent from '@/components/design/ToggleComponent.vue'
import type { StepRules } from '@/type/steps.type'
import { ref } from 'vue'
const props = defineProps<{
  title: string
  rules: StepRules[]
  isStepSending?: boolean
}>()

const emit = defineEmits<{
  (e: 'onToggleChanged', pointIndex: number, value: boolean): void
  (e: 'onInputChanged', pointIndex: number, value: number): void
}>()

const handleToggleChanged = (pointIndex: number, value: boolean) => {
  emit('onToggleChanged', pointIndex, value)
}

let localValue = 0
const errorRateMax = 100
let errorRateMsg = ''
const updateLocalValue = (newValue: string) => {
  const parsedValue = +newValue
  if (parsedValue > errorRateMax) {
    errorRateMsg = `La valeur ne peut pas dépasser ${errorRateMax}`
  } else {
    errorRateMsg = ''
  }
  localValue = parsedValue
}
const handleInputChanged = (pointIndex: number) => {
  emit('onInputChanged', pointIndex, localValue)
}

const showModal = ref(false)

const openModal = () => {
  showModal.value = true
}
</script>

<template>
  <CRow>
    <CCol :lg="12" :xs="12">
      <CCard class="custom-card">
        <CCardBody>
          <CRow class="mb-3 ps-3">
            <h4>{{ props.title }}</h4>
          </CRow>
          <CRow v-for="(rule, index) in props.rules" :key="index">
            <CContainer v-if="rule.type === 'toggle'">
              <ToggleComponent
                :label="rule.title"
                :checked="rule.checked ?? false"
                :detail="rule.detail"
                :disabled="props.isStepSending || false"
                @update:checked="(value: boolean) => handleToggleChanged(index, value)"
              />
            </CContainer>
            <CContainer v-else>
              <CRow>
                <CCol :lg="10" :xs="8">
                  <p>
                    {{ rule.title }}

                    <CIcon
                      icon="cil-info"
                      size="sm"
                      class="text-primary"
                      style="cursor: pointer"
                      @click="openModal"
                    />
                  </p>
                </CCol>
                <CCol :lg="2" :xs="4" class="input-container">
                  <CContainer v-if="typeof rule.value === 'number'" class="input-container ps-0">
                    <div v-if="typeof rule.value === 'number'" class="question">
                      <div class="question-input">
                        <input
                          :class="['input', { invalid: errorRateMsg }]"
                          :id="rule.title"
                          :name="rule.title"
                          type="number"
                          placeholder=""
                          min="0"
                          max="100"
                          v-validate-digits="3"
                          @blur="() => handleInputChanged(index)"
                          @input="
                            (event) => updateLocalValue((event.target as HTMLInputElement).value)
                          "
                        />
                        {{ POURCENTAGE_UNIT }}
                        <div>
                          <p v-if="errorRateMsg" style="color: red" class="errorMsg">
                            {{ errorRateMsg }}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CContainer>
                </CCol>
              </CRow>
              <ModalComponent
                title="Description"
                :detail="rule.detail"
                v-model:modelValue="showModal"
              />
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
