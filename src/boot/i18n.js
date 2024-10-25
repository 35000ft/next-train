// src/i18n.js
import {createI18n} from 'vue-i18n';
import {boot} from "quasar/wrappers";

const messages = {
  en: {
    nav: {
      station: 'Station',
      go: 'GO!',
      line: 'Line',
    }
  },
  cn: {
    nav: {
      station: '车站',
      go: '出行',
      line: '线路',
    }
  },
  hk: {
    nav: {
      station: '車站',
      go: '行程',
      line: '線路',
    }
  },
};

const languages = Object.keys(messages)

const i18n = createI18n({
  locale: 'cn', // 默认语言
  messages,
});
// 导出 boot 函数和 i18n 实例
export default boot(({app}) => {
  app.use(i18n); // 注册 i18n 实例
});

// 同时导出 i18n 实例
export {i18n};
