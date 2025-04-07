<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { RouterLink } from 'vue-router'
import api from '../api/api'

// Lista e postimeve te marra nga serveri
const posts = ref<any[]>([])

// Tregon nese postimet jane duke u ngarkuar
const loading = ref(true)

// Mesazh gabimi nese dicka shkon keq
const error = ref('')

// URL baze per imazhet
const baseURL = api.defaults.baseURL

// Fusha e kerkimit
const search = ref('')

// Faqja aktuale e zgjedhur
const currentPage = ref(1)

// Te dhenat e pagination
const pagination = ref({
  current_page: 1,
  last_page: 1,
  total: 0,
  links: []
})

// Kontrollon nese perdoruesi ka bere ndonje filter ose kerkese
const isFiltering = computed(() => {
  return search.value.trim() !== '' || selectedCategory.value !== 'all'
})

// Kategoria e zgjedhur nga perdoruesi
const selectedCategory = ref('all')

// Lista e kategorive unike, llogaritet automatikisht nga postimet
const categories = computed(() => {
  const unique = new Set(posts.value.map(p => p.category))
  return ['all', ...Array.from(unique)]
})

// Filtrim i kombinuar: nga kerkimi + nga kategoria
const filteredPosts = computed(() => {
  return posts.value.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(search.value.toLowerCase())
    const matchesCategory = selectedCategory.value === 'all' || post.category === selectedCategory.value
    return matchesSearch && matchesCategory
  })
})

// Kur klikohet nje link nga pagination
const handlePagination = (link: any) => {
  if (link.url) {
    // Marr numrin e faqes nga URL
    const url = new URL(link.url)
    const page = url.searchParams.get('page')
    if (page) {
      fetchPosts(Number(page))
    }
  }
}

// Merr postimet nga API sipas faqes aktuale
const fetchPosts = async (page = 1) => {
  error.value = ''
  loading.value = true
  try {
    const res = await api.get(`/api/posts?page=${page}`)
    posts.value = res.data.data ?? res.data
    pagination.value = {
      current_page: res.data.current_page,
      last_page: res.data.last_page,
      total: res.data.total,
      links: res.data.links
    }
    currentPage.value = page
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to load posts.'
  } finally {
    loading.value = false
  }
}

// Ngarkon postimet kur komponenti hapet
onMounted(fetchPosts)
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

    <!-- Seksioni hyrës (Hero Section) -->
    <section class="bg-gradient-to-br from-blue-50 to-white rounded-xl p-10 mb-16 shadow-sm">
      <div class="max-w-4xl mx-auto text-center">
        <h1 class="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
          Welcome to <span class="text-blue-600">DevBlog</span>
        </h1>
        <p class="text-lg text-gray-600 mb-6">
          Discover inspiring posts, share your ideas, and join a growing community of developers and creatives.
        </p>
        <RouterLink
          to="/posts/create"
          class="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
        >
          Start Writing →
        </RouterLink>
      </div>
    </section>

    <!-- Titulli dhe pershkrimi i seksionit te postimeve -->
    <div class="text-center mb-10">
      <h1 class="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-2">Discover Fresh Ideas</h1>
      <p class="text-gray-600 text-lg">Read insightful articles, share your voice, and connect with the community.</p>
    </div>

    <!-- Fusha e kerkimit -->
    <div class="max-w-md mx-auto mb-10">
      <input
        v-model="search"
        type="text"
        placeholder="Search posts..."
        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />
    </div>

    <!-- Dropdown per filtrimin sipas kategorise -->
    <div class="max-w-md mx-auto mb-10">
      <select
        v-model="selectedCategory"
        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
      >
        <option v-for="category in categories" :key="category" :value="category">
          {{ category === 'all' ? 'All categories' : category }}
        </option>
      </select>
    </div>

    <!-- Gjendja nese postimet po ngarkohen -->
    <div v-if="loading" class="text-center text-gray-500">Loading posts...</div>

    <!-- Nese ka gabim -->
    <div v-else-if="error" class="text-center text-red-600 font-semibold">{{ error }}</div>

    <!-- Nese nuk ka postime -->
    <div v-else-if="filteredPosts.length === 0" class="text-center text-gray-500">No posts found.</div>

    <!-- Gridi me postime -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
      <RouterLink
        v-for="post in filteredPosts"
        :key="post.id"
        :to="`/posts/${post.slug}`"
        class="group bg-white rounded-xl overflow-hidden shadow hover:shadow-xl transition duration-300 flex flex-col"
      >
        <!-- Imazhi i postimit -->
        <div class="relative">
          <img
            v-if="post.image"
            :src="`${baseURL}/storage/${post.image}`"
            alt="Post image"
            class="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <!-- Overlay kur kalohet me mouse -->
          <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition duration-300 flex items-center justify-center">
            <span class="text-white text-sm font-semibold opacity-0 group-hover:opacity-100">Read more →</span>
          </div>
        </div>

        <!-- Detajet e postimit -->
        <div class="p-5 flex-1 flex flex-col justify-between">
          <div>
            <h2 class="text-xl font-semibold text-gray-800 group-hover:text-blue-600 transition">{{ post.title }}</h2>

            <div class="mt-2 text-sm text-gray-500 flex items-center justify-between">
              <span class="capitalize bg-blue-50 text-blue-600 px-2 py-1 rounded-full text-xs font-medium">
                {{ post.category }}
              </span>
              <span class="text-xs text-gray-400">{{ new Date(post.created_at).toLocaleDateString() }}</span>
            </div>
          </div>

          <div class="mt-4 text-xs text-gray-400">
            By {{ post.user?.name || 'Unknown author' }}
          </div>
        </div>
      </RouterLink>
    </div>

    <!-- Pagination - shfaqet vetem kur nuk ka filtrim -->
    <div
      v-if="!isFiltering"
      class="mt-12 flex justify-center gap-2 flex-wrap"
    >
      <button
        v-for="(link, index) in pagination.links"
        :key="index"
        :disabled="!link.url"
        @click="handlePagination(link)"
        v-html="link.label"
        class="px-4 py-2 text-sm rounded border hover:bg-blue-100 transition"
        :class="{
          'bg-blue-600 text-white': link.active,
          'text-gray-500': !link.url,
          'cursor-not-allowed': !link.url
        }"
      ></button>
    </div>
  </div>
</template>

<style scoped>
/* Stilim i shiritit te scroll-it */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 3px;
}
</style>
