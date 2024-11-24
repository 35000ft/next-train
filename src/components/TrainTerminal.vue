<template>
    <div @click="handleShowDetail">
        <span v-overflow-auto-scroll style="display: block;"> {{ trainData.terminal }}</span>
    </div>
</template>

<script setup>

const props = defineProps({
    trainData: {
        type: Object
    }
})
const emit = defineEmits(['showTrainDetail'])
const handleShowDetail = () => {
    // notify(props.trainData.id.toString())
    emit('showTrainDetail', props.trainData.id.toString())
}

</script>

<style scoped>

</style>
