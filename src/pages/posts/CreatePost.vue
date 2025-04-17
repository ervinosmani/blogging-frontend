<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../api/api'

// Fushat e postimit
const title = ref('')
const content = ref('')
const image = ref<File | null>(null)
const categoryId = ref<number | null>(null)
const isPublished = ref(false)

// Kategorite (me id + name)
const categories = ref<{ id: number; name: string }[]>([])

// Gjendjet
const error = ref('')
const message = ref('')
const loading = ref(false)

const router = useRouter()

// Merr kategorite nga API
const fetchCategories = async () => {
  try {
    const res = await api.get('/api/categories')
    categories.value = res.data
  } catch (err) {
    console.error('Error loading categories:', err)
  }
}

onMounted(fetchCategories)

// Ruan imazhin e zgjedhur
const handleFileUpload = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files?.length) {
    image.value = target.files[0]
  }
}

// Dergon formularin
const handleSubmit = async () => {
  error.value = ''
  message.value = ''
  loading.value = true

  try {
    const formData = new FormData()
    formData.append('title', title.value)
    formData.append('content', content.value)
    formData.append('category_id', String(categoryId.value))
    formData.append('is_published', isPublished.value ? '1' : '0')

    if (image.value) formData.append('image', image.value)

    await api.post('/api/posts', formData)

    message.value = 'Post created successfully!'
    router.push('/dashboard')
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to create post.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-neutral-950 text-white px-4 py-20">
    <div class="max-w-3xl mx-auto bg-gradient-to-br from-neutral-900 to-neutral-800 p-8 rounded-2xl border border-neutral-800 shadow-xl">
      <h1 class="text-3xl font-bold text-purple-400 mb-6 text-center">Create New Post</h1>

      <form @submit.prevent="handleSubmit" class="space-y-6">
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

        <!-- Imazhi -->
        <div>
          <label class="block mb-1 text-sm font-semibold text-purple-300">Upload Image (optional)</label>
          <input type="file" @change="handleFileUpload" accept="image/*"
            class="w-full bg-neutral-800 text-white px-4 py-2 rounded-lg border border-neutral-700 file:bg-purple-600 file:text-white file:px-4 file:py-1 file:rounded file:border-0" />
        </div>

        <!-- Checkbox publikimi -->
        <div class="flex items-center gap-3">
          <input id="publish" type="checkbox" v-model="isPublished"
            class="w-4 h-4 text-purple-600 bg-neutral-800 border-neutral-700 rounded focus:ring-purple-500" />
          <label for="publish" class="text-sm text-purple-300">Publish immediately</label>
        </div>

        <!-- Mesazhet -->
        <div v-if="message && !error" class="text-green-400 font-medium text-sm">
          {{ message }}
        </div>
        <div v-else-if="error" class="text-red-400 font-medium text-sm">
          {{ error }}
        </div>

        <!-- Submit -->
        <button type="submit" :disabled="loading"
          class="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-2 px-6 rounded-full font-semibold hover:scale-105 transition">
          {{ loading ? 'Creating...' : 'Create Post' }}
        </button>
      </form>
    </div>
  </div>
</template>
