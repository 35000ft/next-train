<template>
    <q-popup-proxy @before-hide="handleOnHide">
        <q-banner style="width: 90%;">
            <div
                style="font-size: 20px;font-weight:bold;text-align: center;height: 30px;padding-top: 10px;color: var(--q-primary-d);margin-bottom: 10px;">
                日票小工具
            </div>
            <div style="min-height: 100px; max-height: 50vh; overflow-y: auto">
                <div class="row">
                    <span class="col-3">出发车站:</span>
                    <span class="col-6" style="color: var(--q-primary)" @click="showStationSelector">
                        {{ (selectedStation && selectedStation.name) || '请选择车站' }}
                    </span>
                    <span class="col-3" style="text-align: right; color: var(--q-primary);"
                          v-show="oneDayTicketData.length>0" @click="handleRefresh">
                        换一批 <q-icon name="refresh"></q-icon>
                    </span>
                </div>
                <div style="margin-bottom: 10px;">
                    <div>
                        <span>一日票怎么薅：</span>
                        <div style="padding-left: 20px;">
                            <div v-for="(d,index) in oneDayTicketData" :key="index">
                                <span>{{ d.price }}元:</span>
                                <span>
                                    <span v-for="(s,index) in d.station_names" :key="index">
                                        <span style="color: var(--q-primary)" @click="handleClickDestStationName(s)">
                                            {{ s }}
                                        </span>{{ index < d.station_names.length - 1 ? ", " : "" }}
                                    </span>
                                </span>
                            </div>
                            <div v-if="oneDayTicketData.length===0">
                                请先选择车站
                            </div>
                        </div>
                    </div>
                    <div>
                        <span>三日票怎么薅：</span>
                        <div style="padding-left: 20px;">
                            <div v-for="(d,index) in threeDayTicketData" :key="index">
                                <span>{{ d.price }}元:</span>
                                <span v-for="(s,index) in d.station_names" :key="index">
                                        <span style="color: var(--q-primary)" @click="handleClickDestStationName(s)">
                                            {{ s }}
                                        </span>{{ index < d.station_names.length - 1 ? ", " : "" }}
                                </span>
                            </div>
                            <div v-if="threeDayTicketData.length===0">
                                请先选择车站
                            </div>
                        </div>
                    </div>
                </div>
                <div style="font-size: 12px;">* 一日票售价20元, 三日票售价45元</div>
                <div style="font-size: 12px;">* 点击车站，即刻出发！</div>
            </div>
        </q-banner>
        <station-selector ref="stationSelector" @select="handleSelectStation"/>
    </q-popup-proxy>

</template>
<script setup>
import {ref} from "vue";
import StationSelector from "components/StationSelector.vue";
import {queryDailyTicket} from "src/apis/metro-utils";
import {useStore} from "vuex";
import {useThrottled} from "src/utils/common_utils";
import {useQuasar} from "quasar";

const emit = defineEmits(['onShow', 'close', 'go'])
const selectedStation = ref()
const stationSelector = ref(null)
const oneDayTicketData = ref([])
const threeDayTicketData = ref([])
const store = useStore()
const handleOnHide = () => {
    emit('close')
}
const $q = useQuasar()
const showStationSelector = () => {
    stationSelector.value.showSelector()
}
const handleClickDestStationName = (stationName) => {
    store.dispatch('railsystem/queryStationByName', {stationName: stationName}).then(toStation => {
        emit('go', {fromStation: selectedStation.value, toStation: toStation})
    }).catch(e => {
        console.warn(e)
    })
}
const getDailyTicket = (station) => {
    queryDailyTicket({station_name: station.name, railsystem: station.railsystemCode}).then(data => {
        oneDayTicketData.value = data.one_day || []
        threeDayTicketData.value = data.three_day || []
    })
}
const handleSelectStation = ({station}) => {
    if (station) {
        selectedStation.value = station
        getDailyTicket(station)
    }
}
const handleRefresh = useThrottled(() => {
    if (selectedStation.value) {
        getDailyTicket(selectedStation.value)
    }
}, () => {
    $q.notify.info("请不要过快点击")
})
</script>

<style scoped>

</style>
