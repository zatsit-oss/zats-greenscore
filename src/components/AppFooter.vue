<script setup lang="ts">
import { PATH } from '@/utils/path';

</script>

<template>
  <CFooter class="px-4">
    <div class="mx-auto">
      <a :href="`${PATH.zatsitWebsite}`" target="_blank">zatsit</a>
      <span class="ms-1">&copy; {{ new Date().getFullYear() }}</span>
    </div>
  </CFooter>
</template>
