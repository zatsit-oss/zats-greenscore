<script setup lang="ts">
import { type ToastProvid } from '@/components/CoreUiToast.vue'
import { outputs } from '@/config/outputs'
import { getDataSurvey } from '@/modules/rank/domain/dataSurvey/dataSurvey.actions'
import { getCurrentProjectResult } from '@/modules/rank/domain/userSurveyResult/userSurveyResult.actions'
import type { DataSurvey } from '@/type/dataStepSurvey.type'
import type { ProjectResult } from '@/type/result.type'
import { ToastType } from '@/type/toast.type'
import { ERROR_MESSAGE } from '@/utils/errorHandler'
import { getIconResult } from '@/utils/iconResult'
import { PATH } from '@/utils/path'
import { WORDING } from '@/utils/wording'
import { CContainer } from '@coreui/vue'
import { inject, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import RankPanel from '../../../../../components/design/RankPanel.vue'

const router = useRouter()
const route = useRoute()
const currentProjectUuid = ref<null | string>(null)
const dataSurvey = ref<DataSurvey[]>([])
const toaster = inject<ToastProvid>("toaster")

const projectResult = ref<null | ProjectResult>(null)

const getData = () => {
  dataSurvey.value = getDataSurvey(outputs.dataSurvey)
}

const getResult = () => {
  if (currentProjectUuid.value) {

    const response = getCurrentProjectResult(outputs.userSurveyResult, currentProjectUuid.value)
    if (response) {
      projectResult.value = response
    } else {
      if (toaster) {
        toaster.showMessage({ message: ERROR_MESSAGE.project, type: ToastType.ERROR })
      }
      router.push(PATH.home)
    }
  }
}

onMounted(() => {
  if (route.params.id) {
    currentProjectUuid.value = route.params.id as string
    getData()
    getResult()
  } else {
    if (toaster) {
      toaster.showMessage({ message: ERROR_MESSAGE.project, type: ToastType.ERROR })
    }
    router.push(PATH.home)
  }
})
</script>

<template>
  <CRow>
    <CCol :lg="12">
      <CCard>
        <CCardBody>
          <CRow class="d-flex p-3">
            <CCol>
              <h3>{{ projectResult?.project.name }}</h3>
            </CCol>
            <CCol>
              <RankPanel v-if="projectResult" :value="projectResult?.result.rank" />
            </CCol>
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
                      <CContainer class="text-center" v-if="typeof rule.value === 'number'">{{ rule.value }}
                      </CContainer>
                      <CContainer class="text-center" v-else>
                        <component :is="getIconResult(rule.value)" class="result-icon" />
                      </CContainer>
                    </CCol>
                  </CRow>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
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
