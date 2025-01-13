<script setup lang="ts">
import { getDataSurvey } from '@/controllers/dataSurvey/dataSurvey'
import { getCurrentProjectResult } from '@/controllers/userSurvey/userSurveyResults'
import type { DataSurvey } from '@/type/dataStepSurvey.type'
import type { ProjectResult } from '@/type/result.type'
import { getIconResult } from '@/utils/iconResult'
import { PATH } from '@/utils/path'
import { WORDING } from '@/utils/wording'
import { CContainer } from '@coreui/vue'
import { DateTime } from 'luxon'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import RankPanel from './RankPanel.vue'

const router = useRouter()
const route = useRoute()
const currentProjectUuid = ref<null | string>(null)
const dataSurvey = ref<DataSurvey[]>([])

const projectResult = ref<null | ProjectResult>(null)

const getData = () => {
  dataSurvey.value = getDataSurvey()
}

const getResult = () => {
  if (currentProjectUuid.value) {

    const response = getCurrentProjectResult(currentProjectUuid.value)
    if (response) {
      projectResult.value = response
    } else {
      router.push(PATH.home)
    }
  }
}

const handleRestartSurvey = () => {
  router.push(PATH.flow)
}

onMounted(() => {
  if (route.params.id) {
    currentProjectUuid.value = route.params.id as string
    getData()
    getResult()
  } else {
    router.push(PATH.home)
  }
})
</script>

<template>
  <CRow>
    <CCol :lg="12">
      <CCard>
        <CCardHeader size="sm">
          <CRow class="d-flex" v-if="projectResult?.project">
            <CCol :lg="6" :xs="6">
              <h4>{{ WORDING.finalStep.title }} - {{
                projectResult.project.name }} </h4>
            </CCol>
            <CCol :lg="6" :xs="6" class="d-flex justify-content-end align-items-center">
              <h4>{{ DateTime.fromISO(projectResult.project.createdAt).toFormat('yyyy LLL dd') }}</h4>
            </CCol>
          </CRow>
        </CCardHeader>
        <CCardBody>
          <CRow class="d-flex">
            <CCol :lg="6" :xs="6">
              <h4>
                <h4><u>{{ WORDING.finalStep.scoreTitle }}</u>:</h4>
              </h4>
            </CCol>
            <RankPanel v-if="projectResult" :value="projectResult?.result.rank" />
          </CRow>
          <CRow class="d-flex">
            <h4><u>{{ WORDING.finalStep.resumeTitle }}</u>:</h4>
          </CRow>

          <CRow class="mt-3" v-if="projectResult">
            <CCol :lg="6" :xs="12" class="mb-2" v-for="(step, currentStep) in projectResult.result.steps"
              :key="step.id">
              <CCard class="custom-card">
                <CCardBody>
                  <CRow class="mb-2">
                    <h4>{{ dataSurvey[currentStep].title }}</h4>
                  </CRow>
                  <CRow v-for="(rule, index) in step.rules" :key="index">
                    <CCol :lg="10" :xs="9">
                      <p>{{ dataSurvey[currentStep].rules[index].title }}</p>
                    </CCol>
                    <CCol :lg="2" :xs="3" class="d-flex justify-content-center align-items-top">
                      <CContainer v-if="typeof rule.value === 'number'">{{ rule.value }}%</CContainer>
                      <CContainer v-else>
                        <component :is="getIconResult(rule.value)" class="result-icon" />
                      </CContainer>
                    </CCol>
                  </CRow>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>

          <CButton color="primary" size="sm" @click="handleRestartSurvey()">{{ WORDING.finalStep.button }}</CButton>

        </CCardBody>
      </CCard>
    </CCol>
  </CRow>
</template>

<style>
.result-icon {
  height: 30px;
}
</style>
