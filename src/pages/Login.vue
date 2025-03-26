<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../store/auth'

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const auth = useAuthStore()

const handleLogin = async () => {
  error.value = ''
  loading.value = true
  try {
    await auth.login({ email: email.value, password: password.value })
  } catch (err) {
    console.log(err)
    if (err.response?.data?.message) {
      error.value = err.response.data.message
    } else if (err.message) {
      error.value = err.message
    } else {
      error.value = 'An unknown error occurred during login.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-md mx-auto mt-10 bg-white p-8 rounded-lg shadow-md border">
    <h2 class="text-2xl font-bold mb-6 text-center text-gray-800">Sign in to your account</h2>
    <form @submit.prevent="handleLogin" class="space-y-5">
      <div>
        <label class="block mb-1">Email</label>
        <input v-model="email" type="email" class="w-full border p-2 rounded" required />
      </div>
      <div>
        <label class="block mb-1">Password</label>
        <input v-model="password" type="password" class="w-full border p-2 rounded" required />
      </div>
      <div v-if="error" class="text-red-600 text-sm">{{ error }}</div>
      <button :disabled="loading" class="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
        {{ loading ? 'Signing in...' : 'Sign In' }}
      </button>
    </form>
  </div>
</template>
