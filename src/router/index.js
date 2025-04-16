// src/router/index.js
import { createRouter, createWebHistory } from "vue-router"
import { useAuthStore } from '../store/auth'

// Layouts
import AppLayout from '../layouts/AppLayout.vue'
import DashboardLayout from '../layouts/DashboardLayout.vue'

// Public Pages
import Home from "../pages/Home.vue"
import Login from "../pages/Login.vue"
import Register from "../pages/Register.vue"
import PostDetail from "../pages/posts/PostDetail.vue"

// Private Pages
import Dashboard from "../pages/Dashboard.vue"
import Profile from "../pages/Profile.vue"
import CreatePost from "../pages/posts/CreatePost.vue"
import EditPost from "../pages/posts/EditPost.vue"

// Guard
const requireAuth = (to, from, next) => {
  const auth = useAuthStore()
  if (!auth.user) {
    next('/login')
  } else {
    next()
  }
}

const routes = [
  // PUBLIC LAYOUT
  {
    path: '/',
    component: AppLayout,
    children: [
      { path: '', component: Home },
      { path: 'login', component: Login },
      { path: 'register', component: Register },
      { path: 'posts/:slug', component: PostDetail },
    ]
  },

  // DASHBOARD LAYOUT (PRIVATE)
  {
    path: '/',
    component: DashboardLayout,
    beforeEnter: requireAuth,
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'profile', component: Profile },
      { path: 'posts/create', component: CreatePost },
      { path: 'posts/:slug/edit', component: EditPost },
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
