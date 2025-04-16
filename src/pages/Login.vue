<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../store/auth'

// Variablat per inpute dhe gjendje
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

// Marrim store-in e autentikimit
const auth = useAuthStore()

// Funksioni per t'u kycur
const handleLogin = async () => {
  error.value = ''
  loading.value = true
  try {
    await auth.login({ email: email.value, password: password.value })
  } catch (err: any) {
    if (err.response?.data?.message) {
      error.value = err.response.data.message
    } else {
      error.value = err.message || 'An unknown error occurred during login.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-neutral-950 flex items-center justify-center px-4">
    <div class="w-full max-w-md bg-neutral-900 border border-neutral-800 p-8 rounded-xl shadow-xl">
      <!-- Titulli -->
      <h2 class="text-2xl font-bold text-white text-center mb-6">Sign in to your account</h2>

      <!-- Notifikim pas regjistrimit -->
      <div
        v-if="$route.query.registered === 'true'"
        class="bg-green-600/10 text-green-400 text-sm mb-4 px-4 py-2 rounded"
      >
        Your account was created successfully. Please sign in.
      </div>

      <!-- Forma per kycje -->
      <form @submit.prevent="handleLogin" class="space-y-5">
        <!-- Email -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">Email</label>
          <input
            v-model="email"
            type="email"
            class="w-full bg-neutral-800 border border-neutral-700 rounded px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
            placeholder="Enter your email"
            required
          />
        </div>

        <!-- Password -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">Password</label>
          <input
            v-model="password"
            type="password"
            class="w-full bg-neutral-800 border border-neutral-700 rounded px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
            placeholder="Enter your password"
            required
          />
        </div>

        <!-- Gabimet -->
        <div v-if="error" class="text-red-500 text-sm font-medium">{{ error }}</div>

        <!-- Butoni per kycje -->
        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-md font-semibold transition disabled:opacity-50"
        >
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>
    </div>
  </div>
</template>
