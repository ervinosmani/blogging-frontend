<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useAuthStore } from './store/auth'

const auth = useAuthStore()

onMounted(() => {
  // E ngarkon user-in kur faqja rifreskohet
  if (auth.token) {
    auth.getUser()
  }
})
</script>

<template>
  <RouterView :key="$route.fullPath" />
</template>
