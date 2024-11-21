export default {
    mounted(el, binding) {
        window.addEventListener('popstate', binding.value)
    },
    unmounted(el, binding) {
        window.removeEventListener('popstate', binding.value)
    },
};
