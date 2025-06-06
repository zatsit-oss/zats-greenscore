<script setup lang="ts">
import { getRankingColor } from '@/utils/greenscore'
const props = defineProps<{
  value: string
}>()

const valueList = ["A", "B", "C", "D", "E"]

console.log(props.value)
</script>

<template>
  <div class="circle-container">
    <div v-for="v in valueList" class="circle" :class="{ highlighted: v === props.value }"
      :style="{ backgroundColor: `var(${getRankingColor(v)})` }">{{ v }}</div>
  </div>
</template>

<style scoped>
.circle-container {
  display: flex;
  gap: 2px;
  justify-content: center;
  align-items: center;
  position: relative;
}

.circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  transition: transform 0.3s ease, z-index 0.3s ease;
  position: relative;
  z-index: 1;
  color: white;
}

.highlighted {
  transform: scale(1.5);
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.3);
}
</style>
