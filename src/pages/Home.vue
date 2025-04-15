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
    const url = new URL(link.url)
    const page = url.searchParams.get('page')
    if (page) {
      fetchPosts(Number(page))
    }
  }
}

// Funksion per te ndryshuar statusin e like
const toggleLike = async (post: any) => {
  try {
    const res = await api.post(`/api/posts/${post.id}/like`)
    post.liked_by_user = res.data.liked
    post.likes_count = res.data.likes
  } catch (err) {
    console.error('Gabim gjate shtimit te like:', err)
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

    // Kthe ne krye te faqes kur ngarkohen postet
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Deshtoi ngarkimi i postimeve.'
  } finally {
    loading.value = false
  }
}

// Ngarkon postimet kur komponenti ngarkohet per here te pare
onMounted(fetchPosts)
</script>

<template>
  <div class="bg-neutral-950 text-white min-h-screen pb-20">
    <!-- Hero Section -->
    <section class="text-center py-24 px-6 bg-gradient-to-br from-neutral-900 to-neutral-800">
      <h1 class="text-4xl sm:text-6xl font-extrabold mb-4 tracking-tight">
        <span class="bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text">Creative Minds</span><br />
        Inspire the Web
      </h1>
      <p class="text-lg text-gray-400 mb-6 max-w-2xl mx-auto">Explore thoughts, write freely, and connect with developers & dreamers.</p>
      <RouterLink
        to="/posts/create"
        class="inline-block bg-gradient-to-r from-pink-600 to-purple-600 px-6 py-3 rounded-full font-semibold hover:scale-105 transition"
      >
        ✍️ Start Writing
      </RouterLink>
    </section>

    <!-- Search & Filters -->
    <div class="max-w-4xl mx-auto -mt-12 z-10 relative px-4">
      <div class="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row gap-4">
        <input
          v-model="search"
          type="text"
          placeholder="Search..."
          class="w-full bg-neutral-800 border border-neutral-700 px-4 py-3 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <select
          v-model="selectedCategory"
          class="w-full md:w-60 bg-neutral-800 border border-neutral-700 px-4 py-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option v-for="category in categories" :key="category" :value="category">
            {{ category === 'all' ? 'All Categories' : category }}
          </option>
        </select>
      </div>
    </div>

    <!-- Posts -->
    <div class="max-w-7xl mx-auto px-6 mt-20">
      <div v-if="loading" class="text-center text-gray-400">Loading posts...</div>
      <div v-else-if="error" class="text-center text-red-500">{{ error }}</div>
      <div v-else-if="filteredPosts.length === 0" class="text-center text-gray-500">No posts found.</div>

      <div v-else class="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        <!-- Karta e postimit -->
        <div
          v-for="post in filteredPosts"
          :key="post.id"
          class="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl overflow-hidden border border-neutral-700 transition hover:shadow-lg hover:border-purple-600"
        >
          <!-- Karta e klikueshme me overlay ne te gjithe siperfaqen -->
          <RouterLink :to="`/posts/${post.slug}`" class="relative block group">
            <div class="relative h-52 overflow-hidden">
              <img
                v-if="post.image"
                :src="`${baseURL}/storage/${post.image}`"
                class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <!-- Overlay ne te gjithe div-in, jo vetem mbi img -->
              <div
                class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
              >
                <span class="text-white text-sm font-semibold tracking-wider uppercase">View Post</span>
              </div>
            </div>
          </RouterLink>

          <!-- Informacionet poshte imazhit -->
          <div class="p-5 space-y-3">
            <RouterLink :to="`/posts/${post.slug}`">
              <h2 class="text-lg font-semibold hover:text-purple-400 transition">{{ post.title }}</h2>
            </RouterLink>
            <div class="flex justify-between text-xs text-gray-400">
              <span class="bg-purple-900/30 text-purple-400 px-2 py-0.5 rounded-full">{{ post.category }}</span>
              <span>{{ new Date(post.created_at).toLocaleDateString() }}</span>
            </div>
            <div class="flex justify-between items-center mt-2 text-sm text-gray-400">
              <span>👤 {{ post.user?.name || 'Unknown' }}</span>
              <div class="flex items-center gap-4">
                <button
                  @click.stop="$router.push(`/posts/${post.slug}#comments`)"
                  class="hover:text-purple-400 flex items-center gap-1 transition"
                >
                  <i class="fa-regular fa-comment"></i>
                  {{ post.comments_count || 0 }}
                </button>
                <button
                  @click.stop.prevent="toggleLike(post)"
                  class="hover:text-pink-500 flex items-center gap-1 transition"
                >
                  <i :class="[post.liked_by_user ? 'fa-solid text-pink-500' : 'fa-regular text-gray-500', 'fa-heart']"></i>
                  {{ post.likes_count || 0 }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="!isFiltering" class="mt-16 flex justify-center gap-2 flex-wrap">
        <button
          v-for="(link, index) in pagination.links"
          :key="index"
          :disabled="!link.url"
          @click="handlePagination(link)"
          v-html="link.label"
          class="px-4 py-2 rounded-lg border border-neutral-700 bg-neutral-800 text-white hover:bg-purple-700 transition"
          :class="{
            'bg-purple-600 text-white': link.active,
            'text-gray-500': !link.url,
            'cursor-not-allowed': !link.url
          }"
        ></button>
      </div>
    </div>
  </div>
</template>

<style scoped>
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-thumb {
  background-color: #a855f7;
  border-radius: 3px;
}
</style>
