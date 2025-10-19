<template>
    <bottom-modal content-height="60vh" :display="displaySelector" @close="handleCloseSelector"
                  @touchstart.stop name="line-selector">
        <template v-slot:default>
            <div class="column full-height full-width">
                <div style="margin-bottom: 10px;" class="full-width">
                    <q-input outlined rounded v-model="keyword" label="线路名 | 线路代码"
                             @update:model-value="handleSearch"
                             @keydown.enter="handleEnter"
                             :bg-color="isDark?'grey-10':'grey-2'"/>
                </div>
                <div class="row col full-width">
                    <q-tabs v-model="currentSearchGroup"
                            class="text-grey-8"
                            active-color="primary"
                            style="color: var(--q-primary);overflow-x: auto;white-space: nowrap;display: block;">
                        <q-tab :name="searchGroup" :label="searchGroup" v-for="searchGroup in searchGroups"
                               :key="searchGroup"/>
                    </q-tabs>
                    <q-tab-panels v-model="currentSearchGroup" animated swipeable infinite
                                  style="width: 100%;height: 80%;">
                        <q-tab-panel :name="ALL_STR">
                            <q-skeleton style="height: 80px;width: 100%;" type="text" v-show="loading"/>
                            <q-skeleton style="height: 80px;width: 100%;" type="text" v-show="loading"/>
                            <div class="row station-result-wrapper" v-for="(line,index) in searchResults"
                                 :class="selectedStationIds.has(line?.id)?'selected-station':'unselected-station'"
                                 :key="index">
                                <div class="col-8 auto-scroll-container"
                                     @click="handleSelect(line)">
                                    <div class="station-name" v-overflow-auto-scroll>
                                        <span v-if="line.highlighted" v-html="line.highlighted"></span>
                                        <span v-else>{{ line.name }}</span>
                                    </div>

                                </div>
                                <div class="col-4"
                                     style="text-align: right;overflow:hidden;white-space: nowrap; position: relative;">
                                    <LineIcon :line="line"
                                              :font-size="'13px'"
                                              style="margin-right: 4px;"
                                              :disabled="false"
                                              @click="handleSelect(line)"/>
                                </div>
                            </div>
                        </q-tab-panel>
                    </q-tab-panels>
                    <div v-show="selectedStationIds.size>0"
                         style="display: flex;justify-content: center; gap: 10px;" class="full-width">
                        <q-btn color="green" @click.stop="confirmSelected">确认</q-btn>
                        <q-btn color="red" @click.stop="handleCleanSelected">清空</q-btn>
                    </div>
                </div>
            </div>
        </template>
    </bottom-modal>
</template>

<script>
import BottomModal from "components/common/BottomModal.vue";
import {computed, defineComponent, ref, watch} from "vue";
import {useStore} from "vuex";
import {useQuasar} from "quasar";
import {useI18n} from "vue-i18n";
import {findByAbbr, findMatches, isAlphabet, toHighlighted} from "src/utils/string-utils";
import _ from 'lodash';
import LineIcon from "components/LineIcon.vue";
import {fetchLineDropdown} from "src/apis/railsystem";

export default defineComponent({
    components: {LineIcon, BottomModal},
    props: {
        railsystemCode: {
            type: String,
            default: null,
        },
        multiple: {
            type: Boolean,
            default: false,
        }
    },
    setup(props, {emit}) {
        let event = null
        const display = ref(false)
        const keyword = ref('')
        const {t} = useI18n()
        const loading = ref(true)
        const loadStationPromise = ref(null)
        const ALL_STR = t('all')
        const currentSearchGroup = ref(ALL_STR)
        const searchGroups = ref([ALL_STR])
        const store = useStore()
        const searchResults = ref([])
        const lines = ref([])
        const $q = useQuasar()
        const isDark = computed(() => $q.dark.isActive)
        const selectedStations = ref([])
        const selectedStationIds = computed(() => {
            return new Set(selectedStations.value.map(it => it.id))
        })

        async function init() {
            searchGroups.value = [ALL_STR]
            handleSearch('')
        }

        watch(currentSearchGroup, (newVal, oldValue) => {
            handleChangeSearchGroup(newVal)
        })
        watch(display, (newVal, oldVal) => {
            if (newVal) {
                init(props?.railsystemCode)
            }
        })

        const handleSearch = _.debounce(async _keyword => {
            searchResults.value = []
            loading.value = true
            try {
                const temp = await fetchLineDropdown({
                    name: _keyword,
                    railsystemCode: props?.railsystemCode,
                })
                searchResults.value = temp
                return {stations: temp, keyword: _keyword}
            } catch (e) {
                console.warn('Search line error!', e)
            } finally {
                loading.value = false
            }
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

        // TODO
        const handleChangeSearchGroup = (searchGroup) => {
        }

        const handleSelect = (station, line) => {
            if (!station?.id) {
                return
            }
            const lineId = line ? line.id : null
            if (props.multiple) {
                if (selectedStationIds.value.has(station.id)) {
                    const index = selectedStations.value.findIndex(it => it.id === station.id)
                    if (index !== -1) {
                        selectedStations.value.splice(index, 1)
                    }
                } else {
                    selectedStations.value.push(station)
                }
            } else {
                store.dispatch('preference/addHistoryStation', station)
                emit('select', {stationId: station.id, lineId, event, station})
                display.value = false

            }
        }

        function handleCleanSelected() {
            selectedStations.value = []
        }

        function confirmSelected() {
            emit('select', [...selectedStations.value])
            selectedStations.value = []
            display.value = false
        }

        const handleEnter = () => {
            const p = loadStationPromise.value
            if (p) {
                const curKeyword = keyword.value
                p.then(({stations, keyword}) => {
                    if (curKeyword !== keyword) {
                        setTimeout(handleEnter, 100)
                        return
                    }
                    if (stations && stations.length > 0) {
                        handleSelect(stations[0], null)
                    }
                })
                loadStationPromise.value = null
            } else {
                setTimeout(handleEnter, 200)
            }
        }

        const show = (_event) => {
            display.value = true
            if (_event) {
                event = _event
            }
        }
        return {
            show,
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
            handleSearch,
            selectedStationIds,
            handleEnter,
            handleCleanSelected,
            confirmSelected,
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
    margin-left: 3px;
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
    margin-left: 3px;
    color: var(--q-grey);
    padding: 1px 5px;
    margin-right: 4px;
    white-space: nowrap;
}

.selected-station {
    background-color: rgba(68, 133, 200, 0.5);
}

</style>
