<template>
     <span class="pill" v-for="(trainCategory,index) in _categories" :key="index"
           :style="{backgroundColor:trainCategory.bgColor}">
         {{ t(`trainCategory.${trainCategory.code}`) }}
     </span>
</template>

<script setup>
import {computed} from "vue";
import {TRAIN_CATEGORY} from "src/models/Train";
import {useI18n} from "vue-i18n";

const props = defineProps({
    categories: {
        type: Array,
        default: () => ["LOCAL"]
    },
    category: {
        type: String,
        default: "LOCAL"
    },
    maxWidth: {
        type: String,
        default: "40px"
    }
})
const {t} = useI18n()
const _categories = computed(() => {
    const defaultCategories = [TRAIN_CATEGORY.LOCAL]
    const categories = props.categories

    let result
    if (categories instanceof Array) {
        result = categories.map(it => TRAIN_CATEGORY[it]).filter(it => it !== undefined)
        if (result > 0) {
            return result
        } else {
            return defaultCategories
        }
    }
    if (typeof props.category === "string") {
        return [TRAIN_CATEGORY[props.category] || TRAIN_CATEGORY.LOCAL]
    }
    return defaultCategories
})

</script>

<style scoped>
.pill {
    height: 22px;
    font-size: 14px;
    text-align: center;
    padding-top: 0;
    padding-bottom: 0;
    min-width: 20px;
    max-width: 70px;
    margin-right: 3px;
    color: #ffffff;
    display: flex;
    justify-content: center;
    background-color: var(--q-primary);
    border-radius: 5px;
}
</style>
