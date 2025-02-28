<template>
    <router-view/>
    <div style="height: 40px;">
        <!-- Google AdSense 广告 -->
        <ins class="adsbygoogle"
             style="display:block"
             data-ad-client="ca-pub-5910846206073431"
             data-ad-slot="9881278344"
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
    </div>
    <OverlayContainer/>
</template>

<script setup>
import {onMounted} from "vue";
import {useQuasar} from "quasar";
import OverlayContainer from "layouts/OverlayContainer.vue";

defineOptions({
    name: 'App'
});
const $q = useQuasar()

onMounted(() => {
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--q-primary').trim()
    if (!$q.dark.isActive) {
        document.documentElement.style.setProperty('--q-primary-d', primaryColor);
    } else {
        document.documentElement.style.setProperty('--q-normal', '#ffffff');
        document.documentElement.style.setProperty('--q-background', '#3e3e3e');
        document.documentElement.style.setProperty('--q-background-grey', '#222222');
        document.documentElement.style.setProperty('--q-background-grey-2', '#222222');
        document.documentElement.style.setProperty('--q-grey', '#dcdcdc');
    }

    initGoogleAd()
})

const initGoogleAd = async () => {
    if (document.querySelector(`script[id="googleAdScript"]`)) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
    }
}
</script>
