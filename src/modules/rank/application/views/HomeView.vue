<script setup lang="ts">
import { outputs } from '@/config/outputs'
import { getProjectsResult } from '@/modules/rank/infrastructure/controllers/userSurvey/userSurveyHome'
import type { ProjectsResults } from '@/type/result.type'
import { PATH } from '@/utils/path'
import { WORDING } from '@/utils/wording'
import { DateTime } from 'luxon'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { deleteProjectResult } from '../../domain/userSurveyResult/userSurveyResult.actions'
import CardComponent from './Home/CardComponent.vue'

const router = useRouter()
const results = ref<null | ProjectsResults>(null)

const perPage = 10
const currentPage = ref(1)
const isPaginationDisplayed = ref(false)

onMounted(async () => {
  getUserSurvey()
  isPaginationDisplayed.value = results.value ? results.value.length > perPage : false
})

const getUserSurvey = () => {
  const response = getProjectsResult()

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

const paginatedResults = computed(() => {
  if (results.value) {
    const start = (currentPage.value - 1) * perPage
    const end = start + perPage
    return results.value.slice(start, end)
  }
})

const totalPages = computed(() => results.value ? Math.ceil(results.value.length / perPage) : 0)

const goToPage = (page: number) => {
  currentPage.value = page
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
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
        <CCardBody>
          <CRow class="d-flex">
            <CCol :lg="6" :xs="6">
              <h4>{{ WORDING.home.title }} 👋</h4>
            </CCol>
            <CCol :lg="6" :xs="6" class="d-flex justify-content-end align-items-center">
              <CButton class="no-grow-btn" color="primary" size="sm" @click="handleStartSurveyClick()">{{
                WORDING.home.mainButton }}</CButton>
            </CCol>
          </CRow>
          <CRow class="mt-3" v-if="results">
            <CCol :lg="6" :xs="12" class="mb-4" v-for="(item, index) in paginatedResults" :key="item.project.id">
              <CardComponent :projectName="item.project.name" :date="item.project.createdAt" :rank="item.result.rank"
                @onButtonClick="handleLastResultClick(item.project.id)"
                @onDeleteClick="handleDeleteResultClick(item.project.id, item.result.id)"
                :wordingButton="WORDING.home.card.button" :buttonUnderline="index !== 0" />
            </CCol>
          </CRow>
          <CRow v-if="results && isPaginationDisplayed">
            <CPagination align="center" aria-label="Pagination">
              <CPaginationItem @click="prevPage" :disabled="currentPage === 1">
                <CIcon name="cil-arrow-left" />
              </CPaginationItem>

              <CPaginationItem v-for="page in totalPages" :key="page" @click="goToPage(page)"
                :active="page === currentPage">
                {{ page }}
              </CPaginationItem>

              <CPaginationItem @click="nextPage" :disabled="currentPage === totalPages">
                <CIcon name="cil-arrow-right" />
              </CPaginationItem>
            </CPagination>
          </CRow>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>
</template>

<style>
.no-grow-btn {
  flex-shrink: 0;
  max-height: 40px;
}
</style>
