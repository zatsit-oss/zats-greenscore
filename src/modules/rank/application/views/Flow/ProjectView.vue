<script setup lang="ts">
import { useFlowStore } from '@/modules/rank/infrastructure/controllers/stores/flow'
import { ProjectStatus } from '@/type/project.type'
import { WORDING } from '@/utils/wording'
import { v4 as uuidv4 } from 'uuid'
import { ref } from 'vue'

const flowStore = useFlowStore()
const projectName = ref('')

const emit = defineEmits<{
  (e: 'onCreateProjectClick'): void
}>()

const handleCreateProject = () => {
  emit('onCreateProjectClick')
  const projecUUID = uuidv4()
  const project = {
    id: projecUUID,
    name: projectName.value,
    createdAt: new Date().toISOString(),
    status: ProjectStatus.DRAFT
  }
  flowStore.addProject(project)
}

</script>

<template>
  <CRow class="d-flex justify-content-center">
    <CCol :lg="6" :xs="12">
      <CCard class="custom-card p-5">
        <CCardBody class="d-flex flex-column gap-3">
          <CRow class="text-center">
            <h4>{{ WORDING.stepProject.subtitle }}</h4>
          </CRow>
          <CRow>
            <input class="form-control" type="text" placeholder="Your project name" v-model="projectName" />
          </CRow>
          <CRow>
            <CButton color="primary" size="sm" @click="handleCreateProject()">Create project</CButton>
          </CRow>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>
</template>

<style scoped></style>
