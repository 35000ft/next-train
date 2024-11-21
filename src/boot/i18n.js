// src/i18n.js
import {createI18n} from 'vue-i18n';
import {boot} from "quasar/wrappers";
import en from '../i18n/en';
import zhHans from "src/i18n/zhHans";
import zhHant from "src/i18n/zhHant";

const messages = {
    en: en,
    'zh-Hans': zhHans,
    'zh-Hant': zhHant,
};

const languages = Object.keys(messages)

//TODO
const mapLanguage = (language) => {
    if (['zh-CN', 'zh-SG', 'zh-MY'].includes(language)) {
        return 'zh-Hans'
    }
    if (['zh-TW', 'zh-HK', 'zh-MO'].includes(language)) {
        return 'zh-Hant'
    }
    return 'en'
}

const defaultLanguage = mapLanguage(navigator.language)
console.log("User Language:", navigator.language, 'Map Language:', defaultLanguage);

const getUserDefaultLanguage = () => {
    return mapLanguage(navigator.language)
}

const i18n = createI18n({
    local: defaultLanguage,
    messages,
});
// 导出 boot 函数和 i18n 实例
export default boot(({app}) => {
    app.use(i18n); // 注册 i18n 实例
});

// 同时导出 i18n 实例
export {i18n, getUserDefaultLanguage};
