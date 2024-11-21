<template>
    <bottom-modal content-height="40vh" :display="displaySelector" @close="handleCloseSelector"
                  @touchstart.stop name="stationSelector">
        <template v-slot:default>
            <div>
                <q-input outlined rounded v-model="keyword" label="车站名 | 车站代码" @update:model-value="handleSearch"
                         :bg-color="isDark?'grey-10':'grey-2'"/>
            </div>
            <div class="row" style="overflow-y: auto;">

                <div style="height: 10px;width: 100%;"></div>

                <q-tabs v-model="currentSearchGroup"
                        class="text-grey-8"
                        active-color="primary"
                        style="color: var(--q-primary);overflow-x: auto;white-space: nowrap;display: block;">
                    <q-tab :name="searchGroup" :label="searchGroup" v-for="searchGroup in searchGroups"
                           :key="searchGroup"/>
                </q-tabs>
                <q-tab-panels v-model="currentSearchGroup" animated swipeable infinite style="width: 100%;">
                    <q-tab-panel :name="ALL_STR">
                        <q-skeleton style="height: 80px;width: 100%;" type="text" v-show="loading"/>
                        <q-skeleton style="height: 80px;width: 100%;" type="text" v-show="loading"/>
                        <div class="history-wrapper">
                            <span @click="handleSelect(station)" class="pill" v-for="station in historyStations"
                                  :key="station.id">
                                {{ station.name }}
                            </span>
                        </div>
                        <div class="row station-result-wrapper" v-for="(station,index) in searchResults" :key="index">
                            <div class="col-6" style="overflow:hidden;white-space: nowrap; position: relative;"
                                 @click="handleSelect(station)">
                                <div v-overflow-auto-scroll>
                                    <span v-if="station.highlighted" v-html="station.highlighted"></span>
                                    <span v-if="!station.highlighted">{{ station.name }}</span>
                                    <span class="pill">{{ station.railsystem }}</span>
                                </div>
                            </div>
                            <div class="col-6"
                                 style="text-align: right;overflow:hidden;white-space: nowrap; position: relative;">
                                <div v-overflow-auto-scroll>
                                    <LineIcon v-for="line in station.lines" :key="line.id" :line="line"
                                              :font-size="'13px'"
                                              style="margin-right: 4px;"
                                              :disabled="false"
                                              @click="handleSelect(station,line)"/>
                                </div>
                            </div>
                        </div>
                    </q-tab-panel>
                    <q-tab-panel :name="line.name" :key="line.id" v-for="line in lines">
                        <q-skeleton style="height: 80px;width: 100%;" type="text" v-show="!line.stations"/>
                        <q-skeleton style="height: 80px;width: 100%;" type="text" v-show="!line.stations"/>
                        <div class="row station-result-wrapper" v-for="(station,index) in searchResults" :key="index">
                            <div class="col-6" style="overflow:hidden;white-space: nowrap; position: relative;"
                                 @click="handleSelect(station)">
                                <div v-overflow-auto-scroll>
                                    <span>{{ station.name }}</span>
                                    <span class="pill">{{ station.railsystem }}</span>
                                </div>
                            </div>
                            <div class="col-6"
                                 style="text-align: right;overflow:hidden;white-space: nowrap; position: relative;">
                                <div v-overflow-auto-scroll>
                                    <span v-show="station.lines.filter(it=>it.id!==line.id).length>0"
                                          style="margin-right: 4px;color: var(--q-primary)">
                                        <i class="fa-solid fa-rotate"/>
                                    </span>
                                    <LineIcon v-for="_line in station.lines.filter(it=>it.id!==line.id)" :key="_line.id"
                                              :line="_line"
                                              :font-size="'13px'"
                                              style="margin-right: 4px;"
                                              :disabled="false"
                                              @click="handleSelect(station,_line)"/>
                                </div>
                            </div>
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
import {findByAbbr, findMatches, isAlphabet, isNumber, toHighlighted} from "src/utils/string-utils";
import _ from 'lodash';
import LineIcon from "components/LineIcon.vue";

