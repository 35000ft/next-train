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
import {useRouter} from "vue-router";

defineOptions({
    name: 'MetroGoView'
})
const depTimeStr = computed(() => {
    if (depTime.value) {
        return depTime.value.format('HH:mm')
    } else {
        return t('now')
    }
})
const depTime = ref(null)
const departTimeSelector = ref(null)
const departStation = ref(null)
const arrivalStation = ref(null)
const store = useStore()
onMounted(() => {
    init()
})

const init = () => {
    store.dispatch('application/getMetroGoViewConfig').then(config => {
        const {from, to} = config
        if (from) {
            store.dispatch('railsystem/getStation', {stationId: from}).then(fromStation => {
                departStation.value = fromStation
            })
        }
        if (to) {
            store.dispatch('railsystem/getStation', {stationId: to}).then(toStation => {
                arrivalStation.value = toStation
            })
        }
        if (config.depTime) {
            depTime.value = dayjs(config.depTime)
        }
    })
}
const saveConfig = () => {
    const config = {
        from: (departStation.value && departStation.value.id) || null,
        to: (arrivalStation.value && arrivalStation.value.id) || null,
        depTime: (depTime.value && depTime.value.format()) || null
    }
    store.commit('application/SET_METRO_GO_CONFIG', config)
}
const showDepTimeSelector = () => {
    departTimeSelector.value.showSelector()
}
const handleSelectDepTime = (_depTime, nowGo) => {
    depTime.value = _depTime
    if (nowGo) {
        handleGo()
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
        depTime: _depTime.format()
    }
    router.push({name: 'route-solution-overview', query: params})
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
