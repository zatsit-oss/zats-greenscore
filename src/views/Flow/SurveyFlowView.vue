<script setup lang="ts">
import { getDataSurvey } from '@/controllers/dataSurvey/dataSurvey'
import { deleteUserSurveyFlowData, getUserSurveyDraft } from '@/controllers/userSurvey/userSurveyFlow'
import { saveUserSurveyResult } from '@/controllers/userSurvey/userSurveyResults'
import { useFlowStore } from '@/stores/flow'
import type { DataSurvey } from '@/type/dataStepSurvey.type'
import { ProjectStatus } from '@/type/project.type'
import { getRankingScore } from '@/utils/greenscore'
import { PATH } from '@/utils/path'
import { WORDING } from '@/utils/wording'
import {
  buildDataFlowWithDraftUserSurvey,
  buildResultMapping,
  buildUserSurvey
} from '@/views/Flow/utils/flow'
import { v4 as uuidv4 } from 'uuid'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import StepView from './StepView.vue'

const currentStep = ref(0)
const router = useRouter()
const dataSurvey = ref<DataSurvey[]>([])
const flowStore = useFlowStore()
const isLoading = ref(false)
const disabledSaveButton = ref(false)

onMounted(async () => {
  getData()
})

const getData = () => {
  const responseDataSurvey = getDataSurvey()
  const draftUserSurvey = getUserSurveyDraft()

  if (draftUserSurvey?.project.status === ProjectStatus.DRAFT && draftUserSurvey.flowData.id && responseDataSurvey) {
    const value = buildDataFlowWithDraftUserSurvey(draftUserSurvey?.flowData.steps, responseDataSurvey)
    dataSurvey.value = value
    currentStep.value = draftUserSurvey.flowData.steps.length - 1
  }
  if (!draftUserSurvey.flowData.id && responseDataSurvey) {
    const draft = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      projectId: flowStore.get.project.id,
      steps: [],
    }
    flowStore.initFlowData(draft)
    dataSurvey.value = responseDataSurvey
  }
}

const handleNextClick = () => {
  if (!isLoading.value) {
    currentStep.value++
  }
}

const handlePreviousClick = () => {
  if (!isLoading.value) {
    currentStep.value--
  }
}

const handleFinalClick = () => {
  if (dataSurvey.value !== undefined && dataSurvey.value.length > 0 && !isLoading.value
  ) {
    isLoading.value = true

    const flowData = flowStore.get.flowData;
    const projectFlowStore = flowStore.get.project;

    const userSurvey = buildUserSurvey(dataSurvey.value)
    flowStore.addStepData(userSurvey, true)

    const resultMapping = buildResultMapping(userSurvey, dataSurvey.value)

    const result = {
      ...flowData,
      rank: getRankingScore(dataSurvey.value, resultMapping),
      steps: resultMapping
    }

    const project = {
      ...projectFlowStore,
      status: ProjectStatus.PUBLISH
    }

    saveUserSurveyResult({ result, project })
    deleteUserSurveyFlowData()

    setTimeout(() => {
      router.push({ path: `${PATH.result}/${projectFlowStore.id}` })
    }, 2500)
  } else {
    setTimeout(() => {
      router.push(PATH.flow)
    }, 2500)
  }
}

const addToFlowStore = () => {
  const dataToSave = buildUserSurvey(dataSurvey.value)
  const currentStepIndex = currentStep.value
  const stepsData = dataToSave.slice(0, currentStepIndex + 1)
  flowStore.addStepData(stepsData, false)
}

const handleToggleChanged = (pointIndex: number, value: boolean) => {
  dataSurvey.value[currentStep.value].rules[pointIndex].checked = value
  addToFlowStore()
}

const handleInputChanged = (pointIndex: number, value: string) => {
  dataSurvey.value[currentStep.value].rules[pointIndex].value = Number(value)
  addToFlowStore()
}

const handleSaveFlow = () => {
  disabledSaveButton.value = true

  setTimeout(() => {
    disabledSaveButton.value = false
  }, 300)
}
</script>

<template>
  <CContainer v-if="dataSurvey.length > 0">
    <CRow>
      <CCol :lg="12" :xs="12">
        <StepView :title="dataSurvey[currentStep].title" :rules="dataSurvey[currentStep].rules"
          :isStepSending="isLoading" @onToggleChanged="handleToggleChanged" @onInputChanged="handleInputChanged" />
      </CCol>
    </CRow>

    <CRow class="mt-2 mb-2 d-flex justify-content-end">
      <CCol :lg="4" :xs="4">
        <CButton color="primary" size="sm" :disabled="disabledSaveButton" class="me-1" @click="handleSaveFlow">
          <CSpinner as="span" size="sm" variant="grow" aria-hidden="true" v-if="isLoading" />
          {{ WORDING.saveAction }}
        </CButton>
      </CCol>
      <CCol :lg="8" :xs="8" class="d-flex justify-content-end">
        <CButton color="primary" size="sm" :disabled="isLoading" class="me-1" v-if="currentStep > 0"
          @click="handlePreviousClick">
          <CSpinner as="span" size="sm" variant="grow" aria-hidden="true" v-if="isLoading" />
          {{ WORDING.leftAction }}
        </CButton>

        <CButton color="primary" size="sm" v-if="currentStep < dataSurvey.length - 1" @click="handleNextClick">
          <CSpinner as="span" size="sm" variant="grow" aria-hidden="true" v-if="isLoading" />
          {{ WORDING.nextAction }}
        </CButton>

        <CButton color="primary" size="sm" v-if="currentStep === dataSurvey.length - 1" :isLoading="isLoading"
          @click="handleFinalClick">
          <CSpinner as="span" size="sm" variant="grow" aria-hidden="true" v-if="isLoading" />
          {{ WORDING.finalAction }}
        </CButton>
      </CCol>
    </CRow>

  </CContainer>
  <CRow v-else>
    <CCol :lg="12">
      <CSpinner variant="grow" />
      <h4>Getting the survey</h4>
    </CCol>
  </CRow>
</template>