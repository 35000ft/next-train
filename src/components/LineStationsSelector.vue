<template>
  <q-popup-proxy v-model="display" no-parent-event>
    <div class="row page-background"
         style="width: 90%;max-height: 50vh;overflow-y: auto;padding: 10px;">
      <div class="col-12">
        IS NJ SDFSFLKJDASADSA
      </div>
    </div>
  </q-popup-proxy>
</template>

<script>
import {defineComponent, ref} from "vue";

export default defineComponent({
  setup(_, {emit}) {
    const display = ref(false)
    const line = ref(null)
    const showSelector = (lineProp, currentStationId) => {
      console.log('show selector ', lineProp)
      if (lineProp && lineProp.stations) {
        display.value = true
      }
    }
    const handleSelectStation = (station) => {
      emit('selectStation')
    }
    return {display, line, showSelector, handleSelectStation}
  }
})


</script>

<style scoped>

</style>
