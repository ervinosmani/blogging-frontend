<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import api from '../api/api'

const posts = ref<any[]>([])
const loading = ref(true)
const error = ref('')
const baseURL = api.defaults.baseURL // ✅ importo bazën direkt nga axios instance

const fetchPosts = async () => {
  error.value = ''
  loading.value = true

  try {
    const res = await api.get('/api/posts')
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
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <h1 class="text-3xl font-bold mb-8 text-gray-800">Latest Posts</h1>

    <div v-if="loading" class="text-gray-500">Loading posts...</div>
    <div v-else-if="error" class="text-red-600 font-semibold">{{ error }}</div>
    <div v-else-if="posts.length === 0" class="text-gray-500">No posts found.</div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      <RouterLink
        v-for="post in posts"
        :key="post.id"
        :to="`/posts/${post.slug}`"
        class="bg-white rounded shadow hover:shadow-md transition border overflow-hidden"
      >
        <!-- ✅ Path absolut për imazhin -->
        <img
          v-if="post.image"
          :src="`${baseURL}/storage/${post.image}`"
          alt="Post image"
          class="h-40 w-full object-cover"
        />
        <div class="p-4">
          <h2 class="text-lg font-semibold text-gray-800">{{ post.title }}</h2>
          <p class="text-sm text-gray-500 mt-1">{{ post.category }}</p>
          <p class="text-xs text-gray-400 mt-2">
            {{ new Date(post.created_at).toLocaleDateString() }}
          </p>
        </div>
      </RouterLink>
    </div>
  </div>
</template>
