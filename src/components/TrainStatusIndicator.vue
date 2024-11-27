<template>
    <div class="circle" :class="cssClass" :style="{height:size,width:size}">
        <span v-show="arriveMins>0 && arriveMins<10" style="padding-top:1px;">{{ arriveMins }}</span>
    </div>
</template>
<script setup>
import {computed} from "vue";
import {scaleSize} from "src/utils/css-utils";

const props = defineProps({
    size: {
        type: String,
        default: '15px'
    },
    arriveMins: {
        type: Number
    }
})

const size = computed(() => {
    let size
    if (cssClass.value === 'arrive-in-10-mins') {
        size = scaleSize(props.size, 1.4)
    } else {
        size = props.size
    }
    return size
})

const cssClass = computed(() => {
    if (props.arriveMins <= 0) {
        return 'arrived'
    }
    if (props.arriveMins < 10) {
        return 'arrive-in-10-mins'
    }
    return 'arrive-after-10-mins'
})
</script>

<style scoped>
.circle {
    overflow: hidden;
    display: flex;
    border-radius: 50%; /* 设置圆角为50%，形成圆形 */
    border: 0;
    justify-content: center;
    align-items: center;
}

.arrive-after-10-mins {
    background-color: #009A44;
}

.arrived {
    background-color: #A6093D;
    animation: scale-up-down 1s ease-in-out infinite;
}


.arrive-in-10-mins {
    padding: 0;
    background-color: transparent;
    border: 2px solid #009A44;
}

@keyframes scale-up-down {
    0%, 100% {
        transform: scale(0.8); /* 初始和结束状态为正常大小 */
    }

    50% {
        transform: scale(1); /* 中间状态放大 */
    }
}


</style>
