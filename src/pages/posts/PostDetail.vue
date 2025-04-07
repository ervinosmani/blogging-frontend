<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from '../../api/api'
import { useAuthStore } from '../../store/auth'

const route = useRoute()
const router = useRouter()
const slug = route.params.slug as string

const post = ref<any>(null)
const loading = ref(true)
const comments = ref<any[]>([])
const commentText = ref('')
const auth = useAuthStore()
const submitting = ref(false)

const isEditing = ref<number | null>(null)
const editedContent = ref('')

const replyingTo = ref<number | null>(null)
const replyText = ref('')

// Fetch post
const fetchPost = async () => {
  try {
    const res = await axios.get(`/api/posts/slug/${slug}`)
    post.value = res.data
  } catch (error) {
    console.error('Error fetching post:', error)
  }
}

// Fetch comments
const fetchComments = async () => {
  if (!post.value) return
  try {
    const res = await axios.get(`/api/posts/${post.value.id}/comments`)
    comments.value = res.data
  } catch (error) {
    console.error('Error fetching comments:', error)
  }
}

// Post comment
const submitComment = async () => {
  if (!auth.user) {
    router.push('/login')
    return
  }

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

// Post reply
const submitReply = async (parentId: number) => {
  if (!auth.user) {
    router.push('/login')
    return
  }

  if (!replyText.value.trim()) return
  try {
    await axios.post(`/api/posts/${post.value.id}/comments`, {
      content: replyText.value,
      parent_id: parentId
    })
    replyText.value = ''
    replyingTo.value = null
    await fetchComments()
  } catch (error) {
    console.error('Error posting reply:', error)
  }
}

const cancelReply = () => {
  replyingTo.value = null
  replyText.value = ''
}

// Edit
const startEdit = (comment: any) => {
  isEditing.value = comment.id
  editedContent.value = comment.content
}

const cancelEdit = () => {
  isEditing.value = null
  editedContent.value = ''
}

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

// Delete
const deleteComment = async (id: number) => {
  if (!confirm('Are you sure you want to delete this comment?')) return
  try {
    await axios.delete(`/api/comments/${id}`)
    await fetchComments()
  } catch (error) {
    console.error('Error deleting comment', error)
  }
}

// Like Comment
const likeComment = async (id: number) => {
  if (!auth.user) {
    router.push('/login')
    return
  }

  try {
    const res = await axios.post(`/api/comments/${id}/like`)
    const updated = comments.value.find(c => c.id === id)
    if (updated) {
      updated.likes = res.data.likes
      updated.liked = res.data.liked
    }
  } catch (error) {
    console.error('Error liking comment:', error)
  }
}

// Like post
const likePost = async () => {
  if (!auth.user) {
    router.push('/login')
    return
  }

  if (!post.value?.id) return

  try {
    const res = await axios.post(`/api/posts/${post.value.id}/like`)
    post.value.likes = res.data.likes
    post.value.liked_by_user = res.data.liked
  } catch (error) {
    console.error('Error liking post:', error)
  }
}

onMounted(async () => {
  await fetchPost()
  await fetchComments()
  loading.value = false
})
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 py-12">
    <div v-if="loading" class="text-center text-gray-600 text-lg">Loading post...</div>

    <div v-else-if="post" class="space-y-10">
      <!-- Header -->
      <div class="text-center space-y-3">
        <h1 class="text-5xl font-extrabold text-gray-900 leading-tight">{{ post.title }}</h1>
        <p class="text-gray-500">
          Published on {{ new Date(post.created_at).toLocaleDateString() }} by
          <span class="font-medium text-gray-700">{{ post.user?.name || 'Unknown' }}</span>
        </p>
      </div>

      <!-- Image -->
      <div v-if="post.image">
        <img
          :src="`http://127.0.0.1:8000/storage/${post.image}`"
          alt="Post Image"
          class="w-full max-h-[500px] object-cover rounded-lg shadow-md"
        />
      </div>

      <!-- Content -->
      <div class="prose prose-lg lg:prose-xl max-w-none mx-auto text-gray-800" v-html="post.content"></div>

      <!-- Like Section -->
      <div class="flex justify-center">
        <button
          @click="likePost"
          class="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition text-xl"
        >
          <span :class="post.liked_by_user ? 'text-red-600' : 'text-gray-400'">❤️</span>
          <span>{{ post.likes }}</span>
        </button>
      </div>

      <!-- Comments -->
      <div class="mt-16">
        <h2 class="text-2xl font-bold mb-4">Comments ({{ comments.length }})</h2>

        <!-- Comment form -->
        <div v-if="auth.user" class="mb-8">
          <textarea
            v-model="commentText"
            rows="3"
            class="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Write a comment..."
          ></textarea>
          <button
            class="mt-2 bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition"
            @click="submitComment"
            :disabled="submitting"
          >
            {{ submitting ? 'Posting...' : 'Post Comment' }}
          </button>
        </div>
        <div v-else class="text-gray-500 mb-6">You must be logged in to comment.</div>

        <!-- Comment list -->
        <div v-if="comments.length">
          <div
            v-for="comment in comments"
            :key="comment.id"
            class="mb-6 p-5 bg-gray-50 border border-gray-200 rounded-lg shadow-sm"
          >
            <!-- Edit -->
            <div v-if="isEditing === comment.id" class="mb-4">
              <textarea
                v-model="editedContent"
                rows="2"
                class="w-full p-2 border rounded resize-none"
              ></textarea>
              <div class="flex space-x-2 mt-2">
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

            <!-- Normal Comment -->
            <template v-else>
              <p class="text-gray-800 mb-2">{{ comment.content }}</p>
            </template>

            <div class="flex justify-between items-center text-sm text-gray-500">
              <div class="flex items-center space-x-2">
                <span class="font-medium text-gray-700">{{ comment.user?.name || 'Anonymous' }}</span>
                <span class="text-xs text-gray-400">· {{ new Date(comment.created_at).toLocaleString() }}</span>
              </div>

              <button
                @click="likeComment(comment.id)"
                :title="comment.liked ? 'Unlike this comment' : 'Like this comment'"
                class="flex items-center space-x-1 text-sm focus:outline-none cursor-pointer"
              >
                <span
                  :class="[comment.liked ? 'text-blue-600' : 'text-gray-400']"
                  class="text-lg transition"
                >👍</span>
                <span class="text-gray-700 font-medium">{{ comment.likes }}</span>
              </button>
            </div>

            <!-- Actions -->
            <div class="mt-3 text-sm flex space-x-4">
              <button @click="replyingTo = comment.id" class="text-gray-600 hover:underline">Reply</button>
              <button
                v-if="auth.user?.id === comment.user_id"
                @click="startEdit(comment)"
                class="text-blue-600 hover:underline"
              >Edit</button>
              <button
                v-if="auth.user?.id === comment.user_id"
                @click="deleteComment(comment.id)"
                class="text-red-600 hover:underline"
              >Delete</button>
            </div>

            <!-- Reply form -->
            <div v-if="replyingTo === comment.id" class="mt-4">
              <textarea
                v-model="replyText"
                rows="2"
                class="w-full p-2 border rounded resize-none"
                placeholder="Write a reply..."
              ></textarea>
              <div class="flex space-x-2 mt-1">
                <button
                  class="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  @click="submitReply(comment.id)"
                >Reply</button>
                <button class="text-sm text-gray-500" @click="cancelReply">Cancel</button>
              </div>
            </div>

            <!-- Replies -->
            <div
              v-if="comment.replies && comment.replies.length"
              class="ml-4 mt-4 border-l-2 border-gray-300 pl-4"
            >
              <div
                v-for="reply in comment.replies"
                :key="reply.id"
                class="mb-3"
              >
                <div class="text-gray-800 text-sm">{{ reply.content }}</div>
                <div class="text-xs text-gray-500">
                  {{ reply.user?.name || 'Anonymous' }} ·
                  {{ new Date(reply.created_at).toLocaleString() }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-gray-500">No comments yet.</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
textarea {
  font-family: inherit;
}
</style>
