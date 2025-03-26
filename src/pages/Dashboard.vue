<script setup>
import { useAuthStore } from '../store/auth'

const auth = useAuthStore()
</script>

<template>
  <h1 class="text-2xl font-bold">Welcome back, {{ auth.user?.name }}</h1>
</template>
