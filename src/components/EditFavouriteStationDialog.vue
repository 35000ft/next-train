<template>
    <div class="q-pa-md q-gutter-sm" v-back="handleClose">
        <q-dialog v-model="isShow">
            <q-card style="min-width: 350px">
                <q-card-section>
                    <div class="text-h6">{{ t('favStation') }}</div>
                </q-card-section>

                <q-card-section class="q-pt-none scroll" style="max-height: 50vh;">
                    <div>
                        <div style="margin-bottom: 10px;color: var(--q-normal)">
                            {{ t('favStationDesc') }}
                        </div>
                        <div class="row" style="display: flex;justify-content: space-around;align-items: center;">
                            <div class="col-5">
                                <q-input filled v-model="fromTime" mask="time" :rules="['time',validateTimeNotEquals]"
                                         :bg-color="isDark?'grey-10':'grey-2'">
                                    <template v-slot:append>
                                        <q-icon name="access_time" class="cursor-pointer">
                                            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                                <q-time v-model="fromTime" format24h>
                                                    <div class="row items-center justify-end">
                                                        <q-btn v-close-popup label="Close" color="primary" flat/>
                                                    </div>
                                                </q-time>
                                            </q-popup-proxy>
                                        </q-icon>
                                    </template>
                                </q-input>
                            </div>
                            <div class="col-1" style="color: var(--q-primary-d);display: flex;justify-content: center;">
                                <q-icon name="fa fa-arrow-right" size="medium"></q-icon>
                            </div>
                            <div class="col-5">
                                <q-input filled v-model="toTime" mask="time" :rules="['time',validateTimeNotEquals]"
                                         :bg-color="isDark?'grey-10':'grey-2'">
                                    <template v-slot:append>
                                        <q-icon name="access_time" class="cursor-pointer">
                                            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                                <q-time v-model="toTime" format24h>
                                                    <div class="row items-center justify-end">
                                                        <q-btn v-close-popup label="Close" color="primary" flat/>
                                                    </div>
                                                </q-time>
                                            </q-popup-proxy>
                                        </q-icon>
                                    </template>
                                </q-input>
                            </div>
                        </div>
                        <div style="margin-top: 15px;height: 30px;">
                            <div
                                style="margin-bottom: 15px;color: var(--q-primary-d);font-weight:bold;font-size: 14px;">
                                {{ t('period') }}
                            </div>
                            <span
                                style="width: 14%;text-align: center;font-weight:bold;height:fit-content;display: inline-block"
                                v-for="dayOfWeek in weekdays"
                                :class="(dayOfWeek.index<5?'workday':'weekend')"
                                @click="handleSelect(dayOfWeek)"
                                :key="dayOfWeek.index">
                                <span class="day-of-week-text" :class="(dayOfWeek.select?'selected':'')">
                                    {{ dayOfWeek.text }}
                                </span>
                            </span>
                        </div>
                        <div style="width: 100%;height: 40px;"></div>
                        <div>
                            <div class="rounded-borders" v-for="stationRule in rules"
                                 :key="stationRule.stationId">
                                <q-expansion-item :model-value="(expandMap.get(stationRule.stationId))||false"
                                                  @click="handleClickExpand(stationRule)">
                                    <template v-slot:header>
                                        <div style="width: 100%;display: flex;align-items: center;">
                                            <span v-if="stationMap.has(stationRule.stationId)">
                                                {{ stationMap.get(stationRule.stationId).name }}
                                            </span>
                                        </div>
                                    </template>
                                    <q-item v-for="(rule,index) in stationRule.rules" :key="index"
                                            :class="rule.id===conflictRuleId?'conflict-rule':''">
                                        <q-item-section>
                                            <q-item-label lines="1">
                                                {{ rule.fromTime }} - {{ rule.toTime }}
                                                <sup v-show="(rule.toTime.localeCompare(rule.fromTime))<0">+1</sup>
                                            </q-item-label>
                                            <q-item-label caption>{{ formatWeekday(rule.period) }}</q-item-label>
                                        </q-item-section>
                                        <q-item-section side>
                                            <q-toggle v-model="rule.use"/>
                                        </q-item-section>
                                        <q-item-section side>
                                            <q-icon name="close"/>
                                        </q-item-section>
                                    </q-item>
                                </q-expansion-item>
                            </div>
                        </div>
                    </div>
                </q-card-section>

                <div style="display: flex;justify-content: space-between">
                    <q-card-actions align="left" class="text-primary">
                        <q-btn flat :label="t('favStationOnly')" v-close-popup @click="starOnly"/>
                    </q-card-actions>
                    <q-card-actions align="right" class="text-primary">
                        <q-btn flat :label="t('cancel')" v-close-popup @click="handleClose"/>
                        <q-btn flat :label="t('addRule')" v-close-popup @click="handleOk"/>
                    </q-card-actions>
                </div>

            </q-card>
        </q-dialog>
    </div>
