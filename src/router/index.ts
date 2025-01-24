import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { PATH } from '@/utils/path'
import { createRouter, createWebHistory } from 'vue-router'
import NotFoundComponent from '../components/errors/NotFoundComponent.vue'

const routes = [
  {
    path: PATH.home,
    component: DefaultLayout,
    redirect: PATH.home,
    children: [
      {
        path: PATH.home,
        name: 'home',
        component: () => import('../modules/rank/application/views/HomeView.vue')
      },
      {
        path: PATH.flow,
        name: 'flow',
        component: () => import('../modules/rank/application/views/Flow/FlowView.vue')
      },
      {
        path: `${PATH.result}/:id`,
        name: 'result',
        props: true,
        component: () => import('../modules/rank/application/views/Result/ResultView.vue')
      },
      { path: '/:pathMatch(.*)', name: 'notFoundComponent', component: NotFoundComponent }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    // always scroll to top
    return { top: 0 }
  }
})

export default router
