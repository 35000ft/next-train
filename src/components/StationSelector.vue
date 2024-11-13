<template>
  <bottom-modal content-height="40vh" :display="displaySelector" @close="handleCloseSelector"
                @touchstart.stop>
    <template v-slot:default>
      <div>
        <q-input outlined rounded v-model="keyword" label="车站名 | 车站代码" :bg-color="isDark?'grey-10':'grey-2'"/>
      </div>
      <div class="row" style="overflow-y: auto;">

        <div style="height: 10px;width: 100%;"></div>

        <q-tabs v-model="currentSearchGroup"
                class="text-grey-8"
                active-color="primary"
                style="color: var(--q-primary);overflow-x: auto;white-space: nowrap;display: block;">
          <q-tab :name="searchGroup" :label="searchGroup" v-for="searchGroup in searchGroups" :key="searchGroup"/>
        </q-tabs>
        <q-tab-panels v-model="currentSearchGroup" animated swipeable infinite style="width: 100%;">
          <q-tab-panel :name="ALL_STR">
            <q-skeleton style="height: 80px;width: 100%;" type="text" v-show="loading"/>
            <q-skeleton style="height: 80px;width: 100%;" type="text" v-show="loading"/>
            <div class="row station-result-wrapper" v-for="(station,index) in searchResults" :key="index"
                 @click="handleSelect(station)">
              <div class="col-6">{{ station.name }} <span class="pill">{{ station.code }}</span></div>
              <div class="col-6" style="text-align: right;">{{ station.name }}</div>
            </div>
          </q-tab-panel>
          <q-tab-panel :name="line.name" :key="line.id" v-for="line in lines">
            <q-skeleton style="height: 80px;width: 100%;" type="text" v-show="!line.stations"/>
            <q-skeleton style="height: 80px;width: 100%;" type="text" v-show="!line.stations"/>
            <div class="row station-result-wrapper" v-for="(station,index) in line.stations" :key="index"
                 @click="handleSelect(station)">
              <div class="col-6">{{ station.name }} <span class="pill" v-if="station.code">{{ station.code }}</span>
              </div>
              <div class="col-6" style="text-align: right;">{{ station.name }}</div>
            </div>
          </q-tab-panel>
        </q-tab-panels>

      </div>
    </template>
  </bottom-modal>
</template>

<script>
import BottomModal from "components/BottomModal.vue";
import {computed, defineComponent, onMounted, ref, toRaw, watch} from "vue";
import {useStore} from "vuex";
import {useQuasar} from "quasar";
import {useI18n} from "vue-i18n";

export default defineComponent({
  components: {BottomModal},
  setup(_, {emit}) {
    const displaySelector = ref(false)
    const keyword = ref('')
    const {t} = useI18n()
    const loading = ref(true)
    const currentRailSystem = computed(() => store.state.railsystem.currentRailSystem)
    const ALL_STR = t('all')
    const currentSearchGroup = ref(ALL_STR)
    const searchGroups = ref([ALL_STR])
    const store = useStore()
    const searchResults = ref([])
    const lines = ref([])
    const $q = useQuasar()
    const isDark = computed(() => $q.dark.isActive)

    function init() {
      console.log('station selector init...')
      loading.value = true
      store.dispatch('railsystem/getRailSystemLines').then(r => {
        lines.value = r
        console.log('lines', r)
        searchGroups.value = [ALL_STR, ...r.map(it => it.name)]
        loading.value = false
      }).catch(err => {
        $q.notify.warn('load lines error')
      })
    }

    async function loadStations(lineId) {
      return await store.dispatch('railsystem/getStationsByLine', lineId)
    }

    //监听当前线网变化 发现切换立即重新加载一次线路
    watch(currentRailSystem, (newVal, oldValue) => {
      init()
    },)
    watch(currentSearchGroup, (newVal, oldValue) => {
      handleChangeSearchGroup(newVal)
    })

    onMounted(() => {
      init()
    })

    let currentStation = toRaw(store.getters['railsystem/currentStation'])
    const handleCloseSelector = () => {
      displaySelector.value = false
      emit('close')
    }

    const handleChangeSearchGroup = (searchGroup) => {
      console.log('search group change', searchGroup)
      if (!searchGroup || searchGroup === ALL_STR) {
        return
      }
      const line = lines.value.find(it => it.name === searchGroup);
      if (!line) {
        return
      }
      loadStations(line.id).then(r => {
        console.log('stations:', r)
        if (r && r instanceof Array) {
          line.stations = r
        }
      })
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
      displaySelector,
      handleCloseSelector,
      handleSelect,
      keyword,
      emit,
      ALL_STR,
      loading,
      isDark,
      searchResults,
      currentSearchGroup,
      lines,
      searchGroups,
      handleChangeSearchGroup,
    }
  }
})


</script>

<style scoped>
.station-result-wrapper {
  padding: 5px;
  font-size: 16px;
  transition: .3s;
  background-color: transparent;
  border-bottom: 1px solid #dcdcdc;
  width: 100%;
}

.station-result-wrapper .pill {
  background-color: var(--q-primary);
  border-radius: 5px;
  color: #ffffff;
  padding: 1px 5px;
}

.station-result-wrapper:active {
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
