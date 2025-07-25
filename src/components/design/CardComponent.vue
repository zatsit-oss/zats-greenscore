<script setup lang="ts">
import { WORDING } from '@/utils/wording'
import { CButton } from '@coreui/vue'
import { DateTime } from 'luxon'
import RankPanel from './RankPanel.vue'

const props = defineProps<{
  projectName: string
  date: string
  wordingButton: string
  rank: string
  buttonUnderline?: boolean
}>()

const emit = defineEmits<{
  (e: 'onButtonClick'): void
  (e: 'onDeleteClick'): void
}>()

const handleButtonClick = () => {
  emit('onButtonClick')
}

const handleDeleteClick = () => {
  emit('onDeleteClick')
}
</script>

<template>
  <CRow class="justify-content-center">
    <CCol :lg="10" :md="11" :sm="12">
      <CCard class="custom-card">
        <CCardBody class="px-4 py-4">
          <CRow class="align-items-start">
            <CCol :lg="6" :xs="6">
              <h4 class="mb-1">{{ props.projectName }}</h4>
              <p class="text-muted mb-2">
                {{ DateTime.fromISO(date).toFormat('yyyy LLL dd') }}
              </p>
            </CCol>
            <CCol :lg="6" :xs="6" class="d-flex justify-content-end pt-1">
              <div class="delete-icon" @click="handleDeleteClick()">
                <CIcon icon="cil-trash" size="lg" />
              </div>
            </CCol>
          </CRow>

          <RankPanel :value="rank" />

          <CRow>
            <CCol class="d-flex justify-content-end pt-5">
              <CButton color="primary" size="sm" class="w-auto" @click="handleButtonClick()">
                {{ props.wordingButton }}
              </CButton>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>
</template>

<style scoped>
.custom-card {
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.2s ease;
}

.custom-card:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
}

.delete-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  cursor: pointer;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.delete-icon:hover {
  background-color: #f2f2f2;
}
</style>
