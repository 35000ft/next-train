const routes = [
    {
        path: '/',
        component: () => import('layouts/MainLayout.vue'),
        children: [
            {name: 'home', path: '', component: () => import('components/HomeNavView.vue')},
            {name: 'metro-go', path: 'metro-go', component: () => import('components/MetroGoNavView.vue')},
            {name: 'lines', path: 'lines', component: () => import('components/LinesNavView.vue')},
            {
                name: 'train-info-detail',
                path: ':prefix*/train-info/:id',
                component: () => import('components/TrainInfoDetailView.vue')
            },
            {
                name: 'station-detail',
                path: 'station/:id',
                component: () => import('layouts/OverlayContainer.vue'),
                meta: {
                    componentName: 'StationDetailView'
                }
            }
        ]
    },
    // Always leave this as last one,
    // but you can also remove it
    {
        path: '/:catchAll(.*)*',
        redirect: '/'
    },
]

export default routes
