<template>
    <div>
        <div class="header-wrapper">
            <span @click="handleClose" class="close" style="font-size: 30px;font-weight:bold;">
                <i class="fa fa-arrow-left"></i>
            </span>
        </div>
        <router-view v-slot="{ Component, route }">
            <transition name="right-in-right-out">
                <component :is="Component" :key="route.path"/>
            </transition>
        </router-view>
    </div>

</template>

<script setup>
const handleClose = () => {

}
</script>

<style scoped>
.header-wrapper {
    margin-top: 10px;
    display: flex;
    padding-left: 10px;
    padding-right: 10px;
    justify-content: center;
}

</style>
