const routes = [
    {
        path: '/',
        component: () => import('layouts/MainLayout.vue'),
        children: [
            {name: 'home', path: '', component: () => import('components/view/HomeNavView.vue')},
            {
                name: 'metro-go', path: 'metro-go', component: () => import('components/view/MetroGoNavView.vue'),
                children: [
                    {
                        name: 'route-solution-overview',
                        path: 'solutions',
                        component: () => import('components/common/RouteDispatcher.vue'),
                        meta: {
                            componentName: 'RouteSolutionOverview'
                        }
                    },
                    {
                        name: 'route-solution-detail',
                        path: 'solutions/detail',
                        component: () => import('components/common/RouteDispatcher.vue'),
                        meta: {
                            componentName: 'RouteSolutionDetailView'
                        }
                    }
                ]
            },
            {name: 'lines', path: 'lines', component: () => import('components/view/LinesNavView.vue')},
            {
                name: 'train-info-detail',
                path: ':prefix*/train-info/:id',
                component: () => import('components/view/TrainInfoDetailView.vue')
            },
            {
                name: 'station-schedule-detail',
                path: 'station/schedule/:stationId/:lineId',
                component: () => import('components/common/RouteDispatcher.vue'),
                meta: {
                    componentName: 'StationScheduleDetailView'
                },
            },
            {
                name: 'station-detail',
                path: 'station/:id',
                component: () => import('components/common/RouteDispatcher.vue'),
                meta: {
                    componentName: 'StationDetailView'
                }
            },
            {
                name: '/manage',
                path: '/manage',
                component: () => import('pages/RailSystemManagePage.vue'),
            },
        ]
    },
    {
        name: 'login',
        path: '/users/login',
        component: () => import('pages/LoginPage.vue'),
    },
    // Always leave this as last one,
    // but you can also remove it
    {
        path: '/:catchAll(.*)*',
        redirect: '/'
    },
]

export default routes
