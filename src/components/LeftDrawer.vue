<template>
    <!-- 左侧抽屉 -->
    <q-drawer
        v-model="leftDrawerOpen"
        show-if-above
        side="left"
        behavior="mobile"
        bordered
        swipe-open
        @hide="onHide"
        :width="200"
        :breakpoint="600"
    >
        <q-list>
            <q-item clickable v-ripple @click="handleAvatarClick"
                    style="background-color:var(--q-secondary);color: #ffffff">
                <q-item-section avatar>
                    <q-avatar color="primary" text-color="white">
                        {{ loginUser ? loginUser.username.charAt(0) : '登入' }}
                    </q-avatar>
                </q-item-section>
                <q-item-section style="font-size: 12px;">
                    {{ loginUser?.username || '登入以使用更多服务' }}
                </q-item-section>
            </q-item>

            <q-item clickable v-ripple>
                <q-item-section>Author: @雲上</q-item-section>
            </q-item>
            <q-item clickable v-ripple>
                <q-item-section>Version: {{ appVersion }}</q-item-section>
            </q-item>
        </q-list>
    </q-drawer>
</template>
<script setup>
import {onMounted, ref, watch} from 'vue'
import {useStore} from "vuex";
import {useRouter} from "vue-router";

const leftDrawerOpen = ref(false)
const props = defineProps({
    open: {
        type: Boolean,
        default: false,
    }
})
onMounted(() => {
    if (typeof props?.open === "boolean") {
        leftDrawerOpen.value = props.open
    }
})
const appVersion = process.env.APP_VERSION
const store = useStore()
const router = useRouter()
const loginUser = store.getters['application/loginUser']
const onHide = () => {
    store.commit('application/SET_SHOW_LEFT_DRAWER', false)
}

const handleAvatarClick = () => {
    if (!loginUser) {
        router.push({name: 'login'})
    } else {
        // TODO 已登录，可跳转到个人中心或其他页面
    }
}
watch(props, (newVal, oldVal) => {
    if (typeof newVal?.open === "boolean") {
        leftDrawerOpen.value = newVal.open
    }
})
</script>
<style scoped>

</style>
