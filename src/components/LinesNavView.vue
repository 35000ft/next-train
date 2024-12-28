<template>
    <q-header>
        <q-toolbar>
            <q-toolbar-title>Next Train</q-toolbar-title>
        </q-toolbar>
    </q-header>
    <q-page-container>
        <h4>{{ t('developing') }}</h4>
    </q-page-container>
</template>

<script setup>
import {useI18n} from "vue-i18n";

defineOptions({
    name: 'LinesNavView'
})
const {t} = useI18n()
const props = defineProps({})
</script>
