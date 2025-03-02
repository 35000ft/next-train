<template>
    <q-header>
        <q-toolbar>
            <q-toolbar-title>Next Train</q-toolbar-title>
        </q-toolbar>
    </q-header>
    <q-page-container>
        <div class="station-input-wrapper">
            <div @click="handleSetDepartStation">
                <div class="local-lang-station-name" style="margin-bottom: 10px;" v-if="departStation">
                    {{ departStation.name }}
                </div>
                <div style="margin-bottom: 10px;font-size: 28px;text-align: center;" v-else>
                    {{ t('pleaseSelectDepStation') }}
                </div>
                <div class="sec-lang-station-name" v-if="departStation">{{ departStation.enName }}</div>
            </div>

            <div class="via-wrapper">
                    <span @click="exchangeDepArr" class="exchange-icon-wrapper">
                        <i class="fa fa-exchange fa-rotate-90"></i>
                    </span>
                <div class="via-station-list">
                    <div class="via-station-wrapper" v-for="(viaStation,index) in via" :key="index">
                        {{ viaStation.name }}
                        <span @click="handleDelVia(viaStation)" class="close">
                                <i class="fa fa-close"></i>
                            </span>
                    </div>
                    <div class="via-station-wrapper" v-show="via.length<5">
                        <span @click="handleAddVia" class="add-via-station">+ {{ t('via') }}</span>
                    </div>
                </div>
            </div>

            <div @click="handleSetArrivalStation">
                <div class="local-lang-station-name" style="margin-bottom: 10px;" v-if="arrivalStation">
                    {{ arrivalStation.name }}
                </div>
                <div style="margin-bottom: 10px;font-size: 28px;text-align: center;" v-else>
                    {{ t('pleaseSelectArrStation') }}
                </div>
                <div class="sec-lang-station-name" v-if="arrivalStation"> {{ arrivalStation.enName }}</div>
            </div>

            <div class="depart-time-wrapper" style="margin-top: 20px;">
                    <span @click="showDepTimeSelector"
                          class="depart-time">
                      {{ depTimeStr }}
                    </span>
                {{ t('depart') }}
            </div>

            <div class="go-wrapper" style="margin-top: 30px;">
                <div @click="handleGo" class="go-btn-wrapper">
                    Go!
                </div>
            </div>
        </div>
    </q-page-container>
    <station-selector ref="stationSelector" @select="handleSelectStation"/>
    <depart-time-selector ref="departTimeSelector" @select="handleSelectDepTime"/>
</template>

<script setup>
import {useI18n} from "vue-i18n";
import {computed, onMounted, ref} from "vue";
import StationSelector from "components/StationSelector.vue";
import {useStore} from "vuex";
import DepartTimeSelector from "components/DepartTimeSelector.vue";
import dayjs from "dayjs";
import {useQuasar} from "quasar";
import {getNowByTimezone} from "src/utils/time-utils";
import {useRoute, useRouter} from "vue-router";
import {arr2Map} from "src/utils/array-utils";
import {isNumber} from "src/utils/string-utils";

defineOptions({
    name: 'MetroGoView'
})
const depTimeStr = computed(() => {
    if (depTime.value) {
        if (depTime.value.isSame(dayjs(), 'day')) {
            return depTime.value.format('HH:mm')
        } else {
            return '次日 ' + depTime.value.format('HH:mm')
        }
    } else {
        return t('now')
    }
})
const loading = ref(false)
const depTime = ref(null)
const departTimeSelector = ref(null)
const departStation = ref(null)
const arrivalStation = ref(null)
const store = useStore()
onMounted(() => {
    init()
})
const route = useRoute()

const getConfigFromUrl = () => {
    const params = route.query
    if (isNumber(params.fromMainId) && isNumber(params.toMainId)) {
        const _config = {}
        _config.from = params.fromMainId
        _config.to = params.toMainId
        let depTime = dayjs(params.depTime)
        if (!depTime.isValid()) {
            depTime = dayjs()
        }
        _config.depTime = depTime
        const isValidViaIds = /^(\d+)(,\d+)*$/.test(_config.viaIds);
        if (isValidViaIds) {
            _config.viaIds = _config.viaIds.split(',')
        } else {
            _config.viaIds = []
        }
        return _config
    } else {
        return null
    }
}

