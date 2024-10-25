const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {name: 'home', path: '/', component: () => import('components/HomeNavView.vue')},
      {name: 'metro-go', path: '/metro-go', component: () => import('components/MetroGoNavView.vue')},
      {name: 'lines', path: '/lines', component: () => import('components/LinesNavView.vue')},
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
