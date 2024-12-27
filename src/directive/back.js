export default {
    mounted(el, binding) {
        window.addEventListener('popstate', (event) => {
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
