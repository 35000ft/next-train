// store/modules/language.js
import axios from "axios";
import dayjs from "dayjs";
import {mapLanguage} from "boot/i18n";

const LS_LANGUAGE = 'CurLanguage'

const state = {
    currentLanguage: localStorage.getItem(LS_LANGUAGE) || mapLanguage(navigator.language),
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
        if (dayjsLang && dayjsLang !== 'en') {
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
