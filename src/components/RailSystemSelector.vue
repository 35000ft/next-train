<template>
  <bottom-modal :display="displayRailSystemSelector" @close="handleCloseRailSystemSelector">
    <template v-slot:default>
      <div>
        <q-input outlined rounded v-model="text" label="线网名 | 城市名" :bg-color="'grey-2'"/>
      </div>
      <div class="row" style="overflow-y: auto;">
        <q-skeleton style="height: 80px;width: 100%;" type="text" v-show="loading"/>
        <q-skeleton style="height: 80px;width: 100%;" type="text" v-show="loading"/>
        <div class="row rail-system-wrapper" v-for="(railsystem,index) in searchResults" :key="index"
             style="width: 100%;">
          <div class="col-6">{{ railsystem.fullname }}</div>
          <div class="col-2"></div>
          <div class="col-4" style="text-align: right;">{{ railsystem.name }}</div>
        </div>
      </div>
    </template>
  </bottom-modal>
</template>

<script>
import BottomModal from "components/BottomModal.vue";
import {defineComponent, ref} from "vue";
import {useStore} from "vuex";


export default defineComponent({
  components: {BottomModal},
  setup(_, {emit}) {
    const displayRailSystemSelector = ref(false)
    const text = ref('')
    const loading = ref(true)
    const store = useStore()
    const searchResults = ref([])
    const handleCloseRailSystemSelector = () => {
      displayRailSystemSelector.value = false
      emit('close')
    }
    const showRailSystemSelector = () => {
      displayRailSystemSelector.value = true
      loading.value = true
      store.dispatch('railsystem/getRailSystems').then(r => {
        loading.value = false
        searchResults.value = r
      })
    }
    return {
      showRailSystemSelector,
      displayRailSystemSelector,
      handleCloseRailSystemSelector,
      text,
      emit,
      loading,
      searchResults,
    }
  }
})


</script>

<style scoped>
.rail-system-wrapper {
  margin-top: 5px;
  font-size: 16px;
  color: var(--q-primary);
  font-weight: bold;
  border-bottom: 1px solid #dcdcdc;
}
</style>
