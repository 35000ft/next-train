<template>
    <div>
        <slot name="show-at-close"></slot>
        <q-drawer
            v-model="drawer"
            show-if-above
            :width="200"
            :breakpoint="500"
            bordered
            :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-3'"
            style="color: var(--q-normal);"
        >
            <q-scroll-area class="fit">
                <q-list>
                    <q-item-label header style="background-color:var(--q-primary);color: #ffffff">
                        更多资讯
                    </q-item-label>
                    <template v-for="(menuItem, index) in menuList" :key="index">
                        <q-item clickable :active="menuItem.label === 'Outbox'" v-ripple>
                            <q-item-section avatar>
                                <q-icon :name="menuItem.icon"/>
                            </q-item-section>
                            <q-item-section>
                                {{ menuItem.label }}
                            </q-item-section>
                        </q-item>
                        <q-separator :key="'sep' + index" v-if="menuItem.separator"/>
                    </template>

                </q-list>
            </q-scroll-area>
        </q-drawer>
    </div>
</template>
<script setup>
import {computed, ref, watch} from "vue";
import {useQuasar} from "quasar";

const $q = useQuasar()
const menuList = ref([
    {
        icon: 'inbox',
        label: 'Inbox',
        separator: true
    },
    {
        icon: 'send',
        label: 'Outbox',
        separator: false
    },
    {
        icon: 'delete',
        label: 'Trash',
        separator: false
    },
    {
        icon: 'error',
        label: 'Spam',
        separator: true
    },
    {
        icon: 'settings',
        label: 'Settings',
        separator: false
    },
    {
        icon: 'feedback',
        label: 'Send Feedback',
        separator: false
    },
    {
        icon: 'help',
        iconColor: 'primary',
        label: 'Help',
        separator: false
    }
])
const drawer = ref(false)
const props = defineProps({
    showDrawerProp: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['close'])
watch(() => props.showDrawerProp, (n, o) => {
    if (n) {
        drawer.value = true
    }
})
watch(() => drawer.value, (n, o) => {
    if (!n) {
        emit('close')
    }
})
</script>
<style scoped>

</style>
