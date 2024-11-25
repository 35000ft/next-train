<template>
    <bottom-modal :display="display" @close="handleClose">
        <template v-slot:default>
            <div>
                <q-input outlined rounded v-model="text" label="线网名 | 城市名" :bg-color="'grey-2'"/>
            </div>
            <div class="row" style="overflow-y: auto;">
                <q-skeleton style="height: 80px;width: 100%;" type="text" v-show="loading"/>
                <q-skeleton style="height: 80px;width: 100%;" type="text" v-show="loading"/>
                <div style="height: 10px;width: 100%;"></div>
                <div class="row station-result-wrapper" v-for="(railsystem,index) in searchResults" :key="index"
                     @click="handleSelectRailSystem(railsystem)"
                     style="width: 100%;">
                    <div class="col-6">{{ railsystem.fullname }}</div>
                    <div class="col-2"></div>
                    <div class="col-4" style="text-align: right;">{{ railsystem.name }}</div>
                </div>
            </div>
        </template>
    </bottom-modal>
</template>

<script>
import BottomModal from "components/BottomModal.vue";
import {defineComponent, ref, toRaw} from "vue";
import {useStore} from "vuex";


export default defineComponent({
    components: {BottomModal},
    setup(_, {emit}) {
        const display = ref(false)
        const text = ref('')
        const loading = ref(true)
        const store = useStore()
        const searchResults = ref([])
        let currentRailSystem = toRaw(store.getters['railsystem/currentRailSystem'])
        const handleClose = () => {
            display.value = false
            emit('close')
        }
        const handleSelectRailSystem = (railsystem) => {
            railsystem = toRaw(railsystem)
            if (railsystem.code === currentRailSystem.code) {
                return
            }
            emit('select', railsystem)
            currentRailSystem = railsystem
            display.value = false
        }
        const showRailSystemSelector = () => {
            display.value = true
            loading.value = true
            store.dispatch('railsystem/getRailSystems').then(r => {
                loading.value = false
                searchResults.value = r
            })
        }
        return {
            showRailSystemSelector,
            display,
            handleClose,
            handleSelectRailSystem,
            text,
            emit,
            loading,
            searchResults,
        }
    }
})


</script>

<style scoped>
.station-result-wrapper {
    padding: 5px;
    font-size: 16px;
    color: #3a3a3a;
    transition: .3s;
    background-color: transparent;
    border-bottom: 1px solid #dcdcdc;
}

.station-result-wrapper:active {
    color: var(--q-primary);
    background-color: #dcdcdc;
    font-weight: bold;
    align-items: center;
    font-size: 18px;
}
</style>
