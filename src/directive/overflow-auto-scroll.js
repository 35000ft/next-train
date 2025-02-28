// overflow-auto-scroll.js
import _ from "lodash";

export default {
    mounted(el) {
        // Check content if width over the container size
        const checkOverflow = () => {
            if (el.offsetWidth === 0) return
            let contentWidth = el.scrollWidth;  // Actual width of content
            if (el.style.display === 'flex') {
                // If element is display as flex, the actual width is not the scrollWidth but the sum width of sub elements
                const childNodes = el.children;
                contentWidth = 0;
                for (const child of childNodes) {
                    const computedStyle = window.getComputedStyle(child)
                    const marginLeft = parseFloat(computedStyle.marginLeft)
                    const marginRight = parseFloat(computedStyle.marginRight)
                    contentWidth += child.offsetWidth + marginLeft + marginRight;
                }
                el.style.width = contentWidth + 'px'
                setTimeout(() => {
                    if (contentWidth < el.parentElement.clientWidth && el.parentElement.clientWidth > 0) {
                        if (el.classList.contains('auto-scroll-content')) {
                            el.classList.remove("auto-scroll-content");
                        }
                    } else {
                        el.classList.add("auto-scroll-content");
                    }
                }, _.random(300, 400))
                return
            }
            if (contentWidth > el.offsetWidth) {
                el.classList.add("auto-scroll-content");
            }
        };

        // First check
        checkOverflow();

        // Check if window resized
        const resizeObserver = new ResizeObserver(() => checkOverflow());
        resizeObserver.observe(el);

        // Save observer to destroy on unmounted
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
