<template>
  <div class="modal-overlay" @click.self="$emit('close')" v-show="showBg"
       :style="{backgroundColor:`rgb(0,0,0,${overlayOpacity})`}">
    <transition name="bottom-modal">
      <div class="modal-content" v-show="display" ref="modalContent"
           :style="{backgroundColor:bgColor,height:contentHeight}">
        <div class="movable-banner"><span></span></div>
        <slot></slot>
      </div>
    </transition>
  </div>
</template>

<script setup>
import {onMounted, ref, watch} from 'vue'
import Hammer from 'hammerjs';
import {getNumberFromSizeString} from "src/utils/css-utils";

const props = defineProps({
  display: {
    type: Boolean
  },
  bgColor: {
    type: String,
    default: "#ffffff"
  },
  contentHeight: {
    type: String,
    default: "35vh"
  }
})
const emit = defineEmits(['close']);
const showBg = ref(false)
const targetOverlayOpacity = 0.5
let overlayOpacity = ref(targetOverlayOpacity)

const modalContent = ref(null);
onMounted(() => {
  const hammer = new Hammer(modalContent.value)
  hammer.get('pan').set({direction: Hammer.DIRECTION_DOWN})
  hammer.on('pan', evt => {
    if (evt.deltaY < 0) return
    modalContent.value.style.bottom = -evt.deltaY + 'px'
  })
  hammer.on('panend', evt => {
    const movedHeight = Math.abs(getNumberFromSizeString(modalContent.value.style.bottom))
    if (movedHeight > modalContent.value.clientHeight * 0.25) {
      //如果移动高度大于元素25%的高度则关闭模态框
      emit('close')
    } else {
      //否则恢复原位
      modalContent.value.style.bottom = '0'
    }
  })
})


watch(() => props.display, (newValue, oldValue) => {
  if (!newValue) {
    closeModal()
  } else {
    showModel()
  }
})

const showModel = () => {
  showBg.value = true
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
  //逐渐改变背景颜色的透明度
  const interval = setInterval(() => {
    overlayOpacity.value = overlayOpacity.value * 0.7
  }, 50);
  setTimeout(() => {
    showBg.value = false // 等待动画完成后隐藏背景
    clearInterval(interval)
    modalContent.value.style.bottom = '0'
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
}

.modal-overlay.show {
  background-color: rgba(0, 0, 0, 0.2); /* 动画结束时的透明度 */
}

.modal-content {
  position: fixed;
  bottom: 0;
  background-color: white;
  width: 90%;
  max-width: 400px;
  max-height: 600px;
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
