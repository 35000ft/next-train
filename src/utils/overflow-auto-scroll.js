// auto-scroll.js
export default {
    mounted(el) {
        // 检查元素是否超出容器
        const checkOverflow = () => {
            const containerWidth = el.offsetWidth; // 容器宽度
            const contentWidth = el.scrollWidth;  // 内容实际宽度

            if (contentWidth > containerWidth) {
                el.classList.add("auto-scroll-content"); // 添加类名
            }
            // else {
            //     el.classList.remove("auto-scroll-content"); // 移除类名
            // }
        };

        // 初次检测
        checkOverflow();

        // 可选：监听窗口大小变化以重新检测
        const resizeObserver = new ResizeObserver(() => checkOverflow());
        resizeObserver.observe(el);

        // 保存监听器以便销毁时清理
        el.__resizeObserver__ = resizeObserver;
    },
    unmounted(el) {
        // 清理观察器
        if (el.__resizeObserver__) {
            el.__resizeObserver__.disconnect();
            delete el.__resizeObserver__;
        }
    },
};
