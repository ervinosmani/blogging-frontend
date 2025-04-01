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
const category = ref('')
const image = ref<File | null>(null)
const imageUrl = ref('')
const error = ref('')
const loading = ref(true)

const fetchPost = async () => {
  try {
    const res = await api.get(`/api/posts/slug/${slug}`)
    const post = res.data
    title.value = post.title
    content.value = post.content
    category.value = post.category
    postId.value = post.id
    imageUrl.value = post.image // vetëm emri ose path i imazhit
  } catch (err) {
    error.value = 'Post not found'
  } finally {
    loading.value = false
  }
}

const handleUpdate = async () => {
  if (!postId.value) return

  const formData = new FormData()
  formData.append('title', title.value)
  formData.append('content', content.value)
  formData.append('category', category.value)
  if (image.value) formData.append('image', image.value)

  try {
    await api.post(`/api/posts/${postId.value}?_method=PUT`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    router.push('/dashboard')
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to update post.'
  }
}

const handleImageChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target && target.files && target.files.length > 0) {
    image.value = target.files[0]
  }
}

onMounted(fetchPost)
</script>

<template>
  <div class="max-w-2xl mx-auto mt-10 p-6 bg-white rounded shadow">
    <h2 class="text-xl font-bold mb-4">Edit Post</h2>

    <div v-if="error" class="text-red-600 mb-4">{{ error }}</div>
    <div v-if="loading" class="text-gray-500">Loading...</div>

    <form @submit.prevent="handleUpdate" v-if="!loading">
      <label class="block mb-2 font-semibold">Title</label>
      <input v-model="title" type="text" class="input" required />

      <label class="block mb-2 font-semibold">Content</label>
      <textarea v-model="content" class="input" rows="4" required></textarea>

      <label class="block mb-2 font-semibold">Category</label>
      <input v-model="category" type="text" class="input" required />

      <div v-if="imageUrl" class="mb-4">
        <label class="block font-semibold mb-1">Current Image</label>
        <img
          :src="`http://127.0.0.1:8000/storage/${imageUrl}`"
          alt="Current image"
          class="w-32 h-auto rounded border"
        />
      </div>

      <label class="block mb-2 font-semibold">Change Image</label>
      <input @change="handleImageChange" type="file" class="input" accept="image/*" />

      <button class="btn btn-primary mt-4">Update Post</button>
    </form>
  </div>
</template>

<style scoped>
.input {
  display: block;
  margin-bottom: 1rem;
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.btn {
  background-color: #2563eb;
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: 4px;
  font-weight: 600;
}
.btn:hover {
  background-color: #1d4ed8;
}
</style>
