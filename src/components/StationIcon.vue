<template>
  <span :style="{backgroundColor: bgColor,color:textColor,borderRadius:borderRadius,fontSize:fontSize}">
    {{ station.name }}
      <img v-if="station.railsystemLogo" style="height: 14px;width: 14px; margin-top: 7px;"
           :src="station.railsystemLogo" alt="Railsystem Logo">
  </span>

</template>
<script setup>
import {computed} from "vue";

const props = defineProps({
    station: Object,
    fontSize: {
        type: String,
        default: '15px'
    },
    borderRadius: {
        type: String,
        default: '5px'
    },

})
const bgColor = computed(() => {
    return '#dcdcdc'
})
const textColor = computed(() => {
    return '#858585'
})
</script>
<style scoped>
span {
    width: fit-content;
    padding: 2px 8px;
    text-align: center;
    align-items: center;
    display: inline-block;
    vertical-align: middle;
    cursor: default;
}
</style>
