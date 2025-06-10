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
  <CCard class="custom-card">
    <CCardBody>
      <CRow>
        <CCol :lg="6" :xs="6">
          <h4>{{ props.projectName }}</h4>
          <p>
            {{ DateTime.fromISO(date).toFormat('yyyy LLL dd') }}
          </p>
        </CCol>
        <CCol :lg="6" :xs="6" class="d-flex justify-content-end align-items-top">
          <div class="delete-icon">
            <CIcon @click="handleDeleteClick()" icon="cil-trash" size="lg" />
          </div>
        </CCol>
      </CRow>
      <RankPanel :value="rank" />
      <CRow>
        <CCol class="d-flex justify-content-end pt-5">
          <CButton color="primary" size="sm" class="w-auto" @click="handleButtonClick()">
            {{ WORDING.home.card.button }}
          </CButton>
        </CCol>
      </CRow>
    </CCardBody>
  </CCard>
</template>

<style scoped>
.delete-icon {
  display: flex;
  justify-content: flex-end;
  width: 2.5rem;
  height: 2.5rem;
  cursor: pointer;
}
</style>
