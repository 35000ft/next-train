<template>
    <q-card>
        <q-card-section class="full-height">
            <open-street-map :zoom-control="false" :zoom="props.zoom" :center="props.center"
                             :point-name="props.pointName">
            </open-street-map>
        </q-card-section>
    </q-card>
</template>

<script setup>
import {useStore} from "vuex";

import {useI18n} from "vue-i18n";
import OpenStreetMap from "components/common/OpenStreetMap.vue";

const {t} = useI18n()
const store = useStore()
const props = defineProps({
    center: {
        type: Array || String || Object,
    },
    pointName: {
        type: String,
        default: ''
    },
    zoom: {
        type: Number,
        default: 14
    },
})

</script>

<style scoped>
.q-tab-panel {
    padding: 0;
}

.q-tab-panels {
    height: 100%;
}

.q-tab-panel {
    padding: 0;
}

.q-card__section--vert {
    height: 100%;
    padding: 0;
}
</style>
