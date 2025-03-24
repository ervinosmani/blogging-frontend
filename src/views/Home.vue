<script setup>
import { useAuthStore } from '../store/auth'
const auth = useAuthStore()
</script>

<template>
    <div>
    <h1>Faqja e Home</h1>
    <p v-if="auth.user">Mirë se vjen, {{ auth.user.name }}</p>
    <p v-else>Nuk je loguar</p>
  </div>
</template>

<style scoped>

</style>