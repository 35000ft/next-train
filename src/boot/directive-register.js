import {boot} from 'quasar/wrappers';
import scrollToView from "src/directive/scroll-to-view";
import overflowAutoScroll from "src/directive/overflow-auto-scroll";
import back from "src/directive/back";

export default boot(({app}) => {
    // 全局注册指令
    app.directive('scroll-to-view', scrollToView);
    app.directive('overflow-auto-scroll', overflowAutoScroll);
    app.directive('back', back);
});
