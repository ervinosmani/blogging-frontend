<!-- src/layouts/DashboardLayout.vue -->
<script setup lang="ts">
import DashboardSidebar from '../components/DashboardSidebar.vue'
</script>

<template>
    <div class="flex min-h-screen">
      <!-- Sidebar -->
      <DashboardSidebar class="min-h-screen" />
  
      <!-- Main Content -->
      <main class="flex-1 bg-gray-50 p-6">
        <RouterView />
      </main>
    </div>
  </template>
  
