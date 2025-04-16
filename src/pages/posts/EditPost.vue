<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../../api/api'

const route = useRoute()
const router = useRouter()
const slug = route.params.slug as string

const postId = ref<number | null>(null)
const title = ref('')
const content = ref('')
const categoryId = ref<number | null>(null)
const image = ref<File | null>(null)
const imageUrl = ref('')
const error = ref('')
const loading = ref(true)

const categories = ref<{ id: number; name: string }[]>([])

// Ngarko postin ekzistues
const fetchPost = async () => {
  try {
    const res = await api.get(`/api/posts/slug/${slug}`)
    const post = res.data
    postId.value = post.id
    title.value = post.title
    content.value = post.content
    categoryId.value = post.category?.id || null
    imageUrl.value = post.image
  } catch (err) {
    error.value = 'Post not found'
  } finally {
    loading.value = false
  }
}

// Ngarko kategorite nga backend
const fetchCategories = async () => {
  try {
    const res = await api.get('/api/categories')
    categories.value = res.data
  } catch (err) {
    console.error('Error loading categories:', err)
  }
}

// Ndryshimi i imazhit
const handleImageChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target?.files?.length) {
    image.value = target.files[0]
  }
}

// Update post
const handleUpdate = async () => {
  if (!postId.value) return

  const formData = new FormData()
  formData.append('title', title.value)
  formData.append('content', content.value)
  formData.append('category_id', String(categoryId.value))
  if (image.value) {
    formData.append('image', image.value)
  }

  try {
    await api.post(`/api/posts/${postId.value}?_method=PUT`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    router.push('/dashboard')
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to update post.'
  }
}

onMounted(() => {
  fetchPost()
  fetchCategories()
})
</script>

<template>
  <div class="min-h-screen bg-neutral-950 text-white px-4 py-20">
    <div class="max-w-3xl mx-auto bg-gradient-to-br from-neutral-900 to-neutral-800 p-8 rounded-2xl border border-neutral-800 shadow-xl">
      <h1 class="text-3xl font-bold text-purple-400 mb-6 text-center">Edit Post</h1>

      <div v-if="loading" class="text-center text-gray-400">Loading...</div>
      <div v-if="error" class="text-red-400 text-center font-medium mb-4">{{ error }}</div>

      <form v-if="!loading && !error" @submit.prevent="handleUpdate" class="space-y-6">
        <!-- Titulli -->
        <div>
          <label class="block mb-1 text-sm font-semibold text-purple-300">Title</label>
          <input v-model="title" type="text" required
            class="w-full bg-neutral-800 text-white px-4 py-2 rounded-lg border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-purple-500" />
        </div>

        <!-- Permbajtja -->
        <div>
          <label class="block mb-1 text-sm font-semibold text-purple-300">Content</label>
          <textarea v-model="content" rows="5" required
            class="w-full bg-neutral-800 text-white px-4 py-2 rounded-lg border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"></textarea>
        </div>

        <!-- Kategoria -->
        <div>
          <label class="block mb-1 text-sm font-semibold text-purple-300">Category</label>
          <select v-model="categoryId" required
            class="w-full bg-neutral-800 text-white px-4 py-2 rounded-lg border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option disabled value="">Select a category</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
        </div>

        <!-- Imazhi ekzistues -->
        <div v-if="imageUrl" class="space-y-1">
          <label class="block text-sm font-semibold text-purple-300">Current Image</label>
          <img :src="`http://127.0.0.1:8000/storage/${imageUrl}`" alt="Current image"
            class="w-full max-h-64 object-cover rounded-lg border border-neutral-700" />
        </div>

        <!-- Zgjidh nje imazh te ri -->
        <div>
          <label class="block mb-1 text-sm font-semibold text-purple-300">Change Image</label>
          <input type="file" @change="handleImageChange" accept="image/*"
            class="w-full bg-neutral-800 text-white px-4 py-2 rounded-lg border border-neutral-700 file:bg-purple-600 file:text-white file:px-4 file:py-1 file:rounded file:border-0" />
        </div>

        <!-- Submit -->
        <button type="submit"
          class="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-6 rounded-full font-semibold hover:scale-105 transition">
          Save Changes
        </button>
      </form>
    </div>
  </div>
</template>
