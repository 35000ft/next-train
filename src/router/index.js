import {createRouter, createMemoryHistory, createWebHistory, createWebHashHistory} from 'vue-router'
import routes from './routes'
import {getUserDefaultLanguage, i18n} from "boot/i18n";
import {useStore} from "vuex";
/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

const router = createRouter({
    scrollBehavior: () => ({left: 0, top: 0}),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE)
})

// 在每次路由导航时设置 locale
router.beforeEach((to, from, next) => {
    const store = useStore()
    const lang = to.query.lang || getUserDefaultLanguage(); // 从路由查询参数获取语言
    store.dispatch('language/setLanguage', lang).then(() => {
    }).catch(error => {
        // 处理错误
        console.error('Error setting language:', error)
    });

    i18n.global.locale = lang;
    next();
});
export default router;
