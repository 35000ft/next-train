<template>
  <bottom-modal :display="displayRailSystemSelector" @close="handleCloseRailSystemSelector">
    <template v-slot:default>
      <div>
        <q-input outlined rounded v-model="text" label="线网名 | 城市名" :bg-color="'grey-2'"/>
      </div>
      <div class="row">
        <div></div>
      </div>
    </template>
  </bottom-modal>
</template>

<script>
import BottomModal from "components/BottomModal.vue";
import {defineComponent, ref} from "vue";


export default defineComponent({
  components: {BottomModal},
  setup(_, {emit}) {
    const displayRailSystemSelector = ref(false)
    const text = ref('')
    const handleCloseRailSystemSelector = () => {
      displayRailSystemSelector.value = false
      emit('close')
    }
    const showRailSystemSelector = () => {
      displayRailSystemSelector.value = true
    }
    return {showRailSystemSelector, displayRailSystemSelector, handleCloseRailSystemSelector, text, emit}
  }
})


</script>

<style scoped>
</style>
