<template>
    <div class="modal-overlay" @click.self="$emit('close')" v-show="showBg" v-back="handleBack"
         :style="{backgroundColor:`rgb(0,0,0,${overlayOpacity})`}">
        <transition name="bottom-modal">
            <div class="modal-content" v-show="display" ref="modalContent"
                 :style="{height:contentHeight,width:contentWidth}">
                <div class="movable-banner"><span></span></div>
                <slot></slot>
            </div>
        </transition>
    </div>
</template>

<script setup>
import {onMounted, ref, watch} from 'vue'
import Hammer from 'hammerjs';

const props = defineProps({
    display: {
        type: Boolean,
        default: false
    },
    contentHeight: {
        type: String,
        default: "35vh"
    },
    contentWidth: {
        type: String,
        default: "90%"
    },
    name: {
        type: String,
        default: "selector"
    },
    afterClose: {
        type: Function
    },
    onMoveUp: {
        type: Function,
        default: null
    }
})

const emit = defineEmits(['close']);
const showBg = ref(false)
const targetOverlayOpacity = 0.5
let overlayOpacity = ref(targetOverlayOpacity)

let rawHeight = null
const modalContent = ref(null);
onMounted(() => {
    const hammer = new Hammer(modalContent.value)
    hammer.get('pan').set({direction: Hammer.DIRECTION_VERTICAL})
    hammer.on('pan', evt => {
        if (!rawHeight) {
            rawHeight = modalContent.value.clientHeight
        }
        if (evt.deltaY < 0) {
            // move up
            if (!props.onMoveUp) {
                return
            }
            const newHeight = rawHeight - evt.deltaY; // deltaY 为负，需减法
            modalContent.value.style.height = newHeight + 'px';
        } else {
            // move down
            modalContent.value.style.bottom = -evt.deltaY + 'px'
        }
    })
    hammer.on('panend', evt => {
        const movedHeight = evt.deltaY
        if (movedHeight > 0) {
            // move down
            if (Math.abs(movedHeight) > rawHeight * 0.25) {
                // if movedHeight > 25% height of element then close
                emit('close')
            } else {
                // otherwise recover to the origin position
                modalContent.value.style.bottom = '0'
            }
        } else {
            // move up
            if (Math.abs(movedHeight) > rawHeight * 0.5) {
                // call function onMoveUp
                if (props.onMoveUp) {
                    props.onMoveUp()
                }
            }
        }
    })
})

const handleBack = () => {
    emit('close')
}

watch(() => props.display, (newValue, oldValue) => {
    if (!newValue) {
        closeModal()
    } else {
        showModel()
    }
})


const showModel = () => {
    showBg.value = true
    const hasName = window.location.href.endsWith(props.name)
    if (hasName) {
        return
    }
    const newPath = window.location.href + `#${props.name}`;
    window.history.pushState({}, '', newPath);
    overlayOpacity.value = targetOverlayOpacity * 0.1
    const interval = setInterval(() => {
        const newOpacity = overlayOpacity.value * 1.3
        if (newOpacity < targetOverlayOpacity) {
            overlayOpacity.value = newOpacity
        } else {
            overlayOpacity.value = targetOverlayOpacity
        }
    }, 50);
    setTimeout(() => {
        clearInterval(interval)
    }, 350)
}

const closeModal = () => {
    if (window.location.href.indexOf(`#${props.name}`) !== -1) {
        window.history.back()
    }
    //逐渐改变背景颜色的透明度
    const interval = setInterval(() => {
        overlayOpacity.value = overlayOpacity.value * 0.7
    }, 50);
    setTimeout(() => {
        showBg.value = false // 等待动画完成后隐藏背景
        clearInterval(interval)
        modalContent.value.style.bottom = '0'
        if (typeof props.afterClose === "function") {
            props.afterClose()
        }
    }, 350)
};
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 2500;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    -webkit-backdrop-filter: blur(2px);
    backdrop-filter: blur(2px);
}

.modal-content {
    opacity: 90%;
    position: fixed;
    bottom: 0;
    background-color: var(--q-background);
    color: var(--q-normal);
    padding: 0 20px 20px;
    border-top-left-radius: 15px;
    border-top-right-radius: 15px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
    overflow: auto; /* 允许内部内容滚动 */
    border-top: 2px solid var(--q-primary);
}

.bottom-modal-enter-active {
    animation: selector-transition .8s;
}

.bottom-modal-leave-active {
    animation: selector-transition .5s reverse;
}


@keyframes selector-transition {
    from {
        transform: translateY(90vh);
    }
    to {
        transform: translateY(0px);
    }
}


.movable-banner {
    height: 30px;
    display: flex;
}

.movable-banner span {
    height: 6px;
    width: 15%;
    margin: 12px auto;
    border-radius: 5px;
    background-color: #9b9b9b;
}

</style>
