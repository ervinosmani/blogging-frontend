<!-- src/components/DashboardSidebar.vue -->
<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'

const auth = useAuthStore()
const router = useRouter()

const logout = async () => {
  const confirmed = confirm('Are you sure you want to log out?')
  if (!confirmed) return

  await auth.logout()
  router.push('/login')
}
</script>

<template>
    <div class="bg-gray-800 text-white w-full sm:w-64 min-h-screen flex flex-col justify-between p-6">
      <!-- TOP MENU -->
      <div>
        <h2 class="text-2xl font-bold mb-4">Dashboard</h2>
        <nav class="flex flex-col gap-3 text-sm">
          <RouterLink to="/" class="hover:text-blue-400" active-class="text-blue-400 font-semibold">Home</RouterLink>
          <RouterLink to="/dashboard" class="hover:text-blue-400" active-class="text-blue-400 font-semibold">My Posts</RouterLink>
          <RouterLink to="/posts/create" class="hover:text-blue-400" active-class="text-blue-400 font-semibold">Create New</RouterLink>
          <RouterLink to="/profile" class="hover:text-blue-400" active-class="text-blue-400 font-semibold">Profile</RouterLink>
        </nav>
      </div>
  
      <!-- LOGOUT always bottom -->
      <button @click="logout" class="text-red-400 hover:text-red-600 text-left mt-6">
        Logout
      </button>
    </div>
  </template>
  
