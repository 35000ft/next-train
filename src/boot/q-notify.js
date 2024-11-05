import {boot} from 'quasar/wrappers';

export default boot(({app}) => {
  // 设置 Quasar Notify 的默认配置
  app.config.globalProperties.$q.notify.setDefaults({
    position: 'bottom',    // 默认位置
    timeout: 3000,            // 默认显示时间
    color: 'primary',        // 默认背景色
    textColor: 'white',       // 默认文字颜色
    icon: 'info',
    offset: [0, 100],
  });
});
