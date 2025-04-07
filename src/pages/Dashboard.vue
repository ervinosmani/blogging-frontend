<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api/api'

// Lista e postimeve te perdoruesit
const posts = ref<any[]>([])
const loading = ref(true)
const error = ref('')
const router = useRouter()

// Variablat per pagination
const page = ref(1)
const totalPages = ref(1)

const perPage = 10
// Merr postimet e mia nga backend
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

// Fshije nje postim
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

// Ngarko te dhenat kur komponenti ngarkohet
onMounted(fetchMyPosts)

// Rifresko te dhenat sa here qe ndryshon faqja
watch(page, () => {
  fetchMyPosts()
})
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 py-12">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <h2 class="text-3xl font-bold text-gray-900">Your Posts</h2>
      <RouterLink
        to="/posts/create"
        class="inline-block bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
      >
        + Create New
      </RouterLink>
    </div>

    <!-- Gjendja: Loading -->
    <div v-if="loading" class="text-center text-gray-500">Loading your posts...</div>

    <!-- Gjendja: Error -->
    <div v-else-if="error" class="text-center text-red-600">{{ error }}</div>

    <!-- Gjendja: Nuk ka postime -->
    <div v-else-if="posts.length === 0" class="text-center text-gray-400">
      You haven't created any posts yet.
    </div>

    <!-- Lista me postime -->
    <div v-else class="overflow-x-auto">
      <table class="min-w-full bg-white rounded-lg shadow-sm overflow-hidden">
        <thead class="bg-gray-100 text-sm text-left">
          <tr>
            <th class="px-4 py-3">Title</th>
            <th class="px-4 py-3">Status</th>
            <th class="px-4 py-3">Likes</th>
            <th class="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
  <tr
    v-for="post in posts"
    :key="post.id"
    class="border-t text-sm hover:bg-gray-50 transition"
  >
    <td class="px-4 py-3 font-medium text-gray-800" data-label="Title">{{ post.title }}</td>
    <td class="px-4 py-3" data-label="Status">
      <span
        :class="post.status === 'published'
          ? 'bg-green-100 text-green-700'
          : 'bg-yellow-100 text-yellow-700'"
        class="px-2 py-1 rounded-full text-xs font-semibold capitalize"
      >
        {{ post.status }}
      </span>
    </td>

    <td class="px-4 py-3" data-label="Likes">{{ post.likes_count ?? 0 }}</td>

    <td class="px-4 py-3 space-x-3 whitespace-nowrap" data-label="Actions">
      <RouterLink
        :to="`/posts/${post.slug}/edit`"
        class="text-blue-600 hover:underline font-medium"
      >
        Edit
      </RouterLink>
      <button
        @click="handleDelete(post.id)"
        class="text-red-600 hover:underline font-medium"
      >
        Delete
      </button>
      <button
        v-if="post.status === 'draft'"
        @click="handlePublish(post.slug)"
        class="text-green-600 hover:underline font-medium"
      >
        Publish
      </button>
    </td>
  </tr>
</tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="mt-6 flex justify-center gap-2">
      <button
        @click="page--"
        :disabled="page === 1"
        class="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
      >
        « Previous
      </button>
      <span class="px-3 py-1 border rounded bg-white">{{ page }}</span>
      <button
        @click="page++"
        :disabled="page === totalPages"
        class="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
      >
        Next »
      </button>
    </div>
  </div>
</template>

<style scoped>
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
</style>
