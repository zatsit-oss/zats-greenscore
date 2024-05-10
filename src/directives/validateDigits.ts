import type { DirectiveBinding } from 'vue'
export default {
  mounted(el: HTMLInputElement, binding: DirectiveBinding) {
    const maxDigits = binding.value || 3
    el.addEventListener('input', () => {
      if (el.value.length > maxDigits) {
        el.value = el.value.slice(0, maxDigits)
        el.dispatchEvent(new Event('input'))
      }
      el.value = el.value.replace(/\D/g, '')
      el.dispatchEvent(new Event('input'))
    })
  }
}
