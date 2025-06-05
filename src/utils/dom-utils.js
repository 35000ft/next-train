import domtoimage from "dom-to-image";

const easeInOutQuad = (t) => {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

export async function saveDomAsImage(domNode, filename = 'dom_node_screenshot', scale = 3) {
    domtoimage.toPng(domNode, {
        width: domNode.clientWidth * scale,
        height: domNode.clientHeight * scale,
        style: {
            transform: `scale(${scale})`,
            transformOrigin: 'top left'
        }
    })
        .then(dataUrl => {
            let a = document.createElement('a')
            a.href = dataUrl
            a.download = filename
            a.click()
        })
        .catch(error => {
            console.error(error)
        })
}

export const smoothScroll = (element, target, duration = 1000) => {
    const start = element.scrollTop;
    const distance = target - start;
    let startTime = null;

    const animateScroll = (currentTime) => {
        if (!startTime) startTime = currentTime;
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1); // 确保进度不超过1

        // 计算当前的滚动位置，使用缓动函数
        element.scrollTop = start + distance * easeInOutQuad(progress);

        if (elapsed < duration) {
            requestAnimationFrame(animateScroll);
        }
    };

    requestAnimationFrame(animateScroll);
};
