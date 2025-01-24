<script setup lang="ts">
import { outputs } from '@/config/outputs';
import type { userSurveyDraft } from '@/modules/rank/domain/userSurveyResult/userSurveyResult';
import { getUserSurveyDraft } from '@/modules/rank/domain/userSurveyResult/userSurveyResult.actions';
import { ProjectStatus } from '@/type/project.type';
import { onMounted, ref } from 'vue';
import ProjectView from './ProjectView.vue';
import SurveyFlowView from './SurveyFlowView.vue';

const SURVEY_FLOW = 'survey'
const PROJECT_FLOW = 'project'

const currentView = ref(PROJECT_FLOW)

const handleCreateProject = () => {
  currentView.value = SURVEY_FLOW
}

const getData = () => {

  const draftUserSurvey: userSurveyDraft = getUserSurveyDraft(
    outputs.userSurveyFlow
  )

  if (draftUserSurvey?.project.id && draftUserSurvey?.project.status === ProjectStatus.DRAFT) {
    currentView.value = SURVEY_FLOW
  }
  else {
    currentView.value = PROJECT_FLOW
  }
}

onMounted(async () => {
  getData()
})
</script>

<template>
  <div v-if="currentView === PROJECT_FLOW">
    <ProjectView @onCreateProjectClick="handleCreateProject" />
  </div>
  <div v-else>
    <SurveyFlowView />
  </div>
</template>
