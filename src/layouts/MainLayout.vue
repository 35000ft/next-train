<template>

    <q-layout view="lHh Lpr lFf" class="full-height">
        <q-page-container class="full-height" style="padding-top: 0; ">
            <q-tab-panels class="full-height page-background" swipeable animated v-model="tab"
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
import {computed, ref, watch} from 'vue'
import {useI18n} from 'vue-i18n';
import {useRouter} from "vue-router";
import StationRealtimeModal from "components/StationRealtimeModal.vue";
import TrainInfoDetailView from "components/TrainInfoDetailView.vue";
import LineRealtimeView from "components/LineRealtimeView.vue";
import RouteSolutionDetailView from "components/RouteSolutionDetailView.vue";
import {useStore} from "vuex";

const {t} = useI18n();

defineOptions({
    name: 'MainLayout'
})
const store = useStore()
const showSolutionDetail = computed(() => store.getters['application/shownSolution'])
const tab = ref('station'); // 默认激活的导航项
const router = useRouter()
const handleCloseSolutionDetail = () => {
    store.commit('application/SET_SHOWN_SOLUTION', {solution: null})
}
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
    // 根据选中的选项卡更新路由
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
