<script setup lang="ts">
import { ref, watch } from 'vue'
import DashboardSidebar from '../components/DashboardSidebar.vue'
import { useRoute } from 'vue-router'

const isSidebarOpen = ref(false)
const route = useRoute()

watch(route, () => {
  isSidebarOpen.value = false
})
</script>

<template>
  <!-- container relativ per pozicionim te sakte -->
  <div class="relative min-h-screen bg-gray-50">

    <!-- Hamburger FIXED jashte main -->
    <button
      @click="isSidebarOpen = !isSidebarOpen"
      class="sm:hidden fixed top-4 right-4 z-50 bg-white p-2 rounded shadow hover:shadow-md transition"
    >
      <svg class="h-6 w-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>

    <!-- Wrapper me flex: Sidebar + Main -->
    <div class="flex">
      <!-- Sidebar per desktop -->
      <div class="hidden sm:block">
        <DashboardSidebar />
      </div>

      <!-- Sidebar per mobile -->
      <transition name="sidebar-slide">
        <div
          v-show="isSidebarOpen"
          class="fixed top-0 left-0 z-40 w-64 h-full bg-gray-800 text-white shadow-lg sm:hidden"
        >
          <DashboardSidebar />
        </div>
      </transition>

      <!-- MAIN CONTENT qe scroll-on -->
      <main class="flex-1 p-4 sm:p-6 overflow-y-auto">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
/* Slide transition per sidebar-in */
.sidebar-slide-enter-active,
.sidebar-slide-leave-active {
  transition: transform 0.3s ease-in-out;
}
.sidebar-slide-enter-from,
.sidebar-slide-leave-to {
  transform: translateX(-100%);
}
</style>
