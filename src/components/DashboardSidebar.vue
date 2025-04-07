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
  <div class="bg-gray-800 text-white w-64 min-h-screen flex flex-col justify-between px-6 pt-8 pb-8">
    <!-- TOP MENU -->
    <div>
      <h2 class="text-2xl font-bold mb-8 ml-2">Dashboard</h2>
      <nav class="flex flex-col gap-5 text-sm ml-2">
        <RouterLink to="/" class="hover:text-blue-400" active-class="text-blue-400 font-semibold">Home</RouterLink>
        <RouterLink to="/dashboard" class="hover:text-blue-400" active-class="text-blue-400 font-semibold">My Posts</RouterLink>
        <RouterLink to="/posts/create" class="hover:text-blue-400" active-class="text-blue-400 font-semibold">Create New</RouterLink>
        <RouterLink to="/profile" class="hover:text-blue-400" active-class="text-blue-400 font-semibold">Profile</RouterLink>
      </nav>
    </div>

    <!-- Logout pak me lart dhe majtas -->
    <div class="mt-10 ml-2">
      <button @click="logout" class="text-red-400 hover:text-red-600 text-left">
        Logout
      </button>
    </div>
  </div>
</template>
