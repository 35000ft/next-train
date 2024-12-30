// store/modules/language.js
import axios from "axios";
import dayjs from "dayjs";
import {mapLanguage} from "boot/i18n";

const LS_LANGUAGE = 'CurLanguage'


async function setDayjsLocale(dayjsLang) {
    if (dayjsLang && dayjsLang !== 'en') {
        console.log('Get dayjs locale', dayjsLang)
        const scriptId = 'DAY_LOCALE_SCRIPT'
        axios.get(`dayjs/locale/${dayjsLang}.js`).then(res => {
            const scriptElement = document.getElementById(scriptId)
            if (scriptElement) scriptElement.remove()
            const script = document.createElement('script')
            script.type = 'text/javascript'
            script.id = scriptId
            script.textContent = res.data
            document.head.appendChild(script)
            dayjs.locale(DAY_LOCALE)
        }).catch((error) => {
            console.error('Failed to load dayjs locale:', error)
            const scriptElement = document.getElementById(scriptId)
            if (scriptElement) scriptElement.remove()
        })
    } else {
        dayjs.locale('en')
    }
}

function initLanguage() {
    const curLang = localStorage.getItem(LS_LANGUAGE) || mapLanguage(navigator.language)
    const dayjsLang = curLang.split('-')[0]
    setDayjsLocale(dayjsLang).then(_ => {
        console.log('Init dayjs locale locale OK')
    })
    return curLang
}

const state = {
    currentLanguage: initLanguage(),
};


const mutations = {
    SET_LANGUAGE(state, language) {
        console.log('language change', language)
        state.currentLanguage = language;
        localStorage.setItem(LS_LANGUAGE, language)
    },
};

const actions = {
    setLanguage({commit, state}, {lang}) {
        if (state.currentLanguage === lang) {
            return
        }
        const dayjsLang = lang.split('-')[0]
        setDayjsLocale(dayjsLang).then(r => {
            console.log('Set dayjs locale OK, current:', dayjsLang)
        })
        commit('SET_LANGUAGE', lang);
    },
};

const getters = {
    currentLanguage: state => state.currentLanguage,
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters,
};
