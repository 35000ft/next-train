<template>
    <div class="modal-overlay" @click.self="handleClose" v-show="showBg" @touchstart.stop>
        <transition name="zoom-in-zoom-out">
            <div class="wrapper" :style="wrapperStyles"
                 v-show="display">
                <div v-if="loading">
                    <q-skeleton :height="height+'px'"/>
                </div>
                <div class="content-wrapper row" v-if="line&&line.stations">
                    <span style="display: inline-block;margin: auto 0"
                          v-for="station in line.stations"
                          @click="handleSelectStation(station)"
                          :key="station.id">
                          <span class="pill" :class="classGetter(station.id)">
                            {{ station.i18Name }}
                         </span>
                    </span>
                </div>
            </div>
        </transition>
    </div>

</template>

<script>
import {computed, defineComponent, ref, toRaw} from "vue";
import {useStore} from "vuex";
import _ from "lodash";
import {isPCMode} from "src/utils/navigator_utils";


export default defineComponent({
    props: {
        height: {
            type: Number,
            default: 35
        },
    },
    setup(props, {emit}) {
        const store = useStore()
        const display = ref(false)
        const loading = ref(true)
        const line = ref(null)
        const currentStationId = ref(null)
        const elementRect = ref(null)
        const showBg = ref(false)
        const classGetter = computed(() => (_stationId) => {
            return _stationId === currentStationId.value ? 'current-station' : 'other-station'
        })
        const wrapperStyles = computed(() => {
            const pcMode = isPCMode(1024)
            const styles = {
                maxHeight: props.height + 'px', top: positionY.value + 'px',
            }
            if (pcMode) {
                styles['left'] = positionX.value + 'px'
            }
            return styles
        })
        const handleClose = () => {
            display.value = false
            setTimeout(() => {
                showBg.value = false
            }, 300)
        }
        const positionY = computed(() => {
            if (!elementRect.value) {
                return Math.ceil(window.innerHeight / 2)
            }
            if (elementRect.value.y + elementRect.value.height + props.height >= window.innerHeight) {
                return elementRect.value.y - props.height
            } else {
                return Math.ceil(elementRect.value.y + elementRect.value.height + 5)
            }
        })
        const positionX = computed(() => {
            if (!elementRect.value) {
                return Math.ceil(window.innerWidth / 2)
            }
            if (elementRect.value.x + elementRect.value.width + props.width >= window.innerWidth) {
                return elementRect.value.x
            } else {
                return Math.ceil(elementRect.value.x + elementRect.value.width)
            }
        })
        const showSelector = ({lineProp, currentStationIdProp, position}) => {
            if (lineProp) {
                lineProp = _.cloneDeep(toRaw(lineProp))
                if (!(lineProp.stations instanceof Array)) {
                    loading.value = true
                    store.dispatch('railsystem/getStationsByLine', {lineId: lineProp.id}).then(_stations => {
                        lineProp.stations = _stations
                    }).finally(_ => {
                        loading.value = false
                    })
                } else {
                    loading.value = false
                }
                showBg.value = true
                line.value = lineProp
                elementRect.value = position
                currentStationId.value = currentStationIdProp
                display.value = true
            }
        }
        const handleSelectStation = (station) => {
            if (!station || station.id === currentStationId.value) {
                return
            }
            emit('select', {
                stationId: station.id,
                lineId: line.value.id,
            })
            handleClose()
        }
        return {
            display,
            line,
            showBg,
            showSelector,
            handleSelectStation,
            handleClose,
            currentStationId,
            classGetter,
            loading,
            wrapperStyles,
        }
    }
})


</script>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 500;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    -webkit-backdrop-filter: blur(2px);
    backdrop-filter: blur(2px);
}

.wrapper {
    position: fixed;
    max-width: 500px;
    background-color: var(--q-grey-2);
    border-bottom: 2px solid var(--q-primary);
    border-radius: 10px;
    padding: 5px;
    z-index: 1500;
    overflow-y: auto;
}

.current-station {
    background-color: var(--q-primary);
    color: var(--q-grey-2);
    font-weight: bold;
}

.other-station {
    background-color: var(--q-grey-4);
    color: var(--q-normal);

}

.content-wrapper {
    gap: 5px;
}

.pill {
    display: inline-block;
    margin-right: 2px;
    padding: 3px 6px;
    border-radius: 5px;
    flex-shrink: 0;
    white-space: nowrap;
    margin-left: 2px;
}
</style>
