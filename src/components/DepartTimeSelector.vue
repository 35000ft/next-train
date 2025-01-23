<template>
    <bottom-modal content-height="40vh" contentWidth="100%" :display="displaySelector" @close="handleCloseSelector"
                  @touchstart.stop name="depart-time-selector">
        <template v-slot:default>
            <div>
                <div style="font-size: 28px;font-weight:bold;color: var(--q-primary-d);text-align: center;">
                    设定出发时间
                </div>
                <div @click="changeDepDate" class="date-picker-wrapper">
                        <span
                            ref="dateSelector"
                            @animationend="onAnimationend"
                            class="switch-icon"></span>
                    <span>今日</span>
                    <span>次日</span>
                </div>
                <div class="time-input-wrapper" style="margin-top: 15px;">
                    <q-input filled mask="time" :rules="['time']"
                             v-model="depTimeString"
                             @change="handleSelectTime(depTime.format('YYYY-MM-DD') ,$event.target.value)"
                             pattern="[0-9]{2}:[0-9]{2}"
                    >
                        <template v-slot:append>
                            <q-icon name="access_time" class="cursor-pointer">
                                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                    <q-time v-model="depTimeString" format24h>
                                        <div class="row items-center justify-end">
                                            <q-btn v-close-popup label="Close" color="primary" flat/>
                                        </div>
                                    </q-time>
                                </q-popup-proxy>
                            </q-icon>
                        </template>
                    </q-input>
                </div>
                <div class="time-btn-group">
                    <i class="green-color fa fa-angle-left"></i>
                    <span @click="changeDepTime(-5)" class="time-btn">
                    推前5分钟
                </span>
                    <span @click="handleSelect(true)" class="time-btn now-font-size">
                    {{ t('now') }}
                </span>
                    <span @click="changeDepTime(5)" class="time-btn">
                    推后5分钟
                </span>
                    <i class="green-color fa fa-angle-right"></i>
                </div>
                <div @click="handleSelect" class="confirm">
                    选定
                </div>
            </div>
        </template>
    </bottom-modal>
</template>
<script>

import BottomModal from "components/BottomModal.vue";
import {computed, defineComponent, ref, watch} from "vue";
import {useI18n} from "vue-i18n";
import dayjs from "dayjs";

export default defineComponent(
    {
        components: {BottomModal},
        setup(_0, {emit}) {
            const dateSelector = ref(null)
            const onAnimationend = () => {
                console.log('onAnimationend')
                showAnimate.value = false
            }
            const todayDepart = ref(true)
            const display = ref(false)
            const {t} = useI18n()
            const depTime = ref(dayjs())
            const showAnimate = ref(false)
            const depTimeString = ref(new dayjs().format('HH:mm'))
            const handleCloseSelector = () => {
                display.value = false
                emit('close')
            }
            const showSelector = () => {
                display.value = true
            }
            const changeDepTime = (val) => {
                if (!val) {
                    changeDepDate(true)
                    depTime.value = null
                    handleSelect(true)
                    return
                }
                const temp = dayjs(new dayjs().format('YYYY-MM-DD') + ' ' + depTimeString.value)
                depTimeString.value = temp.add(val, 'minute').format('HH:mm')
            }
            const handleSelect = (nowGo) => {
                if (nowGo) {
                    emit('select', null, true)
                } else {
                    emit('select', depTime.value, false)
                }
            }
            const handleSelectTime = (newDate, newTime) => {
                const temp = new dayjs(`${newDate} ${newTime}`)
                if (temp.minute() === dayjs().minute()) {
                    depTime.value = null
                } else {
                    depTime.value = temp
                }
            }
            const changeDepDate = (event, isNow) => {
                if (isNow === true) {
                    if (todayDepart.value) return
                    showAnimate.value = true
                    todayDepart.value = true
                } else {
                    showAnimate.value = true
                    todayDepart.value = !todayDepart.value
                }
            }
            watch(showAnimate, (_showAnimate, old) => {
                if (!_showAnimate) {
                    if (!todayDepart.value) {
                        dateSelector.value.style.left = "50%"
                    }
                } else {
                    const animationName = todayDepart.value
                        ? "move-date-selector-transition .3s reverse"
                        : "move-date-selector-transition .3s";
                    console.log('d', dateSelector.value.style)
                    dateSelector.value.style.animation = animationName
                    console.log('d2', dateSelector.value.style)
                }
            })
            return {
                displaySelector: display,
                handleCloseSelector,
                changeDepTime,
                changeDepDate,
                handleSelect,
                onAnimationend,
                t,
                depTimeString,
                showSelector,
                handleSelectTime,
                dateSelector,
                depTime,
                showAnimate,
            }
        }
    }
)
</script>
<style scoped>
@keyframes move-date-selector-transition {
    0% {
        left: 0;
    }
    100% {
        left: 50%;
    }
}

.time-input-wrapper {
    margin: 0 auto;
    width: 60%;
}

.time-input-wrapper input {
    font-size: 32px;
    width: 200px;
    margin-top: 20px;
    text-align: center;
    color: rgb(54, 89, 143);
    border-radius: 10px;
    border: 2px solid #9b9b9b;
}

.time-btn-group {
    width: 90%;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
}

.green-color {
    color: #008538;
}

.time-btn {
    font-size: 18px;
    font-weight: bold;
    display: inline-block;
    line-height: 30px;
    text-align: center;
    width: 120px;
    height: 30px;
    margin-left: 3px;
    margin-right: 3px;
    color: #008538;
    transition: .3s;
}

.time-btn:active {
    opacity: 50%;
}

.now-font-size {
    font-size: 20px;
}

.confirm {
    height: 40px;
    width: 100px;
    font-weight: bold;
    font-size: 24px;
    border-radius: 10px;
    max-width: 200px;
    color: #ffffff;
    text-align: center;
    line-height: 40px;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    bottom: 20px;
    transition: .3s;
    background-color: #008538;
    -moz-user-select: none;
}

.confirm:active {
    opacity: 50%;
}

.date-picker-wrapper {
    height: 50px;
    width: 200px;
    margin: 0 auto;
    font-weight: 700;
    font-size: 28px;
    color: #ffffff;
    display: flex;
    background-color: #fff;
    border: 2px solid #9b9b9b;
    border-radius: 10px;
    position: relative;
}

.date-picker-wrapper span {
    width: 50%;
    text-align: center;
    line-height: 50px;
    z-index: 5;
}

.date-picker-wrapper .switch-icon {
    position: absolute;
    width: 50%;
    z-index: 0;
    background-color: #008538;
    height: 100%;
    border-radius: 8px;
}

</style>
