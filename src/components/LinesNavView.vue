<template>
    <q-header>
        <q-toolbar>
            <q-toolbar-title>Next Train</q-toolbar-title>
        </q-toolbar>
    </q-header>

    <q-page-container>
        <LineRealtimeView :line-id-prop="'59'"/>
        <div></div>
    </q-page-container>

</template>

<script setup>
import {useI18n} from "vue-i18n";
import LineRealtimeView from "components/LineRealtimeView.vue";

defineOptions({
    name: 'LinesNavView'
})
const {t} = useI18n()
const props = defineProps({})
</script>
