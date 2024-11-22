<template>
    <bottom-modal :display="display" @close="handleCloseSelector" content-height="95vh" content-width="100%"
                  :after-close="afterClose"
                  @touchstart.stop name="trainInfoDetailView">
    </bottom-modal>
</template>

<script>
import BottomModal from "components/BottomModal.vue";
import {defineComponent, onMounted, ref, watch} from "vue";
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
            type: String
        }
    },
    setup(props, {emit}) {
        const store = useStore()
        const loading = ref(true)
        const trainInfo = ref(null)
        const trainInfoId = ref(null)
        const display = ref(false)
        const route = useRoute()
        const router = useRouter()
        let prefix = null
        onMounted(() => {
            if (route.params.id) {
                trainInfoId.value = route.params.id
                if (route.params.prefix === '') {
                    prefix = '/'
                } else {
                    prefix = '/' + route.params.prefix.join('/')
                }
            }
            if (props.trainInfoProp) {
                trainInfo.value = props.trainInfoProp
            } else if (props.trainInfoIdProp) {
                trainInfoId.value = props.trainInfoIdProp
            }
        })
        watch(() => props.trainInfoIdProp, (newVal, oldValue) => {
            trainInfoId.value = newVal
        })
        watch(trainInfoId, (newVal, oldValue) => {
            if (newVal) {
                show()
                loading.value = true
            }
        })

        const handleCloseSelector = () => {
            display.value = false
        }

        function afterClose() {
            if (prefix) {
                router.push(prefix)
            }
            emit('close')
        }

        const show = () => {
            display.value = true
        }

        return {
            handleCloseSelector, show, display, afterClose
        }
    }

})
</script>
<style scoped>

</style>
