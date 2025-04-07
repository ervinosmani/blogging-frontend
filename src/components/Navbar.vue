<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { useAuthStore } from '../store/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

// Toggle per hamburger menu ne mobile
const isOpen = ref(false)

// Logout me konfirmim
const handleLogout = async () => {
  if (confirm('Are you sure you want to log out?')) {
    await auth.logout()
    router.push('/login')
  }
}

// Funksion qe kthen klasen aktive per link
const linkClass = (path: string) => {
  return route.path === path
    ? 'text-blue-600 font-semibold'
    : 'text-gray-700 hover:text-blue-600'
}
</script>

<template>
  <!-- Sticky navbar ne krye te faqes -->
  <nav class="bg-white shadow-md sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
      
      <!-- Logo (e thjeshte, jo klikues) -->
      <div class="text-2xl font-bold text-blue-600 tracking-tight select-none">
        Blog<span class="text-gray-800">Platform</span>
      </div>

      <!-- Hamburger per mobile -->
      <button
        class="sm:hidden text-gray-700 focus:outline-none"
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

      <!-- Linket (desktop) -->
      <div class="hidden sm:flex space-x-6 items-center text-sm font-medium">
        <RouterLink :to="'/'" :class="linkClass('/')">Home</RouterLink>

        <template v-if="!auth.user">
          <RouterLink :to="'/login'" :class="linkClass('/login')">Login</RouterLink>
          <RouterLink :to="'/register'" :class="linkClass('/register')">Register</RouterLink>
        </template>

        <template v-else>
          <RouterLink :to="'/dashboard'" :class="linkClass('/dashboard')">Dashboard</RouterLink>
          <button @click="handleLogout" class="text-red-500 hover:text-red-600">
            Logout
          </button>
        </template>
      </div>
    </div>

    <!-- Mobile menu dropdown -->
    <transition name="fade">
      <div
        v-if="isOpen"
        class="sm:hidden bg-white px-6 py-4 border-t border-gray-200 space-y-4 text-sm font-medium flex flex-col"
      >
        <RouterLink :to="'/'" :class="linkClass('/')">Home</RouterLink>

        <template v-if="!auth.user">
          <RouterLink :to="'/login'" :class="linkClass('/login')">Login</RouterLink>
          <RouterLink :to="'/register'" :class="linkClass('/register')">Register</RouterLink>
        </template>

        <template v-else>
          <RouterLink :to="'/dashboard'" :class="linkClass('/dashboard')">Dashboard</RouterLink>
          <button @click="handleLogout" class="text-left text-red-500 hover:text-red-600">
            Logout
          </button>
        </template>
      </div>
    </transition>
  </nav>
</template>

<style scoped>
/* Transicion smooth per animacionet */
[v-cloak] {
  display: none;
}

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
