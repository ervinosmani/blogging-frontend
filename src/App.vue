<script setup>
import { RouterView } from 'vue-router';
import Navbar from './components/Navbar.vue';

</script>

<template>
    <div class="min-h-screen bg-gray-100 text-gray-800">
      <Navbar />
      <RouterView />
    </div>
  </template>
  
  <style>
  </style>
  

