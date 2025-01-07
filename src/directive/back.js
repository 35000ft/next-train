import {md5} from "src/utils/crypto_utils";

const eventMap = new Map();
export default {
    mounted(el, binding) {
        const elMd5 = md5(el.outerHTML)
        if (eventMap.has(elMd5)) return
        window.addEventListener('popstate', (event) => {
            eventMap.set(elMd5, true)
            return (binding.value)({
                from: event.state.forward,
                to: event.state.current
            })
        })
    },
    unmounted(el, binding) {
        window.removeEventListener('popstate', binding.value)
    },
};
