<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '../api/api'
import { useRouter } from 'vue-router'

const posts = ref([])
const loading = ref(true)
const error = ref('')
const router = useRouter()

const fetchMyPosts = async () => {
  try {
    const res = await api.get('/api/my-posts')
    posts.value = res.data.data
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to load posts.'
  } finally {
    loading.value = false
  }
}

const handleDelete = async (id: number) => {
  if (!confirm('Are you sure you want to delete this post?')) return

  try {
    await api.delete(`/api/posts/${id}`)
    posts.value = posts.value.filter(p => p.id !== id)
  } catch (err: any) {
    alert(err.response?.data?.message || 'Delete failed.')
  }
}

const handlePublish = async (slug: string) => {
  try {
    const res = await api.post(`/api/posts/${slug}/publish`)
    const updated = res.data.post
    const index = posts.value.findIndex(p => p.slug === slug)
    posts.value[index] = updated
  } catch (err: any) {
    alert('Failed to publish post.')
  }
}

onMounted(fetchMyPosts)
</script>

<template>
  <div class="max-w-5xl mx-auto mt-10 p-6 bg-white rounded shadow">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold">Your Posts</h2>
      <RouterLink to="/posts/create" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        + Create New
      </RouterLink>
    </div>

    <div v-if="loading" class="text-gray-600">Loading...</div>
    <div v-if="error" class="text-red-600">{{ error }}</div>

    <div v-if="!loading && posts.length === 0" class="text-gray-500">
      You have no posts yet.
    </div>

    <table v-if="posts.length" class="w-full table-auto border">
      <thead class="bg-gray-100 text-left text-sm">
        <tr>
          <th class="p-2 border">Title</th>
          <th class="p-2 border">Status</th>
          <th class="p-2 border">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="post in posts" :key="post.id" class="text-sm">
          <td class="p-2 border">{{ post.title }}</td>
          <td class="p-2 border capitalize">
            <span :class="post.status === 'published' ? 'text-green-600' : 'text-yellow-600'">
              {{ post.status }}
            </span>
          </td>
          <td class="p-2 border flex gap-3">
            <RouterLink :to="`/posts/${post.slug}/edit`" class="text-blue-600 hover:underline">Edit</RouterLink>
            <button @click="handleDelete(post.id)" class="text-red-600 hover:underline">Delete</button>
            <button v-if="post.status === 'draft'" @click="handlePublish(post.slug)" class="text-green-600 hover:underline">
              Publish
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
