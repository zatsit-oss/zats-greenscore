<script setup lang="ts">
import { getRankingColor } from '@/utils/greenscore';
const props = defineProps<{
  value?: string
}>()
</script>

<template>
  <div class="graph-score">
    <div class="graph-score-bar">
      <div
        class="graph-score-bar-results part--a"
      >
        -
      </div>
      <div
        id="score_a"
        :style="{ color: `var(${getRankingColor('A')})` }"
        class="graph-score-bar_part part--a"
      >
        A
      </div>
      <div
        id="score_b"
        :style="{ color: `var(${getRankingColor('B')})` }"
        class="graph-score-bar_part part--b"
      >
        B
      </div>
      <div
        id="score_c"
        :style="{ color: `var(${getRankingColor('C')})` }"
        class="graph-score-bar_part part--c"
      >
        C
      </div>
      <div
        id="score_d"
        :style="{ color: `var(${getRankingColor('D')})` }"
        class="graph-score-bar_part part--d"
      >
        D
      </div>
      <div
        id="score_e"
        :style="{ color: `var(${getRankingColor('E')})` }"
        class="graph-score-bar_part part--e"
      >
        E
      </div>
    </div>
  </div>
</template>

<style>
.graph-score {
  padding: 1rem;
}
.graph-score-bar {
  display: flex;
  flex-direction: row;
  align-items: center;
}
.graph-score-bar-results {
  font-size: 4rem;
  padding-right: 1rem;
}
.graph-score-bar_part {
  font-size: 1.5rem;
  padding: 0.75rem;
  border: black 1px solid;
}
</style>
