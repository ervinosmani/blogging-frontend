<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from '../../api/api'
import { useAuthStore } from '../../store/auth'

// Marrim slug-un e postit nga URL
const route = useRoute()
const router = useRouter()
const slug = route.params.slug as string

// Variablat reaktive per postin, komentet dhe gjendjen e nderfaqes
const post = ref<any>(null)
const comments = ref<any[]>([])
const commentText = ref('')
const replyText = ref('')
const replyingTo = ref<number | null>(null)
const isEditing = ref<number | null>(null)
const editedContent = ref('')
const submitting = ref(false)
const loading = ref(true)

// Marrim perdoruesin e autentikuar nga store
const auth = useAuthStore()

// Funksioni per te marre postin
const fetchPost = async () => {
  try {
    const res = await axios.get(`/api/posts/slug/${slug}`)
    post.value = res.data
  } catch (err) {
    console.error('Gabim gjate marrjes se postit:', err)
  }
}

// Funksioni per te marre komentet e postit
const fetchComments = async () => {
  try {
    const res = await axios.get(`/api/posts/${post.value.id}/comments`)
    comments.value = res.data
  } catch (err) {
    console.error('Gabim gjate marrjes se komenteve:', err)
  }
}

// Funksioni per te pelqyer postin
const likePost = async () => {
  if (!auth.user) return router.push('/login')
  try {
    const res = await axios.post(`/api/posts/${post.value.id}/like`)
    post.value.likes = res.data.likes
    post.value.liked_by_user = res.data.liked
  } catch (err) {
    console.error('Gabim ne like:', err)
  }
}

// Funksioni per te shtuar nje koment
const submitComment = async () => {
  if (!auth.user) return router.push('/login')
  if (!commentText.value.trim()) return
  submitting.value = true
  try {
    await axios.post(`/api/posts/${post.value.id}/comments`, { content: commentText.value })
    commentText.value = ''
    await fetchComments()
  } catch (err) {
    console.error('Gabim ne shtimin e komentit:', err)
  } finally {
    submitting.value = false
  }
}

// Funksioni per te derguar nje reply
const submitReply = async (parentId: number) => {
  if (!replyText.value.trim()) return
  try {
    await axios.post(`/api/posts/${post.value.id}/comments`, {
      content: replyText.value,
      parent_id: parentId
    })
    replyText.value = ''
    replyingTo.value = null
    await fetchComments()
  } catch (err) {
    console.error('Gabim ne reply:', err)
  }
}

// Anulo reply
const cancelReply = () => {
  replyText.value = ''
  replyingTo.value = null
}

// Funksioni per te pelqyer nje koment
const likeComment = async (id: number) => {
  if (!auth.user) return router.push('/login')
  try {
    const res = await axios.post(`/api/comments/${id}/like`)
    const updated = comments.value.find(c => c.id === id)
    if (updated) {
      updated.likes = res.data.likes
      updated.liked = res.data.liked
    }
  } catch (err) {
    console.error('Gabim ne like te komentit:', err)
  }
}

// Funksioni per te filluar redaktimin e nje komenti
const startEdit = (comment: any) => {
  isEditing.value = comment.id
  editedContent.value = comment.content
}

// Anulo editimin
const cancelEdit = () => {
  isEditing.value = null
  editedContent.value = ''
}

// Perditeson nje koment ekzistues
const updateComment = async (id: number) => {
  if (!editedContent.value.trim()) return
  try {
    await axios.put(`/api/comments/${id}`, { content: editedContent.value })
    await fetchComments()
    cancelEdit()
  } catch (err) {
    console.error('Gabim gjate perditesimit te komentit:', err)
  }
}

// Fshin nje koment
const deleteComment = async (id: number) => {
  if (!confirm('Are you sure you want to delete this comment?')) return
  try {
    await axios.delete(`/api/comments/${id}`)
    await fetchComments()
  } catch (err) {
    console.error('Gabim gjate fshirjes se komentit:', err)
  }
}

// E marrim postin dhe komentet kur faqja ngarkohet
onMounted(async () => {
  await fetchPost()
  await fetchComments()
  loading.value = false
})
</script>

