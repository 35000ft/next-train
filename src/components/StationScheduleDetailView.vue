<template>
    <OverlayView>
        <template v-slot:header-center>
            <div>线路时刻表</div>
        </template>
        <template v-slot:default>
            <div class="toolbar-area-wrapper">
                <div style="width: 50%;">
                    <span class="switch-schedule-format-wrapper">
                        <span class="vertical-icon layout-icon" :class="{'showing-icon':showVertical}">
                            <i class="fa fa-bars"></i>
                        </span>
                         <span class="horizontal-icon layout-icon" :class="{'showing-icon':!showVertical}">
                            <i class="fa fa-bars"></i>
                         </span>
                     </span>
                </div>
                <div style="text-align: right;width: 50%;">
                     <span class="download-icon-wrapper" style="color: var(--q-primary);font-size: 20px;">
                        <i aria-hidden="true" class="fa fa-download"></i>
                    </span>
                </div>
            </div>
            <div class="schedule-header-wrapper">

            </div>
            <div class="schedule-area-wrapper">

            </div>

        </template>
    </OverlayView>
</template>

<script setup>
import OverlayView from "components/OverlayView.vue";
import {onMounted, ref} from "vue";
import {useRoute} from "vue-router";
import {fetchStationSchedule} from "src/apis/reailtime";

const showVertical = ref(false)
const saveAsImg = () => {
    console.log("saving schedule as image")
    const scale = 3
    // const domNode = this.$refs['station-schedule-wrapper']
    // domtoimage.toPng(domNode, {
    //     width: domNode.clientWidth * scale,
    //     height: domNode.clientHeight * scale,
    //     style: {
    //         transform: `scale(${scale})`,
    //         transformOrigin: 'top left'
    //     }
    // })
    //     .then(dataUrl => {
    //         let a = document.createElement('a')
    //         a.href = dataUrl
    //         a.download = `${this.station.name}-${this.line.name}时刻表`
    //         a.click()
    //     })
    //     .catch(error => {
    //         console.error(error)
    //     })
}
const route = useRoute()
onMounted(() => {
    const stationId = route.params.stationId
    const lineId = route.params.lineId
    loadSchedule(stationId, lineId)
})

async function loadSchedule(stationId, lineId) {
    if (!stationId || !lineId) {
        return
    }
    const scheduleData = await fetchStationSchedule(stationId, lineId)
    const rawSchedule = scheduleData.schedules || []
    rawSchedule.map(item => {
        const terminalStations = Object.keys(item).map(it => scheduleData.stationMap[it])
        console.log(terminalStations)
        return {}
    })
    console.log('sc', scheduleData)
}

</script>

<style scoped>
.toolbar-area-wrapper {
    height: 40px;
    padding-left: 10px;
    padding-right: 10px;
    border-bottom: 1px solid var(--q-grey-2);
    display: flex;
    align-items: center;
}

.vertical-icon > i {
    transform: rotate(90deg);
}

.showing-icon {
    background-color: var(--q-primary);
    color: #ffffff;
}

.switch-schedule-format-wrapper {
    height: 20px;
    font-size: 16px;
    width: fit-content;
    border: 1px solid var(--q-primary);
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 5px;
    margin-top: 5px;
    color: #a6a6a6;
}

.layout-icon {
    height: 100%;
    padding-right: 4px;
    padding-left: 4px;
    display: flex;
    align-items: center;
}
</style>
