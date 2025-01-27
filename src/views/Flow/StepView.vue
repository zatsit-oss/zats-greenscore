<script setup lang="ts">
import ToggleComponent from '@/components/design/ToggleComponent.vue'
import type { StepRules } from '@/type/steps.type'
import { POURCENTAGE_UNIT } from '@/utils/unit';
import { ref } from 'vue';

const IMAGES_PATH = "/images/"

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

let localValue = 0;
const errorRateMax = 100;
let errorRateMsg = "";
const updateLocalValue = (newValue: string) => {
  const parsedValue = +newValue
  if (parsedValue > errorRateMax) {
    errorRateMsg = `La valeur ne peut pas dépasser ${errorRateMax}`;
  } else {
    errorRateMsg = '';
  }
  localValue = parsedValue;
}
const handleInputChanged = (pointIndex: number) => {
  emit('onInputChanged', pointIndex, localValue);
}
const getImagePath = (value: string) => {
  const imgName = value.toLowerCase().split(' ')[1]
  return `${IMAGES_PATH}${imgName}.webp`;
}
const hover = ref(false);
</script>

<template>
  <CRow>
    <CCol :lg="12" :xs="12">
      <CCard class="custom-card">
        <CCardBody>
          <CRow class="mb-3 ps-3">
            <h4>{{ props.title }}</h4>
          </CRow>
          <CRow>
            <CCol :lg="3" class="clearfix mb-3 d-none d-md-block">
              <CImage align="start" rounded :src="getImagePath(props.title)" :class="{ zoom: hover }" />
            </CCol>
            <CCol :lg="9">
              <CRow v-for="(rule, index) in props.rules" :key="index">
                <CContainer v-if="rule.type === 'toggle'">
                  <ToggleComponent :label="rule.title" :checked="rule.checked" :disabled="props.isStepSending || false"
                    @update:checked="(value: boolean) => handleToggleChanged(index, value)" />
                </CContainer>
                <CContainer v-else>
                  <CRow>
                    <CCol :lg="10" :xs="8">
                      <p>{{ rule.title }}</p>
                    </CCol>
                    <CCol :lg="2" :xs="4" class="input-container">
                      <CContainer v-if="typeof rule.value === 'number'" class="input-container ps-0">
                        <div v-if="typeof rule.value === 'number'" class="question">
                          <div class="question-input">
                            <input :class="['input', { 'invalid': errorRateMsg }]" :id="rule.title" :name="rule.title"
                              type="number" placeholder="" min="0" max="100" v-validate-digits="3"
                              @blur="() => handleInputChanged(index)"
                              @input="(event) => updateLocalValue((event.target as HTMLInputElement).value)" />
                            {{ POURCENTAGE_UNIT }}
                            <div>
                              <p v-if="errorRateMsg" style="color: red;" class="errorMsg">{{ errorRateMsg }}</p>
                            </div>
                          </div>
                        </div>
                      </CContainer>
                    </CCol>
                  </CRow>
                </CContainer>
              </CRow>
            </CCol>

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

img {
  height: 100%;
  width: 100%;
  object-fit: cover;
  min-height: 100px;
}


img:hover {
  transform: scale(1.5);
  /* Agrandit l'image */
  object-fit: contain;
  /* Affiche l'image complète */
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
      justify-content: end;
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
