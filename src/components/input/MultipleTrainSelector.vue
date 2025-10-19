<template>
    <q-popup-proxy ref="multipleTrainSelector" v-if="trains.length>0" @before-hide="onHide">
        <q-banner style="width: 90%;">
            <div
                style="font-size: 20px;font-weight:bold;text-align: center;height: 30px;padding-top: 10px;color: var(--q-primary-d);">
                当前区间有多组列车
            </div>
            <div class="q-pa-md" style="max-width: 350px">
                <q-list>
                    <q-item clickable v-ripple v-for="train in trains" :key="train.id" @click="handleSelect(train)">
                        <q-item-section>
                            <div
                                class="row"
                                style="display: flex;gap: 5px;font-size: 16px;background-color: var(--q-background-grey-2);
                                align-items: center;
                                padding: 10px;border-radius: 5px;">
                                <div class="col-4">
                                    <TrainCategory :category="train.category"/>
                                </div>
                                <div class="col-6">{{ train.showTrainNo }}</div>
                                <div>
                                    {{ train.schedule[0].stationName }} ~
                                    {{ train.schedule.slice(-1)[0].stationName }}
                                </div>
                            </div>
                        </q-item-section>

                    </q-item>
                </q-list>
            </div>
        </q-banner>
    </q-popup-proxy>
</template>

<script>
import {defineComponent, ref} from "vue";
import TrainCategory from "components/TrainCategory.vue";

export default defineComponent({
    components: {TrainCategory},
    setup(_0, {emit}) {
        const trains = ref([])
        const handleSelect = (train) => {
            emit('select', train)
            multipleTrainSelector.value.hide()
        }
        const onHide = () => {
            setTimeout(() => trains.value = [], 100)
        }
        const multipleTrainSelector = ref(null)
        const show = (_trains) => {
            if (_trains && _trains.length > 0) {
                trains.value = _trains
            }
        }
        return {
            trains,
            multipleTrainSelector,
            show,
            handleSelect,
            onHide,
        }
    }
})


</script>

<style scoped>

</style>
