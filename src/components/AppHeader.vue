<script setup lang="ts">
import { useDataSurvey } from '@/modules/rank/infrastructure/controllers/stores/dataSurvey'
import { useFlowStore } from '@/modules/rank/infrastructure/controllers/stores/flow'
import { WORDING } from '@/utils/wording'
import { useColorModes } from '@coreui/vue'
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { PATH } from '../utils/path'

const headerClassNames = ref('mb-4 p-0')
const { colorMode, setColorMode } = useColorModes('zatsit-template-theme')

const router = useRouter()
const survey = useDataSurvey()
const flowStore = useFlowStore()
const displaySaveButton = ref(false)
const isResultView = ref(false)
const disabledSaveButton = ref(false)

watch(router.currentRoute, (value) => {
  displaySaveButton.value = value.path === PATH.flow
  isResultView.value = value.path === PATH.result
})

watch([survey, flowStore], (values) => {
  disabledSaveButton.value = values.some((value) => value.isFetching)
})

onMounted(() => {
  document.addEventListener('scroll', () => {
    if (document.documentElement.scrollTop > 0) {
      headerClassNames.value = 'mb-4 p-0 shadow-sm'
    } else {
      headerClassNames.value = 'mb-4 p-0'
    }
  })
})

</script>

<template>
  <CHeader position="sticky" :class="headerClassNames">
    <CContainer class="border-bottom" fluid>
      <CHeaderNav class="d-md-flex align-items-center">
        <div class="logo" />
        <CNavItem>
          <CNavLink :href="`${PATH.home}`" class=" text-primary">
            <strong>{{ WORDING.website }}</strong>
          </CNavLink>
        </CNavItem>
      </CHeaderNav>
      <CHeaderNav>
        <CDropdown variant="nav-item" placement="bottom-end">
          <CDropdownToggle :caret="false">
            <CIcon v-if="colorMode === ' dark'" icon="cil-moon" size="lg" />
            <CIcon v-else-if="colorMode === 'light'" icon="cil-sun" size="lg" />
            <CIcon v-else icon="cil-contrast" size="lg" />
          </CDropdownToggle>
          <CDropdownMenu>
            <CDropdownItem :active="colorMode === 'light'" class="d-flex align-items-center" component="button"
              type="button" @click="setColorMode('light')">
              <CIcon class="me-2" icon="cil-sun" size="lg" /> {{ WORDING.theme.light }}
            </CDropdownItem>
            <CDropdownItem :active="colorMode === 'dark'" class="d-flex align-items-center" component="button"
              type="button" @click="setColorMode('dark')">
              <CIcon class="me-2" icon="cil-moon" size="lg" /> {{ WORDING.theme.dark }}
            </CDropdownItem>
            <CDropdownItem :active="colorMode === 'auto'" class="d-flex align-items-center" component="button"
              type="button" @click="setColorMode('auto')">
              <CIcon class="me-2" icon="cil-contrast" size="lg" /> {{ WORDING.theme.auto }}
            </CDropdownItem>
          </CDropdownMenu>
        </CDropdown>
        <li class="nav-item py-1">
          <div class="vr h-100 mx-2 text-body text-opacity-75"></div>
        </li>
      </CHeaderNav>
    </CContainer>
  </CHeader>
</template>

<style scoped>
.logo {
  width: 20px;
}
</style>
