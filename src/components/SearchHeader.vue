<template>
  <q-header elevated class="bg-primary text-white">
    <q-toolbar>
      <div class="row"
           style="width: 100% ;display: flex;align-items: center;margin: 0 auto;align-content: space-around">
        <div class="col">
          <!--          <span style="display: inline-flex;background-color: #efefef; padding: 5px;border-radius: 20px">-->
          <img src="../assets/logo.png" alt="logo" style="height: 20px;">
          <!--          </span>-->
        </div>
        <div class="col">
          <input
            class="q-field__control"
            :placeholder="t('headers.search.placeholder')"
            v-model="searchText"
            @input="onSearch"
          />
        </div>
        <div class="col" style="text-align: right; " @click="handleClickSelectRailSystem">
          <q-btn flat :label="currentRailSystem.name" class="text-white" style="font-size: 20px;font-weight:bold;"/>
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
import {ref, toRaw} from 'vue'
import RailSystemSelector from "components/RailSystemSelector.vue";
import {useStore} from "vuex";

const {t} = useI18n();
const store = useStore()

const currentRailSystem = ref(toRaw(store.getters['railsystem/currentRailSystem']))

const searchText = ref('')  // 搜索框的绑定值
const railSystemSelector = ref(null)

const handleClickSelectRailSystem = () => {
  railSystemSelector.value.showRailSystemSelector()
}
const handleSelectRailSystem = (railsystem) => {
  console.log('rec', railsystem)
  if (!railsystem) {
    return
  }
  currentRailSystem.value = railsystem
  store.dispatch('railsystem/setCurrentRailSystem', railsystem)
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
</style>
