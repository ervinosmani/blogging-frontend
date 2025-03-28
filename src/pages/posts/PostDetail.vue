<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import axios from '../../api/api'
import { useAuthStore } from '../../store/auth'

const route = useRoute()
const slug = route.params.slug as string

const post = ref<any>(null)
const loading = ref(true)
const comments = ref<any[]>([])
const commentText = ref('')
const auth = useAuthStore()
const submitting = ref(false)

// Ndjek komentin qe po editohet
const isEditing = ref<number | null>(null)
const editedContent = ref('')

// Merr te dhenat e postimit nga backend
const fetchPost = async () => {
  try {
    const res = await axios.get(`/api/posts/slug/${slug}`)
    post.value = res.data
  } catch (error) {
    console.error('Error fetching post:', error)
  }
}

// Merr komentet per postin nga backend
const fetchComments = async () => {
  if (!post.value) return
  try {
    const res = await axios.get(`/api/posts/${post.value.id}/comments`)
    comments.value = res.data
  } catch (error) {
    console.error('Error fetching comments:', error)
  }
}

// Shton nje koment te ri
const submitComment = async () => {
  if (!commentText.value.trim()) return
  submitting.value = true
  try {
    await axios.post(`/api/posts/${post.value.id}/comments`, {
      content: commentText.value
    })
    commentText.value = ''
    await fetchComments()
  } catch (error) {
    console.error('Error posting comment:', error)
  } finally {
    submitting.value = false
  }
}

// Fillon editimin e nje komenti
const startEdit = (comment: any) => {
  isEditing.value = comment.id
  editedContent.value = comment.content
}

// Anulo editimin
const cancelEdit = () => {
  isEditing.value = null
  editedContent.value = ''
}

// Dergon kerkesen per update
const updateComment = async (id: number) => {
  if (!editedContent.value.trim()) return
  try {
    await axios.put(`/api/comments/${id}`, { content: editedContent.value })
    await fetchComments()
    cancelEdit()
  } catch (error) {
    console.error('Error updating comment:', error)
  }
}

// Fshin nje koment
const deleteComment = async (id: number) => {
  if (!confirm('Are you sure you want to delete this comment?')) return
  try {
    await axios.delete(`/api/comments/${id}`)
    await fetchComments()
  } catch (error) {
    console.error('Gabim ne fshirjen e komentit', error)
  }
}

// Inicializimi i komponentit
onMounted(async () => {
  await fetchPost()
  await fetchComments()
  loading.value = false
})
</script>

<template>
  <div class="max-w-3xl mx-auto py-10 px-4">
    <div v-if="loading">Loading...</div>

    <div v-else-if="post">
      <h1 class="text-3xl font-bold mb-2">{{ post.title }}</h1>
      <div class="text-sm text-gray-600 mb-4">
        By {{ post.user?.name || '' }} | {{ new Date(post.created_at).toLocaleDateString() }}
      </div>

      <!-- Shfaq imazhin nëse ekziston -->
      <img
        v-if="post.image"
        :src="`http://127.0.0.1:8000/storage/${post.image}`"
        class="w-full max-h-[400px] object-cover mb-6 rounded"
        alt="Post image"
      />

      <!-- Permbajtja e postimit -->
      <div class="prose max-w-none mb-10" v-html="post.content"></div>

      <!-- Seksioni i komenteve -->
      <div>
        <h2 class="text-xl font-semibold mb-4">Comments ({{ comments.length }})</h2>

        <!-- Forma per komentim -->
        <div v-if="auth.user" class="mb-6">
          <textarea
            v-model="commentText"
            rows="3"
            class="w-full p-2 border rounded resize-none"
            placeholder="Write a comment..."
          ></textarea>
          <button
            class="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            @click="submitComment"
            :disabled="submitting"
          >
            {{ submitting ? 'Posting...' : 'Post Comment' }}
          </button>
        </div>

        <div v-else class="text-gray-500 mb-6">
          You must be logged in to comment.
        </div>

        <!-- Lista e komenteve -->
        <div v-if="comments.length">
          <div
            v-for="comment in comments"
            :key="comment.id"
            class="mb-4 p-4 border rounded bg-gray-50"
          >
            <div class="text-sm text-gray-600 mb-1">
              {{ comment.user?.name || 'Anonymous' }} -
              {{ new Date(comment.created_at).toLocaleString() }}
            </div>

            <!-- Editimi i komentit -->
            <div v-if="isEditing === comment.id">
              <textarea
                v-model="editedContent"
                rows="2"
                class="w-full p-2 border rounded resize-none mb-2"
              ></textarea>
              <div class="space-x-2">
                <button
                  class="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                  @click="updateComment(comment.id)"
                >
                  Save
                </button>
                <button
                  class="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
                  @click="cancelEdit"
                >
                  Cancel
                </button>
              </div>
            </div>

            <!-- Teksti i komentit -->
            <div v-else class="text-gray-800 mb-2">{{ comment.content }}</div>

            <!-- Butonat e autorit -->
            <div
              v-if="auth.user?.id === comment.user_id"
              class="text-sm space-x-3 text-blue-600"
            >
              <button @click="startEdit(comment)">Edit</button>
              <button @click="deleteComment(comment.id)" class="text-red-600">Delete</button>
            </div>
          </div>
        </div>
        <div v-else class="text-gray-500">There are no comments for this post yet.</div>
      </div>
    </div>
  </div>
</template>
