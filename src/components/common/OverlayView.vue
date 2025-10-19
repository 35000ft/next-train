<template>
    <q-layout view="lHh Lpr lFf" class="full-height" style="background-color: var(--q-background);">
        <q-header class="row header-wrapper">
            <div @click="handleClose" class="col-3 close-btn" style="font-size: 30px;">
                <i class="fa-solid fa-arrow-left fa-lg"></i>
            </div>
            <div class="col-6 header-center">
                <div v-overflow-auto-scroll>
                    <slot name="header-center"></slot>
                </div>
            </div>
            <div class="col-3">
                <slot name="header-right"></slot>
            </div>
        </q-header>
        <q-page-container class="full-height scroll">
            <div class="main-content">
                <slot name="default"></slot>
            </div>
        </q-page-container>
    </q-layout>
</template>

<script setup>
import {useRouter} from "vue-router";
import {inject} from "vue";

const props = defineProps({
    onClose: Function,
    name: {
        type: String,
        default: "OverlayView"
    },
    manageByOverlay: {
        type: Boolean,
        default: true
    }
})
const emit = defineEmits(['close'])
const eventBus = inject('eventBus');
const router = useRouter()
const handleClose = (event) => {
    if (!props.manageByOverlay) {
        emit('close')
        return
    }
    if (window.history.length === 1) {
        if (eventBus) {
            eventBus.handleBack({from: window.history.state.current, to: '/'})
        }
        router.push('/')
    } else {
        router.back()
    }
}

</script>

<style scoped>
.header-wrapper {
    padding-top: 10px;
    display: flex;
    padding-left: 15px;
    background-color: var(--q-primary);
    color: var(--q-grey-2);
    align-items: center;
    padding-right: 15px;
}

.header-center {
    font-size: 24px;
    display: flex;
    font-weight: bold;
    justify-content: center;
}

.close-btn {
    transition: .3s;
}

.close-btn:active {
    color: var(--q-grey-3);
}
</style>
