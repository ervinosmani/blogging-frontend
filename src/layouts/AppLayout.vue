<script setup>
import Navbar from '../components/Navbar.vue'
</script>

<template>
  <div class="min-h-screen bg-gradient-to-tr from-black via-neutral-900 to-purple-900 text-white">
    <!-- Navbar ne krye -->
    <Navbar />

    <!-- Permbajtja dinamike e faqeve -->
    <main class="p-6">
      <RouterView />
    </main>
  </div>
</template>
