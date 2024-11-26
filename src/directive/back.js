export default {
    mounted(el, binding) {
        window.addEventListener('popstate', (event) => {
            (binding.value)()
        })
    },
    unmounted(el, binding) {
        window.removeEventListener('popstate', binding.value)
    },
};
