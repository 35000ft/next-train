<template>
    <div class="modal-overlay" @click.self="handleClose" v-show="showBg" @touchstart.stop>
        <transition name="zoom-in-zoom-out">
            <div class="wrapper" :style="{height:height+'px',top:positionY+'px'}" v-show="display">
                <div v-if="loading">
                    <q-skeleton :height="height+'px'"/>
                </div>
                <div class="full-height content-wrapper" v-if="line&&line.stations">
                    <span style="display: inline-block;margin: auto 0"
                          v-for="station in line.stations"
                          @click="handleSelectStation(station)"
                          :key="station.id">
                          <span class="pill" :class="classGetter(station.id)">
                            {{ station.name }}
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
            emit('select', station.id, line.value.id)
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
            positionY,
            loading
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
    width: 90vw;
    background-color: var(--q-grey-2);
    border-bottom: 2px solid var(--q-primary);
    border-radius: 10px;
    z-index: 1500;
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
    display: flex;
    align-items: center;
    overflow-x: auto;
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
