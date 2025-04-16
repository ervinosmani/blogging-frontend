<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../store/auth'
import api from '../api/api'

// Marrim user-in nga store
const auth = useAuthStore()

// Inicializojme inputet me vlerat ekzistuese
const name = ref(auth.user?.name || '')
const email = ref(auth.user?.email || '')
const password = ref('')
const confirmPassword = ref('')

// Mesazhe te gjendjes
const message = ref('')
const error = ref('')

// Funksioni per perditesim te profilit
const handleUpdate = async () => {
  error.value = ''
  message.value = ''

  if (confirmPassword.value && !password.value) {
    error.value = 'Please fill in the "New Password" field'
    return
  }

  if (password.value && password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }

  try {
    await api.put('/api/user', {
      name: name.value,
      email: email.value,
      ...(password.value && {
        password: password.value,
        password_confirmation: confirmPassword.value
      })
    })

    message.value = 'Profile updated successfully!'
    password.value = ''
    confirmPassword.value = ''
    await auth.getUser()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to update profile.'
  }
}
</script>

<template>
  <div class="min-h-screen bg-neutral-950 flex items-center justify-center px-4 py-16">
    <div class="w-full max-w-lg bg-neutral-900 border border-neutral-800 shadow-xl rounded-xl p-8 space-y-6">
      <!-- Titulli -->
      <h2 class="text-2xl font-bold text-white text-center">Update Profile</h2>

      <!-- Forma e profilit -->
      <form @submit.prevent="handleUpdate" class="space-y-5">
        <!-- Name -->
        <div>
          <label class="block text-sm text-gray-300 mb-1">Full Name</label>
          <input
            v-model="name"
            type="text"
            placeholder="Enter your name"
            class="w-full bg-neutral-800 border border-neutral-700 rounded px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>

        <!-- Email -->
        <div>
          <label class="block text-sm text-gray-300 mb-1">Email</label>
          <input
            v-model="email"
            type="email"
            placeholder="Enter your email"
            class="w-full bg-neutral-800 border border-neutral-700 rounded px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>

        <!-- New Password -->
        <div>
          <label class="block text-sm text-gray-300 mb-1">New Password</label>
          <input
            v-model="password"
            type="password"
            placeholder="Leave empty to keep current"
            class="w-full bg-neutral-800 border border-neutral-700 rounded px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>

        <!-- Confirm Password -->
        <div>
          <label class="block text-sm text-gray-300 mb-1">Confirm Password</label>
          <input
            v-model="confirmPassword"
            type="password"
            placeholder="Repeat new password"
            class="w-full bg-neutral-800 border border-neutral-700 rounded px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>

        <!-- Mesazhe -->
        <div v-if="error" class="text-red-500 text-sm font-medium">{{ error }}</div>
        <div v-if="message" class="text-green-500 text-sm font-medium">{{ message }}</div>

        <!-- Butoni -->
        <button
          type="submit"
          class="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition font-semibold"
        >
          Save Changes
        </button>
      </form>

      <!-- Kthehu te postimet -->
      <RouterLink
        to="/dashboard"
        class="block text-center mt-4 text-sm text-gray-400 hover:text-white hover:underline"
      >
        ← Back to your posts
      </RouterLink>
    </div>
  </div>
</template>
