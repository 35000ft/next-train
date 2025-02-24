<template>
    <q-header>
        <q-toolbar>
            <q-toolbar-title>Next Train</q-toolbar-title>
        </q-toolbar>
    </q-header>

    <q-page-container>
        <!--        <LineRealtimeView :line-id-prop="'51'"/>-->
        <q-card
            style="padding-left: 10px;padding-right: 10px;padding-bottom: 20px; background-color: var(--q-background-grey-2);">
            <q-card-section>
                <div class="text-h5 text-bold text-primary">线路实况</div>
            </q-card-section>
            <div
                style="max-height: 500px;display: flex;justify-content: center; gap: 10px;flex-wrap: wrap;align-items: flex-start;overflow-y: auto;">
                <div class="line-info-wrapper" v-for="line in showLines"
                     @click="handleShowLineRealtime(line)"
                     :key="line.id">
                    <LineIcon :line="line"/>
                    <div>
                        <div
                            class="station-name">{{ line.stations[0].name + '~' + line.stations.slice(-1)[0].name }}
                        </div>
                    </div>

                </div>
            </div>
            <div v-show="showLines.length===0"
                 style="display: flex;justify-content: center; gap:10px;flex-wrap: wrap;">
                <q-skeleton type="text" height="70px" width="160px"></q-skeleton>
                <q-skeleton type="text" height="70px" width="160px"></q-skeleton>
                <q-skeleton type="text" height="70px" width="160px"></q-skeleton>
                <q-skeleton type="text" height="70px" width="160px"></q-skeleton>
            </div>
        </q-card>

    </q-page-container>

</template>

<script setup>
import {useI18n} from "vue-i18n";
import LineRealtimeView from "components/LineRealtimeView.vue";
import {useStore} from "vuex";
import {computed, onMounted, ref} from "vue";
import LineIcon from "components/LineIcon.vue";

defineOptions({
    name: 'LinesNavView'
})
const {t} = useI18n()
const props = defineProps({})
const store = useStore()
const railsystem = computed(() => store.getters['railsystem/currentRailSystem'])
onMounted(() => {
    init()
})
const showLines = ref([])
const handleShowLineRealtime = (line) => {
    if (line && line.id) {
        store.commit('application/SET_SHOWN_LINE_REALTIME', {lineId: line.id})
    }
}

function init() {
    const railsystemCode = railsystem.value.code
    store.dispatch('railsystem/getShowLineCanvasConfig', {railsystemCode}).then(lineIds => {
        lineIds.forEach(lineId => {
            store.dispatch('railsystem/getLine', {lineId}).then(line => {
                showLines.value.push(line)
            })
        })
    })
}

</script>
<style scoped>
.line-info-wrapper {
    height: 60px;
    color: var(--q-normal);
    border-radius: 10px;
    padding: 5px 10px;
    width: 160px;
    background-color: var(--q-background);
    box-shadow: 2px 2px 3px rgba(0, 0, 0, 0.1);
}

.station-name {
    font-size: 14px;
    font-weight: bold;
    color: var(--q-normal);
    text-wrap: nowrap;
    overflow-x: auto;
    display: flex;
    align-items: center;
    font-family: "Helvetica Neue", Helvetica, "Lucida Grande", Arial, "Hiragino Sans GB", "Microsoft Yahei", "WenQuanYi Micro Hei", sans-serif;
}
</style>
