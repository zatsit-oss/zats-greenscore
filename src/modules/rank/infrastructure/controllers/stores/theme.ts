import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', () => {
  const theme = ref('auto')

  const toggleTheme = (_theme: string) => {
    theme.value = _theme
  }

  return { theme, toggleTheme }
})
