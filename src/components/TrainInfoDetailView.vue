<template>
    <bottom-modal :display="display" @close="handleCloseSelector" content-height="95vh"
                  :after-close="afterClose"
                  @touchstart.stop name="trainInfoDetailView">
    </bottom-modal>
</template>

<script>
import BottomModal from "components/BottomModal.vue";
import {defineComponent, onMounted, ref} from "vue";
import {useStore} from "vuex";
import {useRoute, useRouter} from "vue-router";

export default defineComponent({
    components: {BottomModal},
    props: {
        trainInfoProp: {
            type: Object,
            default: null
        },
        trainInfoIdProp: {
            type: String,
            default: null
        }
    },
    setup(props, {emit}) {
        const store = useStore()
        const trainInfo = ref(null)
        const display = ref(false)
        const route = useRoute()
        const router = useRouter()
        let prefix = null
        onMounted(() => {
            console.log('trainInfoDetailView init', props)
            const routeId = route.params.id
            prefix = '/' + route.params.prefix.join('/')
            if (routeId) {
                showSelector()
            }
            if (props.trainInfoProp) {
                trainInfo.value = this.props.trainInfoProp
            } else if (props.trainInfoIdProp) {
                store.dispatch('realtime/getTrainInfoById', this.props.trainInfoIdProp)
                    .then(res => {
                        console.log('load train info ok.')
                    })
            }
        })
        const handleCloseSelector = () => {
            display.value = false
        }

        function afterClose() {
            if (prefix) {
                console.log('pr', prefix)
                router.push(prefix)
            }
            emit('close')
        }

        const showSelector = () => {
            display.value = true
        }

        return {
            handleCloseSelector, showSelector, display, afterClose
        }
    }

})
</script>
<style scoped>

</style>
