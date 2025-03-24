<script setup>
import { RouterLink } from 'vue-router';
</script>

<template>
    <nav class="bg-white shadow p-4 flex justify-between items-center">
        <div class="text-lg font-semibold">Blog</div>
        <div class="space-x-4">
            <RouterLink to="/" class="text-gray-700 hover:text-blue-600">Home</RouterLink>
            <RouterLink to="/login" class="text-gray-700 hover:text-blue-600">Login</RouterLink>
            <RouterLink to="/register" class="text-gray-700 hover:text-blue-600">Register</RouterLink>
        </div>
    </nav>
</template>

<style scoped>

</style>