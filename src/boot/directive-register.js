import {boot} from 'quasar/wrappers';
import scrollToView from "src/utils/scroll-to-view";
import overflowAutoScroll from "src/utils/overflow-auto-scroll";

export default boot(({app}) => {
    // 全局注册指令
    app.directive('scroll-to-view', scrollToView);
    app.directive('overflow-auto-scroll', overflowAutoScroll);
});
