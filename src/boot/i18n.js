// src/i18n.js
import {createI18n} from 'vue-i18n';
import {boot} from "quasar/wrappers";
import en from '../i18n/en';
import zhHans from "src/i18n/zhHans";
import zhHant from "src/i18n/zhHant";

const supportedLanguages = [
    {
        code: 'en',
        name: 'English'
    }, {
        code: 'zh-Hans',
        name: '简体中文'
    }, {
        code: 'zh-Hant',
        name: '繁體中文'
    },
]
const messages = {
    en: en,
    'zh-Hans': zhHans,
    'zh-Hant': zhHant,
};

//TODO
const mapLanguage = (language) => {
    if (typeof language !== "string") {
        return mapLanguage(navigator.language)
    }
    language = language.toLowerCase()
    if (['zh-cn', 'zh-sg', 'zh-my', 'zh', 'zh-hans', 'cn', 'sg', 'my'].includes(language)) {
        return 'zh-Hans'
    }
    if (['zh-tw', 'zh-hk', 'zh-mo', 'hk', 'tw'].includes(language)) {
        return 'zh-Hant'
    }
    const isSupportedLang = Object.keys(messages).findIndex(it => it.toLowerCase() === language.toLowerCase()) !== -1
    if (isSupportedLang) {
        return language
    } else {
        console.log(`Unsupported lang:${language}, use English`)
        return 'en'
    }
}

const defaultLanguage = mapLanguage(navigator.language)
console.log('defaultLang:', defaultLanguage)
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
export {i18n, getUserDefaultLanguage, mapLanguage, supportedLanguages};
