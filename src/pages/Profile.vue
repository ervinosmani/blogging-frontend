<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../store/auth';
import api from '../api/api';

const auth = useAuthStore()

const name = ref(auth.user?.name || '')
const email = ref(auth.user?.email || '')
const password = ref('')
const confirmPassword = ref('')
const message = ref('')
const error = ref('')

const handleUpdate = async () => {
    error.value = ''
    message.value = ''

    if (password.value && password.value !== confirmPassword.value) {
        error.value = 'Passwords do not match'
        return
    }

    try {
        await api.put('/api/user', {
            name: name.value,
            email: email.value,
            ...(password.value && { password: password.value, password_confirmation: confirmPassword.value })
        })

        message.value = 'Profile updated successfully!'
        await auth.getUser() //refresh user-in ne store
    } catch (err: any) {
        error.value = err.response?.data?.message || 'Failed to update profile.'
    }
}
</script>

<template>
    <div class="max-w-lg mx-auto mt-10 bg-white shadow p-6 rounded-md">
        <h2 class="text-2xl font-bold mb-6">Update your profile</h2>
  
      <form @submit.prevent="handleUpdate" class="space-y-4">
        <div>
          <label class="block text-sm font-medium">Full Name</label>
          <input v-model="name" type="text" class="w-full p-2 border rounded" />
        </div>
  
        <div>
          <label class="block text-sm font-medium">Email</label>
          <input v-model="email" type="email" class="w-full p-2 border rounded" />
        </div>
  
        <div>
          <label class="block text-sm font-medium">New Password</label>
          <input v-model="password" type="password" class="w-full p-2 border rounded" />
        </div>
  
        <div>
          <label class="block text-sm font-medium">Confirm Password</label>
          <input v-model="confirmPassword" type="password" class="w-full p-2 border rounded" />
        </div>
  
        <div v-if="error" class="text-red-500 text-sm">{{ error }}</div>
        <div v-if="message" class="text-green-600 text-sm">{{ message }}</div>
  
        <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Save Changes
        </button>
      </form>
    </div>
  </template>