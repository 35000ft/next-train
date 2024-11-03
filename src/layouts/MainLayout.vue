<template>

  <q-layout view="lHh Lpr lFf" class="full-height">

    <q-page-container class="full-height" style="padding-top: 0; ">
      <q-tab-panels class="full-height" style="background-color: #f1f1f1;" swipeable animated v-model="tab"
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
    <q-footer bordered class="bg-grey-3 text-primary">
      <q-tabs no-caps
              dense
              active-color="white"
              indicator-color="transparent" class="bg-primary text-grey shadow-10" v-model="tab">
        <q-route-tab name="home" to="/" icon="home" :label="t('nav.home')"/>
        <q-route-tab name="metro-go" to="/metro-go" icon="alarm" :label="t('nav.go')"/>
        <q-route-tab name="lines" to="/lines" icon="movie" :label="t('nav.line')"/>
      </q-tabs>
    </q-footer>
  </q-layout>
  
  <!--  <bottom-modal :display="displayStationSelector" @close="handleCloseStationSelector"/>-->
</template>

<script setup>
import {ref} from 'vue'
import {useI18n} from 'vue-i18n';
import {useRouter} from "vue-router";
import BottomModal from "components/BottomModal.vue";

const {t} = useI18n();

defineOptions({
  name: 'MainLayout'
})


const tab = ref('station'); // 默认激活的导航项
const router = useRouter()


const updateRoute = (newTab) => {
  // 根据选中的选项卡更新路由
  router.push({name: newTab})
}
</script>
<style scoped>
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
