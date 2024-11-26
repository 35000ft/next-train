const routes = [
    {
        path: '/',
        components: {
            default: () => import('layouts/MainLayout.vue'),
            // home:() => import('components/HomeNavView.vue'),
            // 'metro-go': () => import('components/MetroGoNavView.vue'),
            // lines:() => import('components/LinesNavView.vue'),
        },
        children: [
            {name: 'home', path: '', component: () => import('components/HomeNavView.vue')},
            {name: 'metro-go', path: 'metro-go', component: () => import('components/MetroGoNavView.vue')},
            {name: 'lines', path: 'lines', component: () => import('components/LinesNavView.vue')},
            {
                name: 'train-info-detail',
                path: '/:prefix*/train-info/:id*',
                component: () => import('components/TrainInfoDetailView.vue')
            }
        ]
    },

    {
        path: '/detail',
        name: 'detail',
        components: {
            default: () => import('layouts/RightInRightOutLayout.vue')
        },
        children: [
            {
                name: 'station-detail',
                path: 'station/:id',
                component: () => import('components/StationDetailView.vue')
            }
        ]
    },
    // Always leave this as last one,
    // but you can also remove it
    {
        path: '/:catchAll(.*)*',
        redirect: '/'  // 重定向到根路径
    },
]

export default routes
