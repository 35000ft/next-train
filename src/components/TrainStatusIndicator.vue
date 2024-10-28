<template>
  <div class="circle" :class="cssClass" :style="{height:size,width:size}">
    {{ arriveMins }}
  </div>
</template>
<script setup>
import {computed} from "vue";
import {scaleSize} from "src/utils/css-utils";

const props = defineProps({
  size: {
    type: String,
    default: '12px'
  },
})
const arriveMins = computed(() => {
  return 5
})

const size = computed(() => {
  if (cssClass.value === 'arrive-in-10-mins') {
    return scaleSize(props.size, 0.8)
  }
  return props.size
})

const cssClass = computed(() => {
  if (arriveMins.value < 10) {
    return 'arrive-in-10-mins'
  }
  return 'normal'
})
</script>

<style scoped>
.circle {
  overflow: hidden;
  display: flex;
  border-radius: 50%; /* 设置圆角为50%，形成圆形 */
  border: 0;
  justify-content: center;
  align-items: center;
}

.normal {
  background-color: darkseagreen;
}


.arrive-in-10-mins {
  padding: 0;
  color: var(--q-primary);
  background-color: transparent;
  border: 2px solid var(--q-primary);
}


</style>
