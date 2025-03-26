import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from '../store/auth'
import Home from "../pages/Home.vue";
import Login from "../pages/Login.vue";
import Register from "../pages/Register.vue";
import Dashboard from "../pages/Dashboard.vue";
import AppLayout from '../layouts/AppLayout.vue'
import Profile from "../pages/Profile.vue";

const requireAuth = (to, from, next) => {
    const auth = useAuthStore()
    if (!auth.user) {
      next('/login')
    } else {
      next()
    }
  }
  
const routes = [
    {
      path: '/',
      component: AppLayout,
      children: [
        { path: '', component: Home },
        { path: 'login', component: Login },
        { path: 'register', component: Register },
        { path: 'dashboard', component: Dashboard, beforeEnter: requireAuth },
        { path: 'profile', component: Profile, beforeEnter: requireAuth }
      ]
    }
  ]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router