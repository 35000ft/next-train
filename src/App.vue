<template>
  <router-view/>
</template>

<script setup>
import {nextTick, onMounted} from "vue";
import {setCssVar, useQuasar} from "quasar";

defineOptions({
  name: 'App'
});
const $q = useQuasar()

onMounted(() => {
  const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--q-primary').trim()
  if (!$q.dark.isActive) {
    document.documentElement.style.setProperty('--q-primary-d', primaryColor);
  } else {
    document.documentElement.style.setProperty('--q-normal', '#dcdcdc');
    document.documentElement.style.setProperty('--q-background', '#3e3e3e');
  }
})
</script>
