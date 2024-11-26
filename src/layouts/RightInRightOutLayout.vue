<template>
    <router-view v-slot="{ Component, route }">
        <transition name="right-in-right-out">
            <component :is="Component" :key="route.path"/>
        </transition>
    </router-view>
</template>

<script setup>

</script>

<style scoped>

</style>
