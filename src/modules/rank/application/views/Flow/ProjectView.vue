<script setup lang="ts">
import { useFlowStore } from '@/modules/rank/infrastructure/controllers/stores/flow'
import { ProjectStatus } from '@/type/project.type'
import { WORDING } from '@/utils/wording'
import { v4 as uuidv4 } from 'uuid'
import { ref } from 'vue'

const flowStore = useFlowStore()
const projectName = ref()


const emit = defineEmits<{
  (e: 'onCreateProjectClick'): void
}>()

const handleInputChanged = (value: string) => {
  projectName.value = value
}

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
      <CCard class="custom-card">
        <CCardBody>
          <CRow class="text-center">
            <h4>{{ WORDING.stepProject.subtitle }}</h4>
          </CRow>
          <CRow class="mt-2 form">
            <CCol :lg="8" class="pe-0 mb-2">
              <input class="form-control" :id="projectName" :name="projectName" type="text" :value="projectName"
                @input="(event) => handleInputChanged((event.target as HTMLInputElement).value)"
                style="height: 31px;" />
            </CCol>
            <CCol :lg="4" class="ps-2 d-md-inline d-flex justify-content-center">
              <CButton color="primary" size="sm" @click="handleCreateProject()">Create project</CButton>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>
</template>

<style scoped>
.custom-card {
  height: 18vh;
  box-shadow: none;
}

.form {
  padding-left: 4rem;
}

@media (max-width: 768px) {
  .custom-card {
    height: 30vh;
  }

  .form {
    padding-left: unset;
    padding-right: 0.5rem !important;
  }
}
</style>