<template>
  <div class="bg-neutral-950 text-white min-h-screen py-16 px-4">
    <div v-if="loading" class="text-center text-gray-400">Loading post...</div>

    <div v-else class="max-w-3xl mx-auto space-y-12">
      <!-- Titulli dhe autori -->
      <div class="space-y-1 text-left">
        <h1 class="text-3xl sm:text-4xl font-bold text-white">
          {{ post.title }}
        </h1>
        <div class="text-sm text-gray-400 flex items-center gap-2">
          <span class="">{{ new Date(post.created_at).toLocaleDateString() }}</span>
          <span>·</span>
          <span class="flex items-center gap-1">
            <i class="text-purple-400"></i>
            <span class="text-purple-300 font-medium">{{ post.user?.name }}</span>
          </span>
        </div>
      </div>

      <!-- Imazhi me zemren e pozicionuar siper djathtas -->
      <div class="relative overflow-hidden rounded-xl shadow-xl">
        <img
          :src="`http://127.0.0.1:8000/storage/${post.image}`"
          class="w-full object-cover max-h-[500px]"
        />
        <!-- Zemra per like brenda imazhit siper djathtas -->
        <button
          @click="likePost"
          class="absolute top-4 right-4 bg-neutral-900/70 text-white px-3 py-1 rounded-full flex items-center gap-1 shadow-md hover:scale-105 transition"
        >
          <i
            class="fa-heart"
            :class="[
              post.liked_by_user ? 'fas text-pink-500' : 'far text-gray-400',
            ]"
          ></i>
          <span class="text-sm">{{ post.likes }}</span>
        </button>
      </div>

      <!-- Seksioni i pershkrimit poshte fotos -->
      <div class="relative -mt-6 px-4 sm:px-0">
        <div class="max-w-3xl mx-auto bg-neutral-900/80 border-l-4 border-purple-600 rounded-xl px-6 py-4 shadow-md">
          <h3 class="text-sm uppercase tracking-wider text-purple-400 font-semibold mb-2">Description</h3>
          <p class="text-gray-200 text-base leading-relaxed">
            {{ post.content }}
          </p>
        </div>
      </div>

      <!-- Komentet -->
      <section class="space-y-8">
        <h2 class="text-2xl font-semibold">Comments ({{ comments.length }})</h2>

        <!-- Forma per koment -->
        <div v-if="auth.user" class="space-y-2">
          <textarea
            v-model="commentText"
            rows="3"
            class="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-gray-400"
            placeholder="Write a comment..."
          ></textarea>
          <button
            @click="submitComment"
            :disabled="submitting"
            class="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded transition"
          >
            {{ submitting ? 'Posting...' : 'Post Comment' }}
          </button>
        </div>
        <div v-else class="text-sm text-gray-500">You must be logged in to comment.</div>

        <!-- Lista e komenteve -->
        <div class="space-y-6">
          <div
            v-for="comment in comments"
            :key="comment.id"
            class="bg-neutral-900 border border-neutral-800 p-4 rounded-xl space-y-3"
          >
            <!-- Info komentuesi -->
            <div class="flex justify-between items-center text-sm text-gray-400">
              <span><span class="text-purple-400 font-semibold">{{ comment.user?.name }}</span> · {{ new Date(comment.created_at).toLocaleString() }}</span>
              <button @click="likeComment(comment.id)">
                <i :class="[comment.liked ? 'fas text-blue-500' : 'far text-gray-500', 'fa-thumbs-up']"></i>
                <span class="ml-1">{{ comment.likes }}</span>
              </button>
            </div>

            <!-- Permbajtja ose editimi -->
            <div v-if="isEditing === comment.id" class="space-y-2">
              <textarea
                v-model="editedContent"
                rows="2"
                class="w-full bg-neutral-800 border border-purple-500 rounded px-3 py-2 text-white"
                placeholder="Edit your comment..."
              ></textarea>
              <div class="flex gap-2">
                <button
                  @click="updateComment(comment.id)"
                  class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1 rounded"
                >
                  Save
                </button>
                <button @click="cancelEdit" class="text-gray-400 hover:underline">Cancel</button>
              </div>
            </div>

            <!-- Komenti normal -->
            <p v-else class="text-white text-base">{{ comment.content }}</p>

            <!-- Veprimet -->
            <div class="text-sm space-x-4 text-gray-500">
              <span @click="replyingTo = comment.id" class="hover:underline cursor-pointer">Reply</span>
              <span
                v-if="auth.user?.id === comment.user_id"
                @click="startEdit(comment)"
                class="hover:underline cursor-pointer text-blue-400"
              >Edit</span>
              <span
                v-if="auth.user?.id === comment.user_id"
                @click="deleteComment(comment.id)"
                class="hover:underline cursor-pointer text-red-400"
              >Delete</span>
            </div>

            <!-- Forma per reply -->
            <div v-if="replyingTo === comment.id" class="space-y-2 mt-3">
              <textarea
                v-model="replyText"
                rows="2"
                class="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white"
                placeholder="Write a reply..."
              ></textarea>
              <div class="flex gap-2">
                <button @click="submitReply(comment.id)" class="bg-purple-600 text-white px-4 py-1 rounded hover:bg-purple-700">Reply</button>
                <button @click="cancelReply" class="text-gray-400 hover:underline">Cancel</button>
              </div>
            </div>

            <!-- Replies -->
            <div
              v-if="comment.replies?.length"
              class="pl-4 mt-4 border-l-2 border-neutral-700 space-y-4"
            >
              <div v-for="reply in comment.replies" :key="reply.id">
                <div class="text-sm text-gray-400">
                  <strong class="text-purple-400">{{ reply.user?.name }}</strong> ·
                  {{ new Date(reply.created_at).toLocaleString() }}
                </div>
                <p class="text-white text-sm">{{ reply.content }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