export default defineComponent({
    components: {LineIcon, BottomModal},
    setup(_0, {emit}) {
        const display = ref(false)
        const keyword = ref('')
        const {t} = useI18n()
        const loading = ref(true)
        const currentRailSystem = computed(() => store.getters["railsystem/currentRailSystem"])
        const currentStation = computed(() => store.getters['preference/currentStation'])
        const ALL_STR = t('all')
        const currentSearchGroup = ref(ALL_STR)
        const searchGroups = ref([ALL_STR])
        const store = useStore()
        const searchResults = ref([])
        const lines = ref([])
        const $q = useQuasar()
        const isDark = computed(() => $q.dark.isActive)
        const historyStations = computed(() => store.getters["preference/historyStations"])

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
            if (lineId === ALL_STR) {
                console.log('Loading all stations of current railsystem')
                return await store.dispatch('railsystem/getAllStations')
            } else if (isNumber(lineId)) {
                return await store.dispatch('railsystem/getStationsByLine', lineId)
            }
            return []
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

        const handleSearch = _.debounce((keyword) => {
            console.log('search:', keyword)
            loadStations(currentSearchGroup.value).then(r => {
                const _results = filterResult(r, keyword)
                searchResults.value = _results
            })
        }, 300)

        const filterResult = (r, _keyword) => {
            if (typeof _keyword === "string") {
                _keyword = _keyword.toString().replace(' ', '')
                if (_keyword.length === 0 || r.length === 0) {
                    return r
                }
                const names = r.map(it => it.name)
                let matchResults = []
                if (isAlphabet(_keyword) && _keyword.length <= 4) {
                    matchResults = matchResults.concat(...findByAbbr(_keyword, names))
                }

                matchResults = matchResults.concat(...findMatches(_keyword, names))
                if (matchResults.length > 0) {
                    const matchResultMap = matchResults.reduce((acc, cur) => {
                        if (acc.has(cur.index)) {
                            const previous = acc.get(cur.index)
                            if (cur.ratio > previous.ratio) {
                                acc.set(cur.index, cur)
                            }
                        } else {
                            acc.set(cur.index, cur)
                        }
                        return acc
                    }, new Map())
                    return r.map((it, index) => {
                        if (!matchResultMap.has(index)) {
                            return null
                        }
                        return toHighlighted(it, matchResultMap.get(index), 'name', 'highlight-text')
                    })
                        .filter(it => it != null)
                        .sort((i1, i2) => i2.ratio - i1.ratio)
                } else {
                    return []
                }
            } else {
                return r
            }
        }

        const handleCloseSelector = () => {
            display.value = false
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
            loading.value = true
            loadStations(line.id).then(r => {
                if (r && r instanceof Array) {
                    searchResults.value = r
                }
                loading.value = false
            })
        }
        const handleSelect = (station, line) => {
            station = toRaw(station)
            if (line) {
                line = toRaw(line)
            }
            if (station.id === currentStation.value.id && !line) {
                return
            }
            store.dispatch('preference/addHistoryStation', station)
            emit('select', station.id, (line && line.id) || null)
            display.value = false
        }

        const showSelector = () => {
            display.value = true
            if (currentSearchGroup.value === ALL_STR) {
                loading.value = true
                loadStations(ALL_STR).then(r => {
                    searchResults.value = r
                    loading.value = false
                })
            }
        }
        return {
            showSelector,
            displaySelector: display,
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
            historyStations,
            handleSearch,
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

.history-wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    padding-top: 4px;
}

.history-wrapper .pill {
    background-color: var(--q-background-grey);
    border-radius: 5px;
    color: var(--q-grey);
    padding: 1px 5px;
    margin-right: 8px;
    white-space: nowrap;
}
</style>
