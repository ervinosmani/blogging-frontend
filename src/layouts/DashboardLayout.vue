<script setup lang="ts">
import { ref, watch } from 'vue'
import DashboardSidebar from '../components/DashboardSidebar.vue'
import { useRoute } from 'vue-router'

// Kontrollon hapjen e sidebar-it ne mobile
const isSidebarOpen = ref(false)
const route = useRoute()

// Mbyll sidebar-in kur nderron rruge
watch(route, () => {
  isSidebarOpen.value = false
})
</script>

<template>
  <!-- Kontejneri i jashtem qe mbulon te gjithe faqen -->
  <div class="relative h-screen overflow-hidden bg-gradient-to-tr from-black via-neutral-900 to-purple-900 text-white">
    
    <!-- Hamburger per mobile -->
    <button
      @click="isSidebarOpen = !isSidebarOpen"
      class="sm:hidden fixed top-4 right-4 z-50 bg-white text-gray-800 p-2 rounded shadow hover:shadow-md transition"
    >
      <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>

    <!-- Wrapper per Sidebar + Content -->
    <div class="flex h-full overflow-hidden">
      <!-- Sidebar desktop -->
      <div class="hidden sm:block">
        <DashboardSidebar />
      </div>

      <!-- Sidebar mobile -->
      <transition name="sidebar-slide">
        <div
          v-show="isSidebarOpen"
          class="fixed top-0 left-0 z-40 w-64 h-full bg-gray-900 text-white shadow-lg sm:hidden"
        >
          <DashboardSidebar />
        </div>
      </transition>

      <!-- Pjesa kryesore -->
      <main class="flex-1 max-h-screen overflow-auto px-4 sm:px-6 py-6">
  <RouterView />
</main>
    </div>
  </div>
</template>

<style scoped>
html, body {
  overflow: hidden;
  height: 100%;
}

/* Efekt per animacionin e sidebar-it ne mobile */
.sidebar-slide-enter-active,
.sidebar-slide-leave-active {
  transition: transform 0.3s ease-in-out;
}
.sidebar-slide-enter-from,
.sidebar-slide-leave-to {
  transform: translateX(-100%);
}
</style>
