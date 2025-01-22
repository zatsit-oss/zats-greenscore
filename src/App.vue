<script setup lang="ts">
import { useThemeStore } from '@/stores/theme';
import { useColorModes } from '@coreui/vue';
import { onBeforeMount } from 'vue';
import CoreUiToast from "./components/CoreUiToast.vue";
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
  <CoreUiToast>
    <GlobalErrorHandler>
      <router-view />
    </GlobalErrorHandler>
  </CoreUiToast>
</template>

<style lang="scss">
// Import Main styles for this application
@import 'styles/style';
</style>
