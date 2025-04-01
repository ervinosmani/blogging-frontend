<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import api from '../api/api'

const posts = ref([])
const loading = ref(true)
const error = ref('')

const fetchPosts = async () => {
  try {
    const res = await api.get('/api/posts') // e sheh vetëm postimet e publikuara
    posts.value = res.data.data ?? res.data
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to load posts.'
  } finally {
    loading.value = false
  }
}

onMounted(fetchPosts)
</script>

<template>
  <div class="max-w-5xl mx-auto mt-10 px-6">
    <h1 class="text-2xl font-bold mb-6">Latest Posts</h1>

    <div v-if="loading">Loading posts...</div>
    <div v-if="error" class="text-red-600">{{ error }}</div>

    <div v-if="!loading && posts.length === 0" class="text-gray-500">
      No posts found.
    </div>

    <div v-if="posts.length" class="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <RouterLink
        v-for="post in posts"
        :key="post.id"
        :to="`/posts/${post.slug}`"
        class="border rounded shadow hover:shadow-lg transition p-4 block bg-white"
      >
        <h2 class="text-lg font-semibold mb-2">{{ post.title }}</h2>
        <p class="text-sm text-gray-600">{{ post.category }}</p>
        <p class="text-sm text-gray-400 mt-2">{{ new Date(post.created_at).toLocaleDateString() }}</p>
      </RouterLink>
    </div>
  </div>
</template>
