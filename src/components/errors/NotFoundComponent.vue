<script setup lang="ts">
import { PATH } from '@/utils/path';
import { WORDING } from '@/utils/wording';
import { CButton } from '@coreui/vue';
import { useRouter } from 'vue-router';

const router = useRouter()

const handleHomeClick = () => {
    router.push(PATH.home)
}

</script>

<template>
    <h1>{{ WORDING.notFoundComponent.title }}</h1>
    <h1 class="subtitle">{{ WORDING.notFoundComponent.subtitle }}</h1>
    <p class="message">{{ WORDING.notFoundComponent.message }}</p>
    <CButton color="primary" size="sm" @click="handleHomeClick()">{{ WORDING.notFoundComponent.button }}</CButton>
</template>

<style scoped>
.subtitle {
    padding-bottom: 2rem;
}

.message {
    font-size: 1.5rem;
    padding-bottom: 2rem;
}
</style>