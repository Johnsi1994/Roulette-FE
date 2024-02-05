import { createRouter, createWebHistory } from 'vue-router'
import OwnerView from '../views/OwnerView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: OwnerView
    },
    {
      path: '/player',
      name: 'player',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/PlayerView.vue')
    }
  ]
})

export default router
