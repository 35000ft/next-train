import {boot} from 'quasar/wrappers';
import Vuex from 'vuex';
import store from '../store'; // 引入你的 Vuex store

export default boot(({app}) => {
  app.use(Vuex);
  app.config.globalProperties.$store = store; // 将 store 挂载到全局属性
});