</template>

<script setup>
import {computed, ref} from "vue";
import {useQuasar} from "quasar";
import {formatWeekday, getWeekdays} from "src/utils/time-utils";
import {useStore} from "vuex";
import {useI18n} from "vue-i18n";
import {arr2Map} from "src/utils/array-utils";

const store = useStore()
const lang = computed(() => {
    return store.getters['language/currentLanguage']
})
const $q = useQuasar()
const isDark = computed(() => $q.dark.isActive)
const _weekdays = getWeekdays(lang.value).map(((it, index) => {
    return {
        text: it,
        select: true,
        index
    }
}))
const weekdays = ref(_weekdays)
const stationMap = ref(new Map())
const conflictRuleId = ref(null)

const expandMap = ref(new Map())
const handleClickExpand = (stationRule) => {
    const stationId = stationRule.stationId;
    if (expandMap.value.has(stationId)) {
        expandMap.value.set(stationId, !expandMap.value.get(stationId))
    } else {
        expandMap.value.set(stationId, true)
    }
}
const rules = computed(() => {
    if (!props.station) return []
    const rawRules = store.getters['preference/curFavouriteRule'](props.station.railsystemCode)
    const groupByStationId = rawRules.reduce((acc, cur) => {
        if (acc.has(cur.stationId)) {
            acc.get(cur.stationId).push(cur)
        } else {
            acc.set(cur.stationId, [cur])
        }
        return acc
    }, new Map())

    loadStations(groupByStationId.keys())
    return Array.from(groupByStationId.entries().map(item => {
        return {
            stationId: item[0],
            rules: item[1],
        }
    }))
})
const props = defineProps({
    station: {
        type: Object,
    }
})
const loadStations = (stationIds) => {
    store.dispatch('railsystem/getStationByIds', {stationIds}).then(_stations => {
        stationMap.value = arr2Map(_stations, 'id')
    })
}
const starOnly = () => {
    const station = props.station;
    store.dispatch('preference/favourStation', {station}).then(_isFavouriteStation => {
        station.isFavourite = _isFavouriteStation
        if (_isFavouriteStation) {
            $q.notify.ok(t('favourStationOk'))
        }
        emit('close')
    })
}
const {t} = useI18n()
const emit = defineEmits(['close', 'add'])
const handleClose = () => {
    conflictRuleId.value = null
    emit('close')
}
const handleSelect = (dayOfWeek) => {
    if (dayOfWeek) {
        dayOfWeek.select = !dayOfWeek.select
    }
}
const isShow = computed(() => props.station != null)
const fromTime = ref('00:00')
const toTime = ref('23:59')
const validateTimeNotEquals = (val) => {
    return !(val === fromTime.value && val === toTime.value) || t('fromTimeCannotBeEqToTime')
}
const handleOk = () => {
    if (!props.station) return
    const selected = weekdays.value.filter(it => it.select).map(it => it.index + 1)
    if (selected.length === 0) {
        return;
    }
    store.dispatch('preference/addFavourStationRule', {
        station: props.station,
        fromTime: fromTime.value,
        toTime: toTime.value,
        period: selected
    }).then(_ => {
        $q.notify.ok('添加规则成功')
    }).catch(conflictRule => {
        $q.notify.info('添加规则失败, 规则存在冲突')
        console.log('conflict rule', conflictRule)
        conflictRuleId.value = conflictRule.id
        expandMap.value.set(conflictRule.stationId, true)
    })

}
</script>

<style scoped>
label {
    padding-bottom: 0;
}

.workday {
    color: var(--q-primary-d);
}

.weekend {
    color: var(--q-red);
}

.conflict-rule {
    color: var(--q-red);
}

.day-of-week-text {
    border-radius: 50%;
    padding: 5px;
    width: 20px;
    height: 20px;
    border: 1px solid var(--q-grey-2);
    transition: .5s;
}

.day-of-week-text:active {
    background-color: var(--q-grey-2);
}

.selected {
    border: 1px solid var(--q-primary-d);
}

.label-text {
    color: var(--q-primary-d);
    font-weight: bold;
    font-size: 14px;
}
</style>

