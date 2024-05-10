<script>
export default {
  name: 'ToggleComponent',
  props: {
    checked: {
      type: Boolean,
      required: true
    },
    disabled: {
      type: Boolean,
      required: true
    },
    label: {
      type: String,
      required: true
    }
  }
}
</script>

<template>
  <CRow class="d-flex justify-content-center align-items-center">
    <CCol :lg="10" :xs="10">
      <p>{{ label }}</p>
    </CCol>
    <CCol :lg="2" :xs="2">
      <CFormSwitch
        size="xl"
        v-bind="$attrs"
        type="checkbox"
        :disabled="disabled"
        :checked="checked"
        @change="$emit('update:checked', $event.target.checked)"
      />
    </CCol>
  </CRow>
</template>

<style>
.custom-card {
  box-shadow: none;
}

@media (min-width: 769px) {
  .form-switch-xl .form-check-input {
    width: 3rem;
  }
}
</style>
