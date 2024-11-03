// scroll-to-view.js
import {smoothScrollToBottom} from "src/utils/dom-utils";

export default {
  mounted(el) {
    // 定义滚动到底部的函数
    const scrollToBottom = () => {
      smoothScrollToBottom(el, 600); // 调用平滑滚动函数
    };

    // 检查内容是否在视窗范围内
    const isInViewport = () => {
      return el.scrollHeight - el.scrollTop <= el.clientHeight + 1;  // 允许 1 像素的误差
    };

    // 创建观察者监听高度变化
    const observer = new MutationObserver(() => {
      if (!isInViewport()) {
        scrollToBottom();
      }
    });

    // 配置观察选项，监听子元素的变化和内容变化
    observer.observe(el, {childList: true, subtree: true, attributes: true, characterData: true});

    // 保存观察者实例，以便在销毁时断开观察
    el._observer = observer;
  },
  unmounted(el) {
    // 断开观察
    if (el._observer) {
      el._observer.disconnect();
      delete el._observer;
    }
  }
};
