<script setup>
import { useAuthStore } from '../store/auth'
import { useRouter, RouterLink } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

const handleLogout = async () => {
    const confirmed = window.confirm("Are you sure you want to log out")
    if (confirmed) {

    await auth.logout()
    router.push('/login')
    }
}
</script>

<template>
  <nav class="bg-white shadow px-6 py-4 flex justify-between items-center">
    <!-- Logo -->
    <div class="text-xl font-bold text-gray-800">Blog</div>

    <!-- Links -->
    <div class="space-x-4 text-sm flex items-center">
      <RouterLink class="hover:underline" to="/">Home</RouterLink>

      <template v-if="!auth.user">
        <RouterLink class="hover:underline" to="/login">Login</RouterLink>
        <RouterLink class="hover:underline" to="/register">Register</RouterLink>
      </template>

      <template v-else>
        <RouterLink class="hover:underline" to="/dashboard">Dashboard</RouterLink>
        <RouterLink class="hover:underline" to="/profile">Profile</RouterLink>
        <button @click="handleLogout" class="text-red-500 hover:underline">Logout</button>
      </template>
    </div>
  </nav>
</template>

<style scoped>

</style>
