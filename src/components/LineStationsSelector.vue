<template>
  <q-popup-proxy v-model="display" no-parent-event>
    <div class="content" v-if="line.stations">
      <div class="row row-item" v-for="station in line.stations" :key="station.id">
        <div class="col-5"
             style="font-weight:bold;">
          <span style="text-overflow: ellipsis;white-space: nowrap;">{{ station.name }}</span>
          <span class="pill">当前</span>
        </div>
        <div class="col-3" v-show="station.id===currentStationId">

        </div>
        <div class="col-4 text-right">{{ station.code }}</div>
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
    const currentStationId = ref(null)
    const showSelector = (lineProp, currentStationIdProp) => {
      console.log('show selector ', line, currentStationIdProp)
      if (lineProp && lineProp.stations) {
        line.value = lineProp
        currentStationId.value = currentStationIdProp
        display.value = true
      }
    }
    const handleSelectStation = (station) => {
      emit('selectStation')
    }
    return {display, line, showSelector, handleSelectStation, currentStationId}
  }
})


</script>

<style scoped>
.content {
  background-color: var(--q-background);
  width: 70%;
  max-width: 400px;
  max-height: 50vh;
  overflow-y: auto;
  padding: 10px;
}

.row-item {
  height: 30px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--q-normal);
  transition: .3s;
}

.row-item:active {
  background-color: var(--q-primary);
  color: #ffffff;
}

.pill {
  background-color: var(--q-primary);
  padding: 2px 5px;
  border-radius: 5px;
  color: #ffffff;
  flex-shrink: 0;
  margin-left: 2px;
}
</style>
