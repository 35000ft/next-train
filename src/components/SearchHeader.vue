<template>
    <q-header elevated class="bg-primary text-white">
        <q-toolbar>
            <div class="row"
                 style="width: 100% ;display: flex;align-items: center;margin: 0 auto;align-content: space-around">
                <div class="col-3">
                    <img src="../assets/logo.png" alt="logo" style="height: 20px;">
                </div>
                <div class="col-5" style="display: flex;justify-content: center;align-items: center;">
                    <input
                        v-if="false"
                        class="q-field__control"
                        :placeholder="t('headers.search.placeholder')"
                        v-model="searchText"
                        @input="onSearch"
                    />
                </div>
                <div style="text-align: right;" class="col-4">
                    <div class="q-pa-md col"
                         style="display: inline-block;padding-left: 0;padding-right: 0;margin-right: 10px;">
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
                    <q-btn flat :label="currentRailSystem.name" class="text-white"
                           style="font-size: 20px;font-weight:bold;padding-left: 5px;padding-right: 5px;"/>
                    <!-- TODO 展示不展示切换线网 -->
                    <!--                           @click="handleClickSelectRailSystem"-->
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
import {computed, ref, toRaw} from 'vue'
import RailSystemSelector from "components/RailSystemSelector.vue";
import {i18n, supportedLanguages} from 'src/boot/i18n'
import {useStore} from "vuex";

const {t} = useI18n();
const store = useStore()

const currentRailSystem = ref(toRaw(store.getters['railsystem/currentRailSystem']))

const searchText = ref('')
const railSystemSelector = ref(null)
const languages = ref(supportedLanguages)
const handleClickSelectRailSystem = () => {
    railSystemSelector.value.showRailSystemSelector()
}
const currentLanguage = computed(() => {
    return store.getters['language/currentLanguage']
})
const selectLanguage = (langCode) => {
    if (langCode) {
        store.dispatch('language/setLanguage', {lang: langCode}).then(() => {
            i18n.global.locale = langCode

        }).catch(error => {
            console.error('Error setting language:', error)
        });
    }
}
const handleSelectRailSystem = (railsystem) => {
    if (!railsystem) {
        return
    }
    currentRailSystem.value = railsystem
    store.dispatch('preference/setCurrentRailSystem', railsystem)
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
