// src/i18n.js
import {createI18n} from 'vue-i18n';
import {boot} from "quasar/wrappers";

const messages = {
  en: {
    direction: "Towards",
    headers: {
      search: {
        placeholder: 'Station, Line...'
      }
    },
    nav: {
      home: 'Station',
      go: 'GO!',
      line: 'Line',
    },
    trainCategory: {
      locale: 'LOCALE',
      express: 'EXPRESS',
      nonstop: 'NON-STOP',
      through: 'THROUGH',
      short: 'SHORT',
      initial: 'INITIAL',
      terminal: 'TERMINAL',
      special: 'SPECIAL',
    },
    trainStatus: {
      arrived: "ARRIVED",
      departed: "DEPARTED",
      delayed: "DELAYED",
      exitService: "EXIT SERVICE",
    }
  },
  cn: {
    direction: "方向",
    headers: {
      search: {
        placeholder: '车站, 线路...'
      }
    },
    nav: {
      home: '车站',
      go: '出行',
      line: '线路',
    },
    trainCategory: {
      locale: '普通',
      express: '快车',
      nonstop: '直达',
      through: '贯通',
      short: '区间',
      initial: '始发',
      terminal: '终到',
      special: '特别',
    },
    trainStatus: {
      arrived: "列车到站",
      departed: "正在离开",
      delayed: "延误",
      exitService: "退出服务",
    }
  },
  hk: {
    direction: "方向",
    headers: {
      search: {
        placeholder: '車站, 線路...'
      }
    },
    nav: {
      home: '車站',
      go: '行程',
      line: '線路',
    },
    trainCategory: {
      locale: '普通',
      express: '快車',
      nonstop: '直達',
      through: '貫通',
      short: '短線',
      initial: '始發',
      terminal: '終到',
      special: '特別',
    },
    trainStatus: {
      arrived: "列車到站",
      departed: "正在離開",
      delayed: "延誤",
      exitService: "退出服務",
    }
  },
};

const languages = Object.keys(messages)

const mapLanguage = (language) => {
  if (['zh-CN', 'zh-SG', 'zh-MY'].includes(language)) {
    return 'cn'
  }
  if (['zh-TW', 'zh-HK', 'zh-MO'].includes(language)) {
    return 'hk'
  }
  return 'en'
}

const defaultLanguage = mapLanguage(navigator.language)
console.log("User Language:", navigator.language, 'Map Language:', defaultLanguage);

const getUserDefaultLanguage = () => {
  return mapLanguage(navigator.language)
}

const i18n = createI18n({
  locale: defaultLanguage,
  messages,
});
// 导出 boot 函数和 i18n 实例
export default boot(({app}) => {
  app.use(i18n); // 注册 i18n 实例
});

// 同时导出 i18n 实例
export {i18n, getUserDefaultLanguage};
