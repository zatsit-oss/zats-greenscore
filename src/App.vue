<script setup lang="ts">
import { onBeforeMount } from 'vue'
import { useColorModes } from '@coreui/vue'

import { useThemeStore } from '@/stores/theme'
import GlobalErrorHandler from './components/errors/GlobalErrorHandler.vue';
const { isColorModeSet, setColorMode } = useColorModes(
  'zatsit-template-theme',
)
const currentTheme = useThemeStore()

onBeforeMount(() => {
  const urlParams = new URLSearchParams(window.location.href.split('?')[1])
  let theme = urlParams.get('theme')

  if (theme !== null && (theme.match(/^[A-Za-z0-9\s]+/))) {
    const matchedTheme = theme.match(/^[A-Za-z0-9\s]+/)
    theme = matchedTheme ? matchedTheme[0] : ''
  }

  if (theme) {
    setColorMode(theme)
    return
  }

  if (isColorModeSet()) {
    return
  }

  setColorMode(currentTheme.theme)
})

</script>

<template>
  <GlobalErrorHandler>
    <router-view />
  </GlobalErrorHandler>
</template>

<style lang="scss">
// Import Main styles for this application
@import 'styles/style';
</style>
