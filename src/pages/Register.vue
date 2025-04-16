<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../store/auth'

// Variablat per inputet e regjistrimit
const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')

// Per mesazhet e gabimit dhe ngarkimit
const error = ref('')
const loading = ref(false)

// Marrim auth store-in
const auth = useAuthStore()

// Funksioni per regjistrim
const handleRegister = async () => {
  error.value = ''

  // Kontroll per perputhjen e fjalekalimeve
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match.'
    return
  }

  if (password.value.length < 6) {
    error.value = 'Password must be at least 6 characters long.'
    return
  }

  loading.value = true
  try {
    await auth.register({
      name: name.value,
      email: email.value,
      password: password.value,
      password_confirmation: confirmPassword.value
    })
  } catch (err) {
    error.value = err.response?.data?.message || 'Error during registration.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-neutral-950 flex items-center justify-center px-4">
    <div class="w-full max-w-md bg-neutral-900 border border-neutral-800 p-8 rounded-xl shadow-xl">
      <!-- Titulli -->
      <h2 class="text-2xl font-bold text-white text-center mb-6">Create your account</h2>

      <!-- Forma per regjistrim -->
      <form @submit.prevent="handleRegister" class="space-y-5">
        <!-- Full Name -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
          <input
            v-model="name"
            type="text"
            class="w-full bg-neutral-800 border border-neutral-700 rounded px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
            placeholder="Enter your full name"
            required
          />
        </div>

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

        <!-- Confirm Password -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">Confirm Password</label>
          <input
            v-model="confirmPassword"
            type="password"
            class="w-full bg-neutral-800 border border-neutral-700 rounded px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
            placeholder="Repeat password"
            required
          />
        </div>

        <!-- Gabimi -->
        <div v-if="error" class="text-red-500 text-sm font-medium">{{ error }}</div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-md font-semibold transition disabled:opacity-50"
        >
          {{ loading ? 'Registering...' : 'Register' }}
        </button>
      </form>
    </div>
  </div>
</template>
