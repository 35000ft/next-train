<template>
    <div>
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
</template>
<script setup>
import {getWeekdays} from "src/utils/time-utils";
import {computed, ref, watch} from "vue";
import {useStore} from "vuex";

const store = useStore()
const emit = defineEmits(['update:modelValue'])
const props = defineProps({
    modelValue: Array,
})
const lang = computed(() => {
    return store.getters['language/currentLanguage']
})
watch(() => props.modelValue, val => {
    if (val instanceof Array) {
        const selectedIndex = val.map(it => {
            const number = Number(it)
            if (!isNaN(number)) {
                if (number > 0 && number <= 7) {
                    return number - 1
                }
            }
            return null
        }).filter(it => it != null)
        if (selectedIndex?.length > 0) {
            weekdays.value.forEach(it => it.select = false)
            selectedIndex.forEach(index => {
                weekdays.value[index].select = true
            })
        }

    }
})
const handleSelect = (dayOfWeek) => {
    if (dayOfWeek) {
        dayOfWeek.select = !dayOfWeek.select
    }
    const selectedDays = weekdays.value.filter(it => !!it.select).map(it => it.index + 1)
    emit('update:modelValue', selectedDays)
}
const _weekdays = getWeekdays(lang.value).map(((it, index) => {
    return {
        text: it,
        select: true,
        index
    }
}))
const weekdays = ref(_weekdays)

</script>

<style scoped>
.workday {
    color: var(--q-primary-d);
}

.weekend {
    color: var(--q-red);
}

.day-of-week-text {
    border-radius: 50%;
    padding: 5px;
    width: 35px;
    height: 35px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    border: 1px solid var(--q-grey-2);
    transition: .5s;
}

.day-of-week-text:active {
    background-color: var(--q-grey-2);
}

.selected {
    border: 1px solid var(--q-primary-d);
}

</style>
