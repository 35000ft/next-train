// src/boot/scrollToView.js
import {boot} from 'quasar/wrappers';
import scrollToView from "src/utils/scroll-to-view";


export default boot(({app}) => {
  // 全局注册指令
  app.directive('scroll-to-view', scrollToView);
});
