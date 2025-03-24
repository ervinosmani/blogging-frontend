<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../store/auth'

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const loading = ref(false)

const auth = useAuthStore()

const handleRegister = async () => {
  error.value = ''
  if (password.value !== confirmPassword.value) {
    error.value = 'Fjalëkalimet nuk përputhen'
    return
  }

  if (password.value.length < 6) {
    error.value = 'Fjalëkalimi duhet të ketë të paktën 6 karaktere'
    return
  }

  loading.value = true
  try {
    await auth.register({ name: name.value, email: email.value,password: password.value, password_confirmation: confirmPassword.value })
  } catch (err) {
    error.value = err.response?.data?.message || 'Gabim gjatë regjistrimit'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-md mx-auto mt-10 bg-white p-8 rounded-lg shadow-md border border-gray-200">
    <h2 class="text-2xl font-bold mb-6 text-gray-800 text-center">Krijo llogari të re</h2>

    <form @submit.prevent="handleRegister" class="space-y-5">
      <div>
        <label class="block mb-1 font-medium text-sm">Emri</label>
        <input v-model="name" type="text" class="w-full border-gray-300 border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" required />
      </div>

      <div>
        <label class="block mb-1 font-medium text-sm">Email</label>
        <input v-model="email" type="email" class="w-full border-gray-300 border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" required />
      </div>

      <div>
        <label class="block mb-1 font-medium text-sm">Fjalëkalimi</label>
        <input v-model="password" type="password" class="w-full border-gray-300 border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" required />
      </div>

      <div>
        <label class="block mb-1 font-medium text-sm">Konfirmo Fjalëkalimin</label>
        <input v-model="confirmPassword" type="password" class="w-full border-gray-300 border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" required />
      </div>

      <div v-if="error" class="text-red-600 text-sm">{{ error }}</div>

      <button :disabled="loading" type="submit" class="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition">
        {{ loading ? 'Duke regjistruar...' : 'Regjistrohu' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
</style>
