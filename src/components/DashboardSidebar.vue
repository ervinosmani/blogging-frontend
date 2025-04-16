<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'

const auth = useAuthStore()
const router = useRouter()

// Funksioni per logout me konfirmim
const logout = async () => {
  const confirmed = confirm('Are you sure you want to log out?')
  if (!confirmed) return

  await auth.logout()
  router.push('/login')
}
</script>

<template>
  <!-- Sidebar me gradient te erret -->
  <div class="w-64 min-h-screen bg-gradient-to-b from-black via-neutral-900 to-purple-900 text-white flex flex-col justify-between px-6 pt-10 pb-6 shadow-lg">
    
    <!-- Logo ose emer -->
    <div>
      <h2 class="text-2xl font-bold mb-10 text-purple-400 select-none">My Dashboard</h2>

      <!-- Linket -->
      <nav class="flex flex-col gap-6 text-sm">
        <RouterLink
          to="/"
          class="flex items-center gap-3 hover:text-purple-400 transition"
          active-class="text-purple-400 font-semibold"
        >
          <i class="fas fa-home w-4"></i> Home
        </RouterLink>

        <RouterLink
          to="/dashboard"
          class="flex items-center gap-3 hover:text-purple-400 transition"
          active-class="text-purple-400 font-semibold"
        >
          <i class="fas fa-list w-4"></i> My Posts
        </RouterLink>

        <RouterLink
          to="/posts/create"
          class="flex items-center gap-3 hover:text-purple-400 transition"
          active-class="text-purple-400 font-semibold"
        >
          <i class="fas fa-pen w-4"></i> Create Post
        </RouterLink>

        <RouterLink
          to="/profile"
          class="flex items-center gap-3 hover:text-purple-400 transition"
          active-class="text-purple-400 font-semibold"
        >
          <i class="fas fa-user w-4"></i> Profile
        </RouterLink>
      </nav>
    </div>

    <!-- Logout button -->
    <div class="mt-10">
      <button
        @click="logout"
        class="flex items-center gap-2 text-red-400 hover:text-red-600 text-sm transition"
      >
        <i class="fas fa-sign-out-alt w-4"></i> Logout
      </button>
    </div>
  </div>
</template>
