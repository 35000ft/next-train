<template>
  <span :style="{backgroundColor: bgColor,color:textColor,borderRadius:borderRadius,fontSize:fontSize}">
    {{ line.name }}
  </span>
</template>
<script setup>
// 接收父组件传递的 props
import {computed} from "vue";
import {isDarkColor} from "src/utils/color-utils";

const props = defineProps({
  line: Object,
  fontSize: {
    type: String,
    default: '15px'
  },
  borderRadius: {
    type: String,
    default: '5px'
  },
  disabled: {
    type: Boolean,
    default: false
  }
})
const bgColor = computed(() => {
  if (props.disabled) {
    return '#dcdcdc'
  }
  return props.line.color
})
const textColor = computed(() => {
  if (props.disabled) {
    return '#858585'
  }
  let darkColor = isDarkColor(props.line.color);
  if (darkColor) {
    return '#ffffff'
  }
  return '#000000'
})
</script>
<style scoped>
span {
  width: fit-content;
  padding: 2px 8px;
  text-align: center;
  align-items: center;
  display: inline-block;
}
</style>
