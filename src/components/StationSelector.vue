<template>
  <bottom-modal :display="displayRailSystemSelector" @close="handleCloseRailSystemSelector">
    <template v-slot:default>
      <div>
        <q-input outlined rounded v-model="text" label="车站名 | 车站代码" :bg-color="'grey-2'"/>
      </div>
      <div class="row" style="overflow-y: auto;">
        <q-skeleton style="height: 80px;width: 100%;" type="text" v-show="loading"/>
        <q-skeleton style="height: 80px;width: 100%;" type="text" v-show="loading"/>
        <div style="height: 10px;width: 100%;"></div>

        <q-tabs v-model="currentSearchGroup"
                style="color: var(--q-primary);overflow-x: auto;white-space: nowrap;display: block;">
          <q-tab :name="searchGroup" :label="searchGroup" v-for="searchGroup in searchGroups" :key="searchGroup"/>
        </q-tabs>
        <q-tab-panels v-model="currentSearchGroup" @touchstart.stop animated swipeable style="width: 100%;">
          <q-tab-panel name="全部">
            <div class="row rail-system-wrapper" v-for="(station,index) in searchResults" :key="index"
                 @click="handleSelectRailSystem(station)">
              <div class="col-6">{{ station.fullname }}</div>
              <div class="col-2"></div>
              <div class="col-4" style="text-align: right;">{{ station.name }}</div>
            </div>
          </q-tab-panel>
        </q-tab-panels>

      </div>
    </template>
  </bottom-modal>
</template>

<script>
import BottomModal from "components/BottomModal.vue";
import {defineComponent, onMounted, ref, toRaw} from "vue";
import {useStore} from "vuex";
import {useQuasar} from "quasar";
import {useI18n} from "vue-i18n";

export default defineComponent({
  components: {BottomModal},
  setup(_, {emit}) {
    const displaySelector = ref(false)
    const text = ref('')
    const {t} = useI18n()
    const loading = ref(true)
    const ALL_STR = t('all')
    const currentSearchGroup = ref(ALL_STR)
    const searchGroups = ref([ALL_STR])
    const store = useStore()
    const searchResults = ref([])
    const lines = ref([])
    const $q = useQuasar()

    function init() {
      store.dispatch('railsystem/getRailSystemLines').then(r => {
        loading.value = false
        lines.value = r
      }).catch(err => {
        $q.notify({type: 'warning', message: 'load lines error'})
      })

    }

    onMounted(() => {
      init()
    })

    let currentStation = toRaw(store.getters['railsystem/currentStation'])
    const handleCloseSelector = () => {
      displaySelector.value = false
      emit('close')
    }
    const handleSelect = (railsystem) => {
      railsystem = toRaw(railsystem)
      if (railsystem.code === currentStation.code) {
        return
      }
      emit('select', railsystem)
      currentStation = railsystem
      displaySelector.value = false
    }
    const showSelector = () => {
      displaySelector.value = true
      loading.value = true
      store.dispatch('railsystem/getRailSystemLines').then(r => {
        loading.value = false
        searchResults.value = r
      })
    }
    return {
      showSelector,
      displayRailSystemSelector: displaySelector,
      handleCloseRailSystemSelector: handleCloseSelector,
      handleSelectRailSystem: handleSelect,
      text,
      emit,
      loading,
      searchResults,
      currentSearchGroup,
      searchGroups,
    }
  }
})


</script>

<style scoped>
.rail-system-wrapper {
  padding: 5px;
  font-size: 16px;
  color: #3a3a3a;
  transition: .3s;
  background-color: transparent;
  border-bottom: 1px solid #dcdcdc;
  width: 100%;
}

.rail-system-wrapper:active {
  color: var(--q-primary);
  background-color: #dcdcdc;
  font-weight: bold;
  align-items: center;
  font-size: 18px;
}

.q-tab, .q-tab__content {
  min-height: 20px;
}

.q-tab-panel {
  padding: 0;
}
</style>
