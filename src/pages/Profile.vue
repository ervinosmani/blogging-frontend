<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../store/auth'
import api from '../api/api'

// Marrim perdoruesin nga store
const auth = useAuthStore()

// Inicializojme inputet me vlerat ekzistuese te perdoruesit
const name = ref(auth.user?.name || '')
const email = ref(auth.user?.email || '')
const password = ref('')
const confirmPassword = ref('')

// Mesazhet per sukses ose gabim
const message = ref('')
const error = ref('')

// Funksioni per perditesimin e profilit te perdoruesit
const handleUpdate = async () => {
  error.value = ''
  message.value = ''

  // Nese eshte mbushur vetem confirm password por jo passwordi
  if (confirmPassword.value && !password.value) {
    error.value = 'Please fill in the "New Password" field'
    return
  }

  // Nese fjalekalimet nuk perputhen
  if (password.value && password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }

  // Dergo kerkesen per perditesim te te dhenave
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
    await auth.getUser() // Rifresko te dhenat nga serveri
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to update profile.'
  }
}
</script>

<template>
  <div class="min-h-screen bg-neutral-950 flex items-center justify-center px-4 py-16">
    <div class="w-full max-w-lg bg-neutral-900 border border-neutral-800 shadow-xl rounded-xl p-8 space-y-6">
      
      <!-- Titulli i faqes -->
      <h2 class="text-2xl font-bold text-white text-center">Update Profile</h2>

      <!-- Forma per perditesim -->
      <form @submit.prevent="handleUpdate" class="space-y-5">
        
        <!-- Emri -->
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

        <!-- Fjalekalimi i ri -->
        <div>
          <label class="block text-sm text-gray-300 mb-1">New Password</label>
          <input
            v-model="password"
            type="password"
            placeholder="Leave empty to keep current"
            class="w-full bg-neutral-800 border border-neutral-700 rounded px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>

        <!-- Konfirmimi i fjalekalimit -->
        <div>
          <label class="block text-sm text-gray-300 mb-1">Confirm Password</label>
          <input
            v-model="confirmPassword"
            type="password"
            placeholder="Repeat new password"
            class="w-full bg-neutral-800 border border-neutral-700 rounded px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>

        <!-- Mesazhe per gabim ose sukses -->
        <div v-if="error" class="text-red-500 text-sm font-medium">{{ error }}</div>
        <div v-if="message" class="text-green-500 text-sm font-medium">{{ message }}</div>

        <!-- Butoni per ruajtje -->
        <button
          type="submit"
          class="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition font-semibold"
        >
          Save Changes
        </button>
      </form>

      <!-- Link per t'u kthyer ne dashboard -->
      <RouterLink
        to="/dashboard"
        class="block text-center mt-4 text-sm text-gray-400 hover:text-white hover:underline"
      >
        ← Back to your posts
      </RouterLink>
    </div>
  </div>
</template>
