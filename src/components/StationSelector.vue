<template>
    <bottom-modal content-height="40vh" :display="displaySelector" @close="handleCloseSelector"
                  @touchstart.stop name="station-selector">
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
                            <div class="col-6 auto-scroll-container"
                                 @click="handleSelect(station)">
                                <div class="station-name" v-overflow-auto-scroll>
                                    <span v-if="station.highlighted" v-html="station.highlighted"></span>
                                    <span v-else>{{ station.name }}</span>
                                    <span class="pill" v-show="currentRailSystem.code!==station.railsystemCode">
                                        {{ station.railsystemName }}
                                    </span>
                                    <span v-if="station.isFavourite">
                                        <q-icon style="color:var(--q-favourite)" name="star"/>
                                    </span>
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
                        <div class="row station-result-wrapper" v-for="(station,index) in searchResults" :key="index">
                            <div class="col-6" style="overflow:hidden;white-space: nowrap; position: relative;"
                                 @click="handleSelect(station)">
                                <div v-overflow-auto-scroll>
                                    <span v-if="station.highlighted" v-html="station.highlighted"></span>
                                    <span v-else>{{ station.name }}</span>
                                    <span class="pill" v-show="currentRailSystem.code!==station.railsystemCode">
                                        {{ station.railsystemName }}
                                    </span>
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
                        <q-skeleton style="height: 80px;width: 100%;" type="text" v-show="!line.stations"/>
                        <q-skeleton style="height: 80px;width: 100%;" type="text" v-show="!line.stations"/>
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
        const historyStations = computed(() => store.getters["preference/historyStations"].slice(0, 12))

        function init() {
            console.log('StationSelector init...')
            loading.value = true
            store.dispatch('railsystem/getRailSystemLines').then(r => {
                lines.value = r
                searchGroups.value = [ALL_STR, ...r.map(it => it.name)]
                loading.value = false
            }).catch(err => {
                console.warn('load lines error', err)
                $q.notify.warn('Load lines error')
            })
        }

        async function loadStations(lineId) {
            if (lineId === ALL_STR) {
                const _result = await store.dispatch('railsystem/getAllStations')
                loadFavouriteStations().then(_ => {
                    console.log('load favourite stations ok')
                })
                return _result
            } else if (isNumber(lineId)) {
                return await store.dispatch('railsystem/getStationsByLine', {lineId})
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

        const handleSearch = _.debounce(keyword => {
            let lineId
            if (currentSearchGroup.value === ALL_STR) {
                lineId = ALL_STR
            } else {
                const line = lines.value.find(it => it.name === currentSearchGroup.value)
                if (line) {
                    lineId = line.id
                }
            }
            loadStations(lineId).then(r => {
                searchResults.value = filterResult(r, keyword)
            })
        }, 300)

        const filterResult = (r, _keyword) => {
            if (typeof _keyword === "string") {
                _keyword = _keyword.toString().replace(' ', '')
                console.log('keyword', _keyword)
                if (_keyword.length === 0 || r.length === 0) {
                    return r
                }
                const names = r.map(it => it.name)
                let matchResults = []
                if (isAlphabet(_keyword) && _keyword.length <= 4) {
                    matchResults = matchResults.concat(...findByAbbr(_keyword, names))
                } else {
                    matchResults = matchResults.concat(...findMatches(_keyword, names))
                }

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
            if (!searchGroup) {
                return
            }
            loading.value = true
            let lineId;
            if (searchGroup === ALL_STR) {
                lineId = ALL_STR
            } else {
                const line = lines.value.find(it => it.name === searchGroup);
                if (!line) {
                    return
                }
                lineId = line.id
            }
            loadStations(lineId).then(r => {
                if (r && r instanceof Array) {
                    if (keyword.value && keyword.value.length > 0) {
                        searchResults.value = filterResult(r, keyword.value)
                    } else {
                        searchResults.value = r
                    }
                }
                loading.value = false
            })
        }

        async function loadFavouriteStations() {
            store.dispatch('preference/getAllFavouriteStations').then(favouriteStations => {
                searchResults.value.forEach(it => {
                    if (favouriteStations.has(it.id)) {
                        it.isFavourite = true
                    }
                })
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
            store.commit('railsystem/SET_STATION', {station})
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
            currentRailSystem,
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

.station-result-wrapper, .station-name > span {
    margin-right: 3px;
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
    margin-right: 4px;
    white-space: nowrap;
}
</style>
