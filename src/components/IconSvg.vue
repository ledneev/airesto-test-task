<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  name: 'search' | 'theme' | 'exit' | 'phone'
  size?: number
  color?: string
  strokeWidth?: number
}>(), {
  size: 24,
  color: 'currentColor',
  strokeWidth: 1.5
})

const iconPaths = {
  search: {
    viewBox: '0 0 20 20',
    paths: [
      '<path d="M9.33333 14.6667C12.2789 14.6667 14.6667 12.2789 14.6667 9.33333C14.6667 6.38781 12.2789 4 9.33333 4C6.38781 4 4 6.38781 4 9.33333C4 12.2789 6.38781 14.6667 9.33333 14.6667Z" stroke="currentColor" stroke-opacity="0.48" stroke-linecap="round" stroke-linejoin="round"/>',
      '<path d="M16 16L13.1334 13.1333" stroke="currentColor" stroke-opacity="0.48" stroke-linecap="round" stroke-linejoin="round"/>'
    ]
  },
  theme: {
    viewBox: '0 0 24 24',
    paths: [
      '<rect width="24" height="24" rx="4" fill="currentColor" fill-opacity="0.08"/>',
      '<path d="M12 14.4C13.3255 14.4 14.4 13.3255 14.4 12C14.4 10.6746 13.3255 9.60004 12 9.60004C10.6745 9.60004 9.59998 10.6746 9.59998 12C9.59998 13.3255 10.6745 14.4 12 14.4Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>',
      '<path d="M12 6V7.2M12 16.8V18M7.758 7.758L8.604 8.604M15.396 15.396L16.242 16.242M6 12H7.2M16.8 12H18M8.604 15.396L7.758 16.242M16.242 7.758L15.396 8.604" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>'
    ]
  },
  exit: {
    viewBox: '0 0 16 16',
    paths: [
      '<path d="M3.125 14C2.825 14 2.5625 13.9 2.3375 13.7C2.1125 13.5 2 13.2667 2 13V3C2 2.73333 2.1125 2.5 2.3375 2.3C2.5625 2.1 2.825 2 3.125 2H8.58125V3H3.125V13H8.58125V14H3.125ZM10.7375 10.9167L9.93125 10.2L11.8438 8.5H5.28125V7.5H11.8063L9.89375 5.8L10.7 5.082L14 8.01533L10.7375 10.9167Z" fill="currentColor"/>'
    ]
  },
  phone: {
    viewBox: '0 0 12 12',
    paths: [
      '<path d="M9.99975 7.98954V9.19386C10.0002 9.30566 9.97726 9.41633 9.93238 9.51876C9.8875 9.6212 9.82168 9.71316 9.73913 9.78874C9.65659 9.86432 9.55913 9.92187 9.45301 9.95768C9.34689 9.9935 9.23444 10.0068 9.12287 9.99674C7.88512 9.86252 6.69617 9.4404 5.65156 8.76432C4.67969 8.14797 3.85571 7.32562 3.23813 6.35567C2.55834 5.3084 2.1353 4.11603 2.00326 2.87518C1.99321 2.76417 2.00643 2.65228 2.04208 2.54665C2.07773 2.44102 2.13503 2.34395 2.21032 2.26163C2.28562 2.1793 2.37727 2.11353 2.47943 2.06849C2.58159 2.02346 2.69203 2.00014 2.80372 2.00004H4.01043C4.20564 1.99812 4.39489 2.06711 4.5429 2.19415C4.69091 2.32119 4.78759 2.4976 4.81491 2.69052C4.86584 3.07593 4.9603 3.45435 5.09647 3.81857C5.15059 3.96225 5.1623 4.11841 5.13022 4.26853C5.09814 4.41866 5.02361 4.55646 4.91547 4.66561L4.40462 5.17544C4.97723 6.18046 5.81103 7.01261 6.81805 7.58408L7.32889 7.07425C7.43826 6.96632 7.57633 6.89194 7.72675 6.85992C7.87718 6.8279 8.03364 6.83959 8.17761 6.8936C8.54255 7.02951 8.92173 7.12378 9.3079 7.17461C9.5033 7.20212 9.68174 7.30035 9.80931 7.4506C9.93687 7.60085 10.0046 7.79266 9.99975 7.98954Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>'
    ]
  }
}

const icon = computed(() => iconPaths[props.name])
const style = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
  color: props.color,
  '--stroke-width': props.strokeWidth
}))
</script>

<template>
  <svg
    :viewBox="icon.viewBox"
    :style="style"
    class="icon-svg"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g v-html="icon.paths.join('')"></g>
  </svg>
</template>

<style scoped>
.icon-svg {
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
}
</style>