const init = () => {
    let fromUrl = false
    store.dispatch('application/getMetroGoViewConfig').then(config => {
        const _config = getConfigFromUrl()
        if (_config) {
            config = _config
            fromUrl = true
        }
        const promises = []
        const {from, to} = config
        if (from) {
            const _p = store.dispatch('railsystem/getStation', {stationId: from}).then(fromStation => {
                loading.value = true
                departStation.value = fromStation
            })
            promises.push(_p)
        }
        if (to) {
            const _p = store.dispatch('railsystem/getStation', {stationId: to}).then(toStation => {
                loading.value = true
                arrivalStation.value = toStation
            })
            promises.push(_p)
        }
        if (config.depTime) {
            const _depTime = dayjs(config.depTime)
            // 判断是否是今天或明天的任意时间
            if (_depTime.isSame(dayjs(), 'day') || _depTime.isSame(dayjs().add(1, 'day'), 'day')) {
                depTime.value = _depTime
            } else {
                depTime.value = dayjs(dayjs().format('YYYY-MM-DD') + ' ' + _depTime.format('HH:mm:ss'));
            }
        }
        if (config.viaIds && config.viaIds.length > 0) {
            const _p = store.dispatch('railsystem/getStationByIds', {stationIds: config.viaIds}).then(stations => {
                loading.value = true
                const stationMap = arr2Map(stations, 'id')
                via.value = config.viaIds.map(it => stationMap.get(it)).filter(it => it !== undefined)
            })
            promises.push(_p)
        }

        if (fromUrl) {
            Promise.all(promises).then(_ => {
                loading.value = false
                handleGo()
            })
        }
    })
}
const saveConfig = () => {
    const config = {
        from: (departStation.value && departStation.value.id) || null,
        to: (arrivalStation.value && arrivalStation.value.id) || null,
        depTime: (depTime.value && depTime.value.format()) || null,
        viaIds: via.value.map(it => it.id)
    }
    store.commit('application/SET_METRO_GO_CONFIG', config)
}
const showDepTimeSelector = () => {
    departTimeSelector.value.showSelector()
}
const handleSelectDepTime = (_depTime, nowGo) => {
    depTime.value = _depTime
    if (nowGo) {
        setTimeout(() => {
            handleGo()
        }, 10)
    }
}
const stationSelector = ref(null)
const via = ref([])
const exchangeDepArr = () => {
    if (!arrivalStation.value) {
        return
    }
    const temp = departStation.value
    departStation.value = arrivalStation.value
    arrivalStation.value = temp
}
const handleAddVia = () => {
    stationSelector.value.showSelector('addVia')
}
const handleSetDepartStation = () => {
    stationSelector.value.showSelector('setDepartStation')
}
const handleSetArrivalStation = () => {
    stationSelector.value.showSelector('setArrivalStation')
}
const handleSelectStation = async (stationId, lineId, event) => {
    const station = await store.dispatch('railsystem/getStation', {stationId})
    if (!station) return
    switch (event) {
        case 'addVia': {
            if (via.value.findIndex(it => it.id === station.id) === -1) {
                via.value.push(station)
            }
            break
        }
        case 'setDepartStation': {
            departStation.value = station
            break
        }
        case 'setArrivalStation': {
            arrivalStation.value = station
            break
        }
    }
    saveConfig()
}
const handleDelVia = (viaStation) => {
    if (via.value && viaStation) {
        const index = via.value.findIndex(it => it.id === viaStation.id)
        via.value.splice(index, 1)
        saveConfig()
    }
}
const router = useRouter()
const $q = useQuasar()
const handleGo = () => {
    if (!departStation.value || !arrivalStation.value) {
        $q.notify.info('请先选择出发车站和到达车站')
        return
    }
    const {timezone, railsystemCode} = departStation.value
    const _depTime = depTime.value || getNowByTimezone(timezone)
    const fromMainId = departStation.value.id
    const toMainId = arrivalStation.value.id
    const viaIds = via.value.map(it => it.id).join(',')
    const params = {
        fromMainId,
        toMainId,
        viaIds,
        depTime: _depTime.format(),
        sId: route.query.sId || null,
    }
    saveConfig()
    router.push({name: 'route-solution-overview', query: params})
    store.commit('application/SHOW_SOLUTION_OVERVIEW', params)
    store.dispatch('application/pushOverlay', {
        component: {componentName: "RouteSolutionOverview"}
    })
}
const {t} = useI18n()
const props = defineProps({})
</script>

<style scoped>
.station-input-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.local-lang-station-name {
    font-size: 40px;
    color: var(--q-primary-d);
    text-align: center;
    font-weight: bold;
    line-height: 1;
    font-family: "Helvetica Neue", Helvetica, "Lucida Grande", Arial, "Hiragino Sans GB", "Microsoft Yahei", "WenQuanYi Micro Hei", sans-serif;
}

.sec-lang-station-name {
    font-size: 24px;
    color: var(--q-grey-3);
    text-align: center;
    font-weight: bold;
    line-height: 1;
    font-family: "Helvetica Neue", Helvetica, "Lucida Grande", Arial, "Hiragino Sans GB", "Microsoft Yahei", "WenQuanYi Micro Hei", sans-serif;
}

.via-wrapper {
    margin-top: 20px;
    margin-bottom: 20px;
    min-height: 100px;
    max-height: 200px;
    overflow-y: auto;
    display: flex;
    align-items: center;
    padding-left: 5%;
    padding-right: 5%;
}

.exchange-icon-wrapper {
    width: 50px;
    height: 50px;
    position: absolute;
    z-index: 5;
    left: 5%;
    flex-shrink: 0;
    font-size: 30px;
    text-align: center;
    border-radius: 100%;
    color: var(--q-primary);
    background-color: var(--q-grey-2);
    transition: .3s;
}

.exchange-icon-wrapper:active {
    background-color: var(--q-background-grey-2);
}

.via-station-wrapper {
    margin: auto;
    height: 30px;
    font-size: 18px;
    text-align: center;
    line-height: 30px;
    font-weight: bold;
    display: block;
}

.add-via-station {
    padding-left: 10px;
    padding-right: 10px;
    border-radius: 10px;
    display: inline-block;
    color: #9b9b9b;
    transition: .3s;
    user-select: none;
}

.add-via-station:active {
    background-color: var(--q-grey-2);
}

.go-btn-wrapper {
    margin: auto;
    height: 80px;
    width: 80px;
    text-align: center;
    line-height: 80px;
    color: white;
    font-weight: bold;
    font-size: 40px;
    border-radius: 100%;
    background-color: var(--q-primary);
    transition: .2s;
    user-select: none;
}

.go-btn-wrapper:active {
    background-color: var(--q-secondary);
}

.via-station-wrapper {
    margin: auto;
    height: 30px;
    font-size: 18px;
    text-align: center;
    line-height: 30px;
    font-weight: bold;
    display: block;
    color: var(--q-primary-d);
}

.via-station-wrapper .close {
    position: absolute;
    right: 10%;
}

.depart-time-wrapper {
    text-align: center;
    font-size: 18px;
    font-weight: bold;
    color: var(--q-grey);
}

.depart-time {
    color: var(--q-primary-d);
}

</style>
