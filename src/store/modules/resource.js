import {reactive} from "vue";
import LRU from "src/utils/LRU";
import axios from "src/utils/axios";


const state = {
    resourceMap: reactive(new LRU(100)),
}
const mutations = {
    SET_RESOURCE(state, {path, has}) {
        state.resourceMap.set(path, has)
    }
}
const actions = {
    async checkResourceExist({state, commit}, {path}) {
        const has = state.resourceMap.get(path);
        if (has === true || has === null) {
            const responsePath = await axios.head(path).then(res => {
                if (res.status === 200) {
                    return res.request.responseURL
                } else {
                    return null
                }
            }).catch(e => {
                console.error(e)
                return null
            })
            if (responsePath) {
                commit('SET_RESOURCE', {path: path, has: true})
                return Promise.resolve(responsePath)
            } else {
                commit('SET_RESOURCE', {path: path, has: false})
                return Promise.reject()
            }
        } else {
            return Promise.reject()
        }
    }
}
export default {
    namespaced: true,
    state,
    mutations,
    actions,
}
