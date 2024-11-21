<template>
    <div @click="handleShowDetail">
        <span v-overflow-auto-scroll style="display: block;"> {{ trainData.terminal }}</span>
    </div>
</template>

<script setup>
import {useRouter} from "vue-router";
import {inject} from 'vue';

const router = useRouter()

const props = defineProps({
    trainData: {
        type: Object
    }
})
const notify = inject('showTrainInfoDetailView')

const handleShowDetail = () => {
    // const base = window.location.hash.slice(2)
    // const url = base + `/train-info/${props.trainData.id}`;
    // router.push(url.toString())
    notify(props.trainData.id.toString())
}

</script>

<style scoped>

</style>
