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

  // Nese perdoruesi ka shkruar vetem konfirmimin pa passwordin
  if (confirmPassword.value && !password.value) {
    error.value = 'Please fill in the "New Password" field'
    return
  }

  // Nese password-et nuk perputhen
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
    await auth.getUser() // Rifreskojme user-in nga store
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to update profile.'
  }
}
</script>

<template>
  <div class="h-screen overflow-hidden bg-gray-50 px-4 pt-20">
    <div class="max-w-lg mx-auto bg-white shadow p-6 rounded-md">
      <h2 class="text-2xl font-bold mb-6 text-center">Update Profile</h2>

      <form @submit.prevent="handleUpdate" class="space-y-4">
        <!-- Full Name -->
        <div>
          <label class="block text-sm font-medium">Full Name</label>
          <input
            v-model="name"
            type="text"
            class="w-full p-2 border rounded"
            placeholder="Enter your full name"
          />
        </div>

        <!-- Email -->
        <div>
          <label class="block text-sm font-medium">Email</label>
          <input
            v-model="email"
            type="email"
            class="w-full p-2 border rounded"
            placeholder="Enter your email"
          />
        </div>

        <!-- New Password -->
        <div>
          <label class="block text-sm font-medium">New Password</label>
          <input
            v-model="password"
            type="password"
            class="w-full p-2 border rounded"
            placeholder="Leave empty to keep current"
          />
        </div>

        <!-- Confirm Password -->
        <div>
          <label class="block text-sm font-medium">Confirm Password</label>
          <input
            v-model="confirmPassword"
            type="password"
            class="w-full p-2 border rounded"
            placeholder="Repeat new password"
          />
        </div>

        <!-- Messages -->
        <div v-if="error" class="text-red-600 text-sm font-medium">{{ error }}</div>
        <div v-if="message" class="text-green-600 text-sm font-medium">{{ message }}</div>

        <!-- Submit button -->
        <button
          type="submit"
          class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full font-medium"
        >
          Save Changes
        </button>
      </form>

      <!-- Back to dashboard -->
      <RouterLink
        to="/dashboard"
        class="mt-4 inline-block text-center bg-gray-100 text-gray-700 px-4 py-2 rounded w-full font-medium hover:bg-gray-200 transition"
      >
        Back to your posts
      </RouterLink>
    </div>
  </div>
</template>
