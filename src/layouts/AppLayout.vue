<script setup>
import Navbar from '../components/Navbar.vue'
</script>

<template>
  <div class="min-h-screen bg-gray-100 text-gray-800">
    <!-- Navbar -->
    <Navbar />

    <!-- Content injected by routes -->
    <main class="p-6">
      <RouterView />
    </main>
  </div>
</template>
