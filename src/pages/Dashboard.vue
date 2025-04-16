<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api/api'

// Lista e postimeve te perdoruesit
const posts = ref<any[]>([])
const loading = ref(true)
const error = ref('')

// Faqja dhe totali
const page = ref(1)
const totalPages = ref(1)
const perPage = 10

const router = useRouter()

// Ngarkon postimet e mia nga API
const fetchMyPosts = async () => {
  loading.value = true
  try {
    const res = await api.get(`/api/my-posts?page=${page.value}&per_page=${perPage}`)
    posts.value = res.data.data ?? res.data
    totalPages.value = res.data.last_page ?? 1
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to load posts.'
  } finally {
    loading.value = false
  }
}

// Fshij nje postim
const handleDelete = async (id: number) => {
  if (!confirm('Are you sure you want to delete this post?')) return
  try {
    await api.delete(`/api/posts/${id}`)
    posts.value = posts.value.filter(p => p.id !== id)
  } catch (err: any) {
    alert(err.response?.data?.message || 'Delete failed.')
  }
}

// Publiko nje postim (nese eshte draft)
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

// Rifresko postimet kur ndryshon faqja
watch(page, () => fetchMyPosts())

// Ne montim, ngarko te dhenat
onMounted(fetchMyPosts)
</script>

<template>
  <div class="bg-neutral-950 min-h-screen py-12 px-4 text-white">
    <!-- Header -->
    <div class="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10 px-4">
      <h2 class="text-3xl font-bold text-white">My Posts</h2>
      <RouterLink
        to="/posts/create"
        class="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-md font-medium transition"
      >
        + Create New
      </RouterLink>
    </div>

    <!-- Gjendja e ngarkimit -->
    <div v-if="loading" class="text-center text-gray-400">Loading your posts...</div>
    <div v-else-if="error" class="text-center text-red-500">{{ error }}</div>
    <div v-else-if="posts.length === 0" class="text-center text-gray-400">You haven't created any posts yet.</div>

    <!-- Lista e postimeve -->
    <div v-else class="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
      <div
        v-for="post in posts"
        :key="post.id"
        class="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4 shadow hover:shadow-lg transition"
      >
        <!-- Titulli + Statusi -->
        <div class="flex justify-between items-start">
          <h3 class="text-lg font-semibold text-white break-words max-w-[70%]">{{ post.title }}</h3>
          <span
            :class="post.status === 'published'
              ? 'bg-green-600 text-white'
              : 'bg-yellow-500 text-black'"
            class="px-2 py-0.5 text-xs rounded-full font-semibold capitalize"
          >
            {{ post.status }}
          </span>
        </div>

        <!-- Likes + Data -->
        <div class="text-sm text-gray-400 flex justify-between">
          <span>{{ post.likes_count ?? 0 }} likes</span>
          <span>{{ new Date(post.created_at).toLocaleDateString() }}</span>
        </div>

        <!-- Veprimet -->
        <div class="flex flex-wrap justify-end gap-3 text-sm font-medium mt-4">
          <RouterLink
            :to="`/posts/${post.slug}/edit`"
            class="text-blue-400 hover:underline"
          >
            Edit
          </RouterLink>
          <span
            @click="handleDelete(post.id)"
            class="text-red-400 hover:underline cursor-pointer"
          >
            Delete
          </span>
          <span
            v-if="post.status === 'draft'"
            @click="handlePublish(post.slug)"
            class="text-green-400 hover:underline cursor-pointer"
          >
            Publish
          </span>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="mt-12 flex justify-center gap-4">
      <button
        @click="page--"
        :disabled="page === 1"
        class="px-4 py-2 rounded bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 disabled:opacity-50"
      >
        « Previous
      </button>
      <span class="text-sm text-gray-300 px-4 py-2">{{ page }}</span>
      <button
        @click="page++"
        :disabled="page === totalPages"
        class="px-4 py-2 rounded bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 disabled:opacity-50"
      >
        Next »
      </button>
    </div>
  </div>
</template>

<!-- <style scoped>
/* Stilimi responsive i tabeles per mobile */
@media (max-width: 640px) {
  table {
    display: block;
    width: 100%;
  }

  thead {
    display: none;
  }

  tbody, tr {
    display: flex;
    flex-direction: column;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    margin-bottom: 1.5rem;
    overflow: hidden;
    background-color: white;
  }

  td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    position: relative;
    font-size: 0.875rem;
    border-bottom: 1px solid #f1f5f9;
  }

  td:last-child {
    border-bottom: none;
  }

  td::before {
    content: attr(data-label);
    font-weight: 600;
    text-transform: uppercase;
    color: #6b7280;
    margin-right: 1rem;
    font-size: 0.75rem;
    flex-shrink: 0;
  }

  /* Tek butonat, lejo wrap per mos me dal jashte */
  td[data-label="Actions"] {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.3rem;
  }
}
td[data-label="Actions"] {
    flex-direction: row; /* rresht */
    justify-content: flex-end; /* shfaq ne te djathte */
    gap: 0.75rem;
    align-items: center;
  }

  td[data-label="Actions"] a,
  td[data-label="Actions"] button {
    padding: 0;
    margin: 0;
    margin-left: 123px;
  }
</style> -->
