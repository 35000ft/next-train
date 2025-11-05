<template>
    <q-layout view="lHh Lpr lFf" style="height: 100vh;">
        <LeftDrawer :open="leftDrawerOpen"/>
        <SearchHeader/>
        <q-page-container class="full-height" style="padding-top: 0; ">
            <q-tab-panels class="full-height page-background" :swipeable="swipeable" animated v-model="tab"
                          @update:model-value="updateRoute">
                <q-tab-panel name="home">
                    <router-view/>
                </q-tab-panel>
                <q-tab-panel name="metro-go">
                    <router-view/>
                </q-tab-panel>
                <q-tab-panel name="lines">
                    <router-view/>
                </q-tab-panel>
            </q-tab-panels>
        </q-page-container>
        <q-footer bordered class="bg-grey-3 text-primary" style="z-index: 100">
            <q-tabs no-caps
                    dense
                    active-color="white"
                    indicator-color="transparent" class="bg-primary text-grey shadow-10" v-model="tab">
                <q-route-tab name="home" to="/" icon="train" :label="t('nav.home')"/>
                <q-route-tab name="metro-go" to="/metro-go" icon="alt_route" :label="t('nav.go')"/>
                <q-route-tab name="lines" to="/lines" icon="timeline" :label="t('nav.line')"/>
            </q-tabs>
        </q-footer>
    </q-layout>

    <LineRealtimeView/>
    <TrainInfoDetailView/>
    <StationRealtimeModal/>
    <transition name="right-in-right-out">
        <div v-if="showSolutionDetail" style="position: absolute;z-index: 10;top: 0;left: 0;width: 100vw;">
            <RouteSolutionDetailView :solution="showSolutionDetail" @close="handleCloseSolutionDetail"
                                     v-back="handleCloseSolutionDetail"/>
        </div>
    </transition>
</template>

<script setup>
import {computed, onMounted, ref, watch} from 'vue'
import {useI18n} from 'vue-i18n';
import {useRouter} from "vue-router";
import StationRealtimeModal from "components/StationRealtimeModal.vue";
import TrainInfoDetailView from "components/view/TrainInfoDetailView.vue";
import LineRealtimeView from "components/view/LineRealtimeView.vue";
import RouteSolutionDetailView from "components/view/RouteSolutionDetailView.vue";
import {useStore} from "vuex";
import {isPCMode} from "src/utils/navigator_utils";
import {getLatestVersionInfo} from "src/apis/common";
import {useQuasar} from "quasar";
import SearchHeader from "components/SearchHeader.vue";
import LeftDrawer from "components/LeftDrawer.vue";
import {removeKeysStartingWith} from "src/utils/common_utils";

const {t} = useI18n();

defineOptions({
    name: 'MainLayout'
})
const store = useStore()
const showSolutionDetail = computed(() => store.getters['application/shownSolution'])
const tab = ref('home')
const router = useRouter()
const currentVersion = process.env.APP_VERSION
const $q = useQuasar()
onMounted(() => {
    checkLatestVersion()
})
const leftDrawerOpen = computed(() => store.getters['application/showLeftDrawer'])

async function checkLatestVersion() {
    try {
        const versionInfo = await getLatestVersionInfo()
        if (versionInfo.version !== currentVersion) {
            removeKeysStartingWith('railsystem')
            $q.notify.info('发现新版本，点击更新', {
                name: '更新',
                func: () => {
                    window.location.href = `${window.location.origin}${window.location.pathname}?t=${Date.now()}`
                }
            })
        }
        store.commit('application/SET_APP_VERSION', {appVersion: versionInfo})
    } catch (e) {
    }
}

const handleCloseSolutionDetail = () => {
    store.commit('application/SET_SHOWN_SOLUTION', {solution: null})
}
const swipeable = computed(() => {
    if (isPCMode(1024)) {
        if (tab.value === 'home') {
            return false
        }
    }
    return true
})
watch(showSolutionDetail, (newVal, oldVle) => {
    const name = '#solution-detail-view'
    const hasName = window.location.href.endsWith(name)
    if (newVal && !hasName) {
        const newPath = window.location.href + name
        window.history.pushState({}, '', newPath)
    } else if (!newVal && hasName) {
        window.history.back()
    }
})
const updateRoute = (newTab) => {
    router.push({name: newTab})
}
</script>
<style scoped>
.q-dark .page-background {
    background-color: #292929;
}

.body--light .page-background {
    background-color: #f1f1f1;
}

/* 自定义样式 */
.q-bottom-nav .q-btn {
    flex: 1; /* 平均分配宽度 */
}

.full-height {
    height: 100vh; /* 设置布局为视口高度 */
    display: flex;
    flex-direction: column;
}

.q-page-container {
    flex: 1; /* 确保容器拉伸以占据剩余的页面空间 */
}

.q-tab-panels {
    display: flex;
    flex-direction: column;
    flex: 1;
}
</style>
