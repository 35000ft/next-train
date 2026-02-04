<template>
    <q-header elevated class="bg-primary text-white">
        <q-toolbar>
            <div class="row"
                 style="width: 100% ;display: flex;align-items: center;margin: 0 auto;align-content: space-around">
                <div class="col-3" @click="handleLeftDrawer">
                    <img src="../assets/logo.png" alt="logo" style="height: 20px;">
                </div>
                <div class="col-3" style="display: flex;justify-content: center;align-items: center;">
                    <input
                        v-if="false"
                        class="q-field__control"
                        :placeholder="t('headers.search.placeholder')"
                        v-model="searchText"
                        @input="onSearch"
                    />
                </div>
                <div class="col-6" style="text-align: right;">
                    <div class="q-pa-md col"
                         style="display: inline-block;padding-left: 0;padding-right: 0;">
                        <q-btn-dropdown color="primary" icon="language" label="" unelevated padding="0">
                            <q-list>
                                <q-item v-for="lang in languages" :key="lang.code" clickable v-close-popup
                                        style="padding-top: 0;padding-bottom: 0;min-height: 30px"
                                        :class="lang.code===currentLanguage?'current-lang':''"
                                        @click="selectLanguage(lang.code)">
                                    <q-item-section>
                                        <q-item-label>{{ lang.name }}</q-item-label>
                                    </q-item-section>
                                </q-item>
                            </q-list>
                        </q-btn-dropdown>
                    </div>
                    <q-btn flat class="text-white"
                           @click="handleClickSelectRailSystem"
                           style="font-size: 20px;font-weight:bold;padding-right: 1px;">
                        <div class="row items-center no-wrap">
                            <div class="text-center">
                                {{ showRailsystemName }}
                            </div>
                            <img v-if="currentRailsystem.extra?.logo"
                                 style="height: 20px;width: 20px; margin-left: 2px;"
                                 :src="currentRailsystem.extra?.logo" alt="Logo">
                        </div>
                    </q-btn>
                </div>
            </div>
        </q-toolbar>
    </q-header>
    <rail-system-selector ref="railSystemSelector" @select="handleSelectRailSystem"/>
</template>

<script setup>
import {useI18n} from "vue-i18n";

defineOptions({
    name: 'SearchHeader'
})
import {computed, ref} from 'vue'
import RailSystemSelector from "components/input/RailSystemSelector.vue";
import {i18n, supportedLanguages} from 'src/boot/i18n'
import {useStore} from "vuex";
import {useQuasar} from "quasar";

const {t} = useI18n();
const store = useStore()

const currentRailsystem = computed(() => store.getters['railsystem/currentRailSystem'])
const currentLanguage = computed(() => {
    return store.getters['language/currentLanguage']
})
const showRailsystemName = computed(() => {
    const railsystemLanguage = currentRailsystem.value?.language
    if (railsystemLanguage && railsystemLanguage?.slice(0, 2).toLowerCase() !== String(currentLanguage)?.slice(0, 2).toLowerCase()) {
        return currentRailsystem.value.code
    } else {
        return currentRailsystem.value.abbrName || currentRailsystem.value.name
    }
})
const searchText = ref('')
const railSystemSelector = ref(null)
const languages = ref(supportedLanguages)
const $q = useQuasar()
const handleClickSelectRailSystem = () => {
    railSystemSelector.value.showRailSystemSelector()
}
const handleLeftDrawer = () => {
    store.commit('application/SET_SHOW_LEFT_DRAWER', true)
}

const selectLanguage = (langCode) => {
    if (langCode) {
        store.dispatch('language/setLanguage', {lang: langCode}).then(() => {
            i18n.global.locale = langCode

        }).catch(error => {
            console.error('Error setting language:', error)
        });
    }
}
const handleSelectRailSystem = async (railsystem) => {
    if (!railsystem) {
        return
    }
    store.commit('railsystem/SET_CURRENT_RAILSYSTEM', {railsystem: railsystem})
    const defaultStationId = railsystem?.extra?.defaultStationId
    const station = await store.dispatch('railsystem/getStation', {stationId: defaultStationId})
    if (station) {
        store.commit('preference/SET_CURRENT_STATION', {station})
    } else {
        $q.notify.error("自动切换车站失败")
    }

}

const onSearch = () => {
    console.log('Search:', searchText.value)
}

</script>

<style scoped>
.q-field__control {
    height: 30px;
    border-radius: 15px;
    padding-left: 10px;
    padding-right: 10px;
}

::v-deep .q-btn-dropdown__arrow {
    display: none;
}

.current-lang {
    font-weight: bold;
    color: var(--q-primary-d);
}
</style>
