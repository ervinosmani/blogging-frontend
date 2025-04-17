<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { useAuthStore } from '../store/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

// Gjendja per menyne mobile
const isOpen = ref(false)

// Funksioni per logout me konfirmim
const handleLogout = async () => {
  if (confirm('Are you sure you want to log out?')) {
    await auth.logout()
    router.push('/login')
  }
}

// Funksioni qe vendos klasen aktive per link
const linkClass = (path: string) => {
  return route.path === path
    ? 'text-purple-500 font-semibold'
    : 'text-gray-300 hover:text-purple-400 transition'
}
</script>

<template>
  <!-- Navbar sticky -->
  <header class="bg-neutral-900 text-white sticky top-0 z-50 shadow-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
      
      <!-- Logo -->
      <RouterLink to="/" class="text-2xl font-bold text-purple-500">
        Blog<span class="text-white">Platform</span>
      </RouterLink>

      <!-- Hamburger mobile -->
      <button
        class="sm:hidden text-gray-300 focus:outline-none"
        @click="isOpen = !isOpen"
        aria-label="Toggle menu"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      <!-- Menu desktop -->
      <nav class="hidden sm:flex items-center gap-6 text-sm">
        <RouterLink :to="'/'" :class="linkClass('/')">Home</RouterLink>

        <template v-if="!auth.user">
          <RouterLink :to="'/login'" :class="linkClass('/login')">Login</RouterLink>
          <RouterLink :to="'/register'" :class="linkClass('/register')">Register</RouterLink>
        </template>

        <template v-else>
          <RouterLink :to="'/dashboard'" :class="linkClass('/dashboard')">Dashboard</RouterLink>
          <button @click="handleLogout" class="text-red-400 hover:text-red-500 transition">
            Logout
          </button>
        </template>
      </nav>
    </div>

    <!-- Menu mobile -->
    <transition name="fade">
      <div
        v-if="isOpen"
        class="sm:hidden bg-neutral-800 px-6 py-4 border-t border-neutral-700 flex flex-col gap-4 text-sm"
      >
        <RouterLink :to="'/'" :class="linkClass('/')">Home</RouterLink>

        <template v-if="!auth.user">
          <RouterLink :to="'/login'" :class="linkClass('/login')">Login</RouterLink>
          <RouterLink :to="'/register'" :class="linkClass('/register')">Register</RouterLink>
        </template>

        <template v-else>
          <RouterLink :to="'/dashboard'" :class="linkClass('/dashboard')">Dashboard</RouterLink>
          <button @click="handleLogout" class="text-left text-red-400 hover:text-red-500">
            Logout
          </button>
        </template>
      </div>
    </transition>
  </header>
</template>

<style scoped>
/* Transicion smooth per fade */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
