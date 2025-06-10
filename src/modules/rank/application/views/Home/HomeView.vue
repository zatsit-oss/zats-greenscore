<script setup lang="ts">
import { outputs } from '@/config/outputs'
import type { ProjectsResults } from '@/type/result.type'
import { PATH } from '@/utils/path'
import { WORDING } from '@/utils/wording'
import { DateTime } from 'luxon'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { deleteProjectResult } from '../../../domain/userSurveyResult/userSurveyResult.actions'
import CardComponent from '../../../../../components/design/CardComponent.vue'
import { getProjectsResult } from '../../../domain/userSurveyHome/userSurveyHome.actions'
import type { userSurveyDraft } from '../../../domain/userSurveyFlow/userSurveyFlow'
import { getUserSurveyDraft } from '../../../domain/userSurveyFlow/userSurveyFlow.actions'

const router = useRouter()
const results = ref<null | ProjectsResults>(null)
let isDraft = ref<Boolean>(false)

onMounted(async () => {
  getUserSurvey()
})

const getUserSurvey = () => {
  const response = getProjectsResult(outputs.userSurveyHome)
  const draftUserSurvey: userSurveyDraft = getUserSurveyDraft(outputs.userSurveyFlow)
  isDraft.value = draftUserSurvey.flowData.id != null

  if (response !== undefined) {
    const sort = response.sort(function (a, b) {
      return (
        DateTime.fromISO(b.result.createdAt).toMillis() -
        DateTime.fromISO(a.result.createdAt).toMillis()
      )
    })
    results.value = sort
  }
}

const handleLastResultClick = (projectUuid: string) => {
  router.push({ path: `${PATH.result}/${projectUuid}` })
}

const handleDeleteResultClick = async (projectId: string, resultId: string) => {
  deleteProjectResult(outputs.userSurveyResult, projectId, resultId)
  getUserSurvey()
}

const handleStartSurveyClick = () => {
  router.push(PATH.flow)
}

</script>

<template>
  <CRow>
    <CCol :lg="12">
      <CCard>
        <CCardHeader class="p-3">
          <CRow class="d-flex">
            <CCol :lg="6" :xs="6">
              <h4>{{ WORDING.home.title }} 👋</h4>
              <h6>{{ WORDING.home.subtitle }}</h6>
            </CCol>
            <CCol :lg="6" :xs="6" class="d-flex justify-content-end align-items-center">
              <CButton color="primary" size="sm" @click="handleStartSurveyClick()">{{
                isDraft ? WORDING.home.draft : WORDING.home.mainButton }}</CButton>
            </CCol>
          </CRow>
        </CCardHeader>
        <CCardBody>
          <CRow class="mt-3" v-if="results?.length">
            <CCol :lg="6" :xs="12" class="mb-4" v-for="(item, index) in results" :key="item.project.id">
              <CardComponent :projectName="item.project.name" :date="item.project.createdAt" :rank="item.result.rank"
                @onButtonClick="handleLastResultClick(item.project.id)"
                @onDeleteClick="handleDeleteResultClick(item.project.id, item.result.id)"
                :wordingButton="WORDING.home.card.button" :buttonUnderline="index !== 0" />
            </CCol>
          </CRow>
          <CRow v-else class="d-flex align-items-center justify-content-center" style="min-height: 20rem;">
            <CRow class="text-center">
              <h5>No survey found !</h5>
              <h6>Create a new survey</h6>
            </CRow>
          </CRow>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>
</template>

<style></style>
