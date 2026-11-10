<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
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

const loading = ref(true)
const saving = ref(false)
const loadError = ref('')
const saveError = ref('')
const categoriesError = ref('')

const categories = ref<{ id: number; name: string }[]>([])

type ApiError = {
  response?: {
    status?: number
    data?: {
      message?: string
      errors?: Record<string, string[]>
    }
  }
}

// Merr mesazhin e gabimit nga Laravel.
const getErrorMessage = (err: unknown, fallback: string): string => {
  const response = (err as ApiError)?.response

  const validationErrors = response?.data?.errors
  const firstFieldErrors = validationErrors
    ? Object.values(validationErrors)[0]
    : undefined

  return (
    firstFieldErrors?.[0] ||
    response?.data?.message ||
    fallback
  )
}

// Perdoret origjina e API-se per imazhet.
const backendOrigin = new URL(
  import.meta.env.VITE_API_URL || window.location.origin,
  window.location.origin
).origin

const currentImageSrc = computed(() => {
  const path = imageUrl.value

  if (!path) return ''

  // Mbështet edhe URL absolute nga backend.
  if (/^https?:\/\//i.test(path)) {
    return path
  }

  const cleanPath = path
    .replace(/^\/+/, '')
    .replace(/^storage\//, '')

  return `${backendOrigin}/storage/${cleanPath}`
})

// Ngarko postimin ekzistues.
const fetchPost = async () => {
  try {
    const res = await api.get(`/api/posts/slug/${slug}`)
    const post = res.data

    postId.value = post.id
    title.value = post.title
    content.value = post.content
    categoryId.value = post.category?.id ?? null
    imageUrl.value = post.image || ''
  } catch (err: unknown) {
    loadError.value = getErrorMessage(
      err,
      'Unable to load this post.'
    )
  }
}

// Ngarko kategorite.
const fetchCategories = async () => {
  try {
    const res = await api.get('/api/categories')
    categories.value = res.data
  } catch (err) {
    console.error('Error loading categories:', err)
    categoriesError.value = 'Unable to load categories.'
  }
}

// Zgjedh imazhin e ri.
const handleImageChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  image.value = target.files?.[0] ?? null
}

// Perditeson postimin.
const handleUpdate = async () => {
  if (postId.value === null || saving.value) return

  saveError.value = ''

  if (categoryId.value === null) {
    saveError.value = 'Please select a category.'
    return
  }

  saving.value = true

  const formData = new FormData()

  // Laravel method spoofing per multipart requests.
  formData.append('_method', 'PUT')
  formData.append('title', title.value)
  formData.append('content', content.value)
  formData.append('category_id', String(categoryId.value))

  if (image.value) {
    formData.append('image', image.value)
  }

  try {
    await api.post(`/api/posts/${postId.value}`, formData)

    await router.push('/dashboard')
  } catch (err: unknown) {
    saveError.value = getErrorMessage(
      err,
      'Failed to update post.'
    )
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await Promise.all([
    fetchPost(),
    fetchCategories()
  ])

  loading.value = false
})
</script>

<template>
  <div class="min-h-screen bg-neutral-950 text-white px-4 py-20">
    <div
      class="max-w-3xl mx-auto bg-gradient-to-br from-neutral-900 to-neutral-800 p-8 rounded-2xl border border-neutral-800 shadow-xl"
    >
      <h1 class="text-3xl font-bold text-purple-400 mb-6 text-center">
        Edit Post
      </h1>

      <div v-if="loading" class="text-center text-gray-400">
        Loading...
      </div>

      <div
        v-else-if="loadError"
        class="text-red-400 text-center font-medium mb-4"
      >
        {{ loadError }}
      </div>

      <form
        v-else
        @submit.prevent="handleUpdate"
        class="space-y-6"
      >
        <!-- Gabimet e ruajtjes nuk e fshehin formularin. -->
        <div
          v-if="saveError"
          class="text-red-400 text-center font-medium"
          role="alert"
        >
          {{ saveError }}
        </div>

        <div
          v-if="categoriesError"
          class="text-red-400 text-center text-sm"
          role="alert"
        >
          {{ categoriesError }}
        </div>

        <!-- Titulli -->
        <div>
          <label
            for="post-title"
            class="block mb-1 text-sm font-semibold text-purple-300"
          >
            Title
          </label>

          <input
            id="post-title"
            v-model="title"
            type="text"
            required
            maxlength="255"
            class="w-full bg-neutral-800 text-white px-4 py-2 rounded-lg border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <!-- Permbajtja -->
        <div>
          <label
            for="post-content"
            class="block mb-1 text-sm font-semibold text-purple-300"
          >
            Content
          </label>

          <textarea
            id="post-content"
            v-model="content"
            rows="5"
            required
            class="w-full bg-neutral-800 text-white px-4 py-2 rounded-lg border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          ></textarea>
        </div>

        <!-- Kategoria -->
        <div>
          <label
            for="post-category"
            class="block mb-1 text-sm font-semibold text-purple-300"
          >
            Category
          </label>

          <select
            id="post-category"
            v-model="categoryId"
            required
            class="w-full bg-neutral-800 text-white px-4 py-2 rounded-lg border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option :value="null" disabled>
              Select a category
            </option>

            <option
              v-for="cat in categories"
              :key="cat.id"
              :value="cat.id"
            >
              {{ cat.name }}
            </option>
          </select>
        </div>

        <!-- Imazhi ekzistues -->
        <div v-if="currentImageSrc" class="space-y-1">
          <label class="block text-sm font-semibold text-purple-300">
            Current Image
          </label>

          <img
            :src="currentImageSrc"
            :alt="`Image for ${title}`"
            class="w-full max-h-64 object-cover rounded-lg border border-neutral-700"
          />
        </div>

        <!-- Imazhi i ri -->
        <div>
          <label
            for="post-image"
            class="block mb-1 text-sm font-semibold text-purple-300"
          >
            Change Image
          </label>

          <input
            id="post-image"
            type="file"
            accept="image/*"
            @change="handleImageChange"
            class="w-full bg-neutral-800 text-white px-4 py-2 rounded-lg border border-neutral-700 file:bg-purple-600 file:text-white file:px-4 file:py-1 file:rounded file:border-0"
          />
        </div>

        <!-- Ruaj ndryshimet -->
        <button
          type="submit"
          :disabled="saving || !!categoriesError"
          class="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-6 rounded-full font-semibold hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ saving ? 'Saving...' : 'Save Changes' }}
        </button>
      </form>
    </div>
  </div>
</template>
