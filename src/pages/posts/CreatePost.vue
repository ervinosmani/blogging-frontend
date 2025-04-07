<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../api/api'

const title = ref('')
const content = ref('')
const image = ref<File | null>(null)
const category = ref('')
const isPublished = ref(false)

const categories = ref<string[]>([])

const error = ref('')
const message = ref('')
const loading = ref(false)

const router = useRouter()

const fetchCategories = async () => {
    try {
        const res = await api.get('/api/categories')
        categories.value = res.data
    } catch (err) {
        console.error('Failed to load categories:', err)
    }
}

onMounted(() => {
    fetchCategories()
})

const handleFileUpload = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files?.length) {
    image.value = target.files[0]
  }
}

const handleSubmit = async () => {
    error.value = ''
    message.value = ''
    loading.value = true

    try {
        const formData = new FormData()
        formData.append('title', title.value)
        formData.append('content', content.value)
        formData.append('category', category.value)
        formData.append('is_published', isPublished.value ? '1' : '0')

        if (image.value) {
            formData.append('image', image.value)
        }

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
  <div class="h-screen overflow-hidden bg-gray-50 px-4 pt-20">
    <div class="max-w-3xl mx-auto bg-white p-6 sm:p-8 shadow rounded-md">
      <h1 class="text-2xl font-bold mb-6">Create a New Post</h1>

      <form @submit.prevent="handleSubmit" class="space-y-5">
        <!-- Title -->
        <div>
          <label class="block mb-1 font-medium text-sm">Title</label>
          <input v-model="title" type="text" class="w-full p-2 border rounded" required />
        </div>

        <!-- Content -->
        <div>
          <label class="block mb-1 font-medium text-sm">Content</label>
          <textarea v-model="content" rows="5" class="w-full p-2 border rounded resize-none" required></textarea>
        </div>

        <!-- Category -->
        <div>
          <label class="block mb-1 font-medium text-sm">Category</label>
          <select v-model="category" class="w-full p-2 border rounded" required>
            <option value="" disabled>Select a category</option>
            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
        </div>

        <!-- Image -->
        <div>
          <label class="block mb-1 font-medium text-sm">Image (optional)</label>
          <input type="file" @change="handleFileUpload" accept="image/*" class="w-full" />
        </div>

        <!-- Checkbox -->
        <div class="flex items-center space-x-2">
          <input id="published" type="checkbox" v-model="isPublished" class="form-checkbox" />
          <label for="published" class="text-sm">Publish now</label>
        </div>

        <!-- Feedback -->
        <div v-if="message && !error" class="bg-green-100 text-green-800 px-4 py-2 rounded">
          {{ message }}
        </div>
        <div v-else-if="error" class="text-red-600 text-sm">{{ error }}</div>

        <!-- Submit -->
        <button
          type="submit"
          class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          :disabled="loading"
        >
          {{ loading ? 'Creating...' : 'Create Post' }}
        </button>
      </form>
    </div>
  </div>
</template>
