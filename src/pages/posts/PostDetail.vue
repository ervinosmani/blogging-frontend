
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../../api/api'
import { useAuthStore } from '../../store/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const slug = route.params.slug as string

// Te dhenat e postimit dhe komenteve
const post = ref<any>(null)
const comments = ref<any[]>([])

// Formulari i komenteve
const commentText = ref('')
const submitting = ref(false)

// Formulari i replies
const replyText = ref('')
const replyingTo = ref<number | null>(null)
const replySubmitting = ref(false)

// Editimi i komenteve
const isEditing = ref<number | null>(null)
const editedContent = ref('')

// Gjendja e faqes
const loading = ref(true)
const loadError = ref('')
const commentsError = ref('')
const actionError = ref('')

// Origjina e Laravel API per imazhet
const backendOrigin = new URL(
  import.meta.env.VITE_API_URL || window.location.origin,
  window.location.origin
).origin

const postImageSrc = computed(() => {
  const path = post.value?.image

  if (!path) return ''

  if (/^https?:\/\//i.test(path)) {
    return path
  }

  const cleanPath = String(path)
    .replace(/^\/+/, '')
    .replace(/^storage\//, '')

  return `${backendOrigin}/storage/${cleanPath}`
})

// Merr nje mesazh te kuptueshem nga gabimi i API
const getErrorMessage = (
  err: unknown,
  fallback: string
): string => {
  const response = (
    err as {
      response?: {
        data?: {
          message?: string
          errors?: Record<string, string[]>
        }
      }
    }
  )?.response

  const validationErrors = response?.data?.errors

  const firstError = validationErrors
    ? Object.values(validationErrors)[0]?.[0]
    : undefined

  return (
    firstError ||
    response?.data?.message ||
    fallback
  )
}

// Ngarko postimin sipas slug
const fetchPost = async () => {
  loadError.value = ''
  post.value = null

  try {
    const res = await api.get(
      `/api/posts/slug/${encodeURIComponent(slug)}`
    )

    post.value = res.data
  } catch (err: unknown) {
    const status = (
      err as { response?: { status?: number } }
    )?.response?.status

    loadError.value = status === 404
      ? 'Post not found.'
      : 'Unable to load this post.'

    console.error('Error loading post:', err)
  }
}

// Ngarko komentet vetem nese postimi ekziston
const fetchComments = async () => {
  if (!post.value?.id) return

  commentsError.value = ''

  try {
    const res = await api.get(
      `/api/posts/${post.value.id}/comments`
    )

    comments.value = res.data
  } catch (err) {
    commentsError.value = 'Unable to load comments.'
    console.error('Error loading comments:', err)
  }
}

// Like / unlike postimin
const likePost = async () => {
  if (!auth.user) {
    await router.push('/login')
    return
  }

  if (!post.value?.id) return

  actionError.value = ''

  try {
    const res = await api.post(
      `/api/posts/${post.value.id}/like`
    )

    post.value.likes = res.data.likes
    post.value.liked_by_user = res.data.liked
  } catch (err) {
    actionError.value = getErrorMessage(
      err,
      'Unable to update post like.'
    )
  }
}

// Krijo koment
const submitComment = async () => {
  if (!auth.user) {
    await router.push('/login')
    return
  }

  if (!post.value?.id || !commentText.value.trim()) return
  if (submitting.value) return

  submitting.value = true
  actionError.value = ''

  try {
    await api.post(
      `/api/posts/${post.value.id}/comments`,
      {
        content: commentText.value.trim()
      }
    )

    commentText.value = ''
    await fetchComments()
  } catch (err) {
    actionError.value = getErrorMessage(
      err,
      'Unable to post comment.'
    )
  } finally {
    submitting.value = false
  }
}

// Hap formularin e reply
const startReply = async (commentId: number) => {
  if (!auth.user) {
    await router.push('/login')
    return
  }

  replyingTo.value = commentId
  replyText.value = ''
  actionError.value = ''
}

// Krijo reply
const submitReply = async (parentId: number) => {
  if (!auth.user) {
    await router.push('/login')
    return
  }

  if (!post.value?.id || !replyText.value.trim()) return
  if (replySubmitting.value) return

  replySubmitting.value = true
  actionError.value = ''

  try {
    await api.post(
      `/api/posts/${post.value.id}/comments`,
      {
        content: replyText.value.trim(),
        parent_id: parentId
      }
    )

    replyText.value = ''
    replyingTo.value = null

    await fetchComments()
  } catch (err) {
    actionError.value = getErrorMessage(
      err,
      'Unable to post reply.'
    )
  } finally {
    replySubmitting.value = false
  }
}

// Anulo reply
const cancelReply = () => {
  replyText.value = ''
  replyingTo.value = null
}

// Like / unlike koment
const likeComment = async (id: number) => {
  if (!auth.user) {
    await router.push('/login')
    return
  }

  actionError.value = ''

  try {
    const res = await api.post(
      `/api/comments/${id}/like`
    )

    const updated = comments.value.find(
      comment => comment.id === id
    )

    if (updated) {
      updated.likes = res.data.likes
      updated.liked = res.data.liked
    }
  } catch (err) {
    actionError.value = getErrorMessage(
      err,
      'Unable to update comment like.'
    )
  }
}

// Fillo editimin e komentit
const startEdit = (comment: any) => {
  isEditing.value = comment.id
  editedContent.value = comment.content
  actionError.value = ''
}

// Anulo editimin
const cancelEdit = () => {
  isEditing.value = null
  editedContent.value = ''
}

// Ruaj ndryshimet e komentit
const updateComment = async (id: number) => {
  if (!editedContent.value.trim()) return

  actionError.value = ''

  try {
    await api.put(
      `/api/comments/${id}`,
      {
        content: editedContent.value.trim()
      }
    )

    await fetchComments()
    cancelEdit()
  } catch (err) {
    actionError.value = getErrorMessage(
      err,
      'Unable to update comment.'
    )
  }
}

// Fshij koment
const deleteComment = async (id: number) => {
  if (!confirm('Are you sure you want to delete this comment?')) {
    return
  }

  actionError.value = ''

  try {
    await api.delete(`/api/comments/${id}`)
    await fetchComments()
  } catch (err) {
    actionError.value = getErrorMessage(
      err,
      'Unable to delete comment.'
    )
  }
}

// Ngarko faqen
onMounted(async () => {
  try {
    await fetchPost()

    // Mos kerko komente nese postimi nuk ekziston
    if (post.value?.id) {
      await fetchComments()
    }
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="bg-neutral-950 text-white min-h-screen py-16 px-4">

    <!-- Loading -->
    <div
      v-if="loading"
      class="text-center text-gray-400"
    >
      Loading post...
    </div>

    <!-- Postimi nuk ekziston ose nuk mund te ngarkohet -->
    <div
      v-else-if="loadError"
      class="max-w-3xl mx-auto text-center py-16 space-y-5"
    >
      <h2 class="text-2xl font-bold text-white">
        {{ loadError }}
      </h2>

      <p class="text-gray-400">
        The post may have been removed or is not available.
      </p>

      <button
        @click="router.push('/')"
        class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition"
      >
        Back to Home
      </button>
    </div>

    <!-- Permbajtja kryesore -->
    <div
      v-else-if="post"
      class="max-w-3xl mx-auto space-y-12"
    >

      <!-- Titulli dhe autori -->
      <div class="space-y-1 text-left">
        <h1 class="text-3xl sm:text-4xl font-bold text-white">
          {{ post.title }}
        </h1>

        <div class="text-sm text-gray-400 flex items-center gap-2">
          <span>
            {{ new Date(post.created_at).toLocaleDateString() }}
          </span>

          <span>·</span>

          <span class="flex items-center gap-1">
            <span class="text-purple-300 font-medium">
              {{ post.user?.name }}
            </span>
          </span>
        </div>
      </div>

      <!-- Imazhi dhe pelqimet -->
      <div
        class="relative overflow-hidden rounded-xl shadow-xl"
        :class="{ 'min-h-24 bg-neutral-900': !postImageSrc }"
      >
        <img
          v-if="postImageSrc"
          :src="postImageSrc"
          :alt="post.title"
          class="w-full object-cover max-h-[500px]"
        />

        <!-- Like post -->
        <button
          type="button"
          @click="likePost"
          :aria-label="post.liked_by_user ? 'Unlike post' : 'Like post'"
          class="absolute top-4 right-4 bg-neutral-900/70 text-white px-3 py-1 rounded-full flex items-center gap-1 shadow-md hover:scale-105 transition"
        >
          <i
            class="fa-heart"
            :class="[
              post.liked_by_user
                ? 'fas text-pink-500'
                : 'far text-gray-400'
            ]"
          ></i>

          <span class="text-sm">
            {{ post.likes }}
          </span>
        </button>
      </div>

      <!-- Pershkrimi -->
      <div class="relative -mt-6 px-4 sm:px-0">
        <div
          class="max-w-3xl mx-auto bg-neutral-900/80 border-l-4 border-purple-600 rounded-xl px-6 py-4 shadow-md"
        >
          <h3
            class="text-sm uppercase tracking-wider text-purple-400 font-semibold mb-2"
          >
            Description
          </h3>

          <p class="text-gray-200 text-base leading-relaxed whitespace-pre-wrap">
            {{ post.content }}
          </p>
        </div>
      </div>

      <!-- Komentet -->
      <section class="space-y-8">

        <h2 class="text-2xl font-semibold">
          Comments ({{ comments.length }})
        </h2>

        <!-- Gabim gjate marrjes se komenteve -->
        <p
          v-if="commentsError"
          class="text-red-400 text-sm"
          role="alert"
        >
          {{ commentsError }}
        </p>

        <!-- Gabim gjate veprimeve -->
        <p
          v-if="actionError"
          class="text-red-400 text-sm"
          role="alert"
        >
          {{ actionError }}
        </p>

        <!-- Forma per koment -->
        <div v-if="auth.user" class="space-y-2">
          <textarea
            v-model="commentText"
            rows="3"
            class="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-gray-400"
            placeholder="Write a comment..."
          ></textarea>

          <button
            type="button"
            @click="submitComment"
            :disabled="submitting"
            class="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded transition disabled:opacity-50"
          >
            {{ submitting ? 'Posting...' : 'Post Comment' }}
          </button>
        </div>

        <div v-else class="text-sm text-gray-500">
          You must be logged in to comment.
        </div>

        <!-- Lista e komenteve -->
        <div class="space-y-6">

          <div
            v-for="comment in comments"
            :key="comment.id"
            class="bg-neutral-900 border border-neutral-800 p-4 rounded-xl space-y-3"
          >

            <!-- Informacionet e komentuesit -->
            <div
              class="flex justify-between items-center text-sm text-gray-400 gap-3"
            >
              <span>
                <span class="text-purple-400 font-semibold">
                  {{ comment.user?.name }}
                </span>

                ·

                {{ new Date(comment.created_at).toLocaleString() }}
              </span>

              <!-- Like koment -->
              <button
                type="button"
                @click="likeComment(comment.id)"
                :aria-label="comment.liked ? 'Unlike comment' : 'Like comment'"
                class="shrink-0"
              >
                <i
                  :class="[
                    comment.liked
                      ? 'fas text-blue-500'
                      : 'far text-gray-500',
                    'fa-thumbs-up'
                  ]"
                ></i>

                <span class="ml-1">
                  {{ comment.likes }}
                </span>
              </button>
            </div>

            <!-- Editimi i komentit -->
            <div
              v-if="isEditing === comment.id"
              class="space-y-2"
            >
              <textarea
                v-model="editedContent"
                rows="2"
                class="w-full bg-neutral-800 border border-purple-500 rounded px-3 py-2 text-white"
                placeholder="Edit your comment..."
              ></textarea>

              <div class="flex gap-2">
                <button
                  type="button"
                  @click="updateComment(comment.id)"
                  class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1 rounded"
                >
                  Save
                </button>

                <button
                  type="button"
                  @click="cancelEdit"
                  class="text-gray-400 hover:underline"
                >
                  Cancel
                </button>
              </div>
            </div>

            <!-- Permbajtja normale e komentit -->
            <p v-else class="text-white text-base whitespace-pre-wrap">
              {{ comment.content }}
            </p>

            <!-- Veprimet e komentit -->
            <div class="text-sm flex flex-wrap gap-4 text-gray-500">

              <button
                type="button"
                @click="startReply(comment.id)"
                class="hover:underline"
              >
                Reply
              </button>

              <button
                v-if="auth.user?.id === comment.user_id"
                type="button"
                @click="startEdit(comment)"
                class="hover:underline text-blue-400"
              >
                Edit
              </button>

              <button
                v-if="auth.user?.id === comment.user_id"
                type="button"
                @click="deleteComment(comment.id)"
                class="hover:underline text-red-400"
              >
                Delete
              </button>
            </div>

            <!-- Forma per reply -->
            <div
              v-if="replyingTo === comment.id"
              class="space-y-2 mt-3"
            >
              <textarea
                v-model="replyText"
                rows="2"
                class="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white"
                placeholder="Write a reply..."
              ></textarea>

              <div class="flex gap-2">
                <button
                  type="button"
                  @click="submitReply(comment.id)"
                  :disabled="replySubmitting"
                  class="bg-purple-600 text-white px-4 py-1 rounded hover:bg-purple-700 disabled:opacity-50"
                >
                  {{ replySubmitting ? 'Posting...' : 'Reply' }}
                </button>

                <button
                  type="button"
                  @click="cancelReply"
                  class="text-gray-400 hover:underline"
                >
                  Cancel
                </button>
              </div>
            </div>

            <!-- Replies ekzistuese -->
            <div
              v-if="comment.replies?.length"
              class="pl-4 mt-4 border-l-2 border-neutral-700 space-y-4"
            >
              <div
                v-for="reply in comment.replies"
                :key="reply.id"
              >
                <div class="text-sm text-gray-400">
                  <strong class="text-purple-400">
                    {{ reply.user?.name }}
                  </strong>

                  ·

                  {{ new Date(reply.created_at).toLocaleString() }}
                </div>

                <p class="text-white text-sm whitespace-pre-wrap">
                  {{ reply.content }}
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  </div>
</template>
