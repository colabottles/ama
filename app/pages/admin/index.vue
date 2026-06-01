<script setup lang="ts">
import { ref, computed } from 'vue'
import { definePageMeta, useRuntimeConfig, useFetch, navigateTo, useHead } from '#imports'
import { useAuth } from '~/composables/useAuth'
import type { Question } from '../../types/question'

definePageMeta({ middleware: 'auth' })

const config = useRuntimeConfig()
const { signOut } = useAuth()
const handle = config.public.siteHandle as string
const displayName = config.public.siteDisplayName as string

const { data: questions, refresh } = await useFetch<Question[]>('/api/questions', {
  query: { admin: 'true' }
})

const selected = ref<Question | null>(null)
const answerDraft = ref('')
const saving = ref(false)
const copied = ref(false)
const posting = ref(false)
const postError = ref('')

async function handleSignOut() {
  await signOut()
  await navigateTo('/')
}

function selectQuestion(q: Question) {
  selected.value = q
  answerDraft.value = q.answer ?? ''
}

async function saveAnswer() {
  if (!selected.value) return
  saving.value = true
  try {
    await $fetch(`/api/questions/${selected.value.id}`, {
      method: 'PATCH',
      body: { answered: true, answer: answerDraft.value || null }
    })
    await refresh()
    const updated = questions.value?.find(q => q.id === selected.value!.id)
    if (updated) selected.value = updated
  } finally {
    saving.value = false
  }
}

async function dismiss(q: Question) {
  await $fetch(`/api/questions/${q.id}`, {
    method: 'PATCH',
    body: { answered: false }
  })
  if (selected.value?.id === q.id) selected.value = null
  await refresh()
}

async function deleteQuestion(q: Question) {
  if (!confirm('Delete this question? This cannot be undone.')) return
  await $fetch(`/api/questions/${q.id}`, { method: 'DELETE' })
  if (selected.value?.id === q.id) selected.value = null
  await refresh()
}

function blueskyPostText(q: Question): string {
  const text = q.answer ? q.answer.trim() : q.question.trim()
  return `${text} #ama`
}

async function shareToBluesky(q: Question) {
  if (!q.answer?.trim()) {
    postError.value = 'Add an answer before sharing.'
    return
  }
  postError.value = ''
  posting.value = true
  try {
    await $fetch('/api/bluesky', {
      method: 'POST',
      body: {
        text: `${q.answer.trim()} #ama`,
        questionUrl: `https://asktodd.netlify.app/ama/${q.id}`,
      },
    })
    postError.value = ''
    alert('Posted to Bluesky!')
  } catch (e: any) {
    postError.value = e?.data?.message ?? 'Failed to post. Check your credentials.'
  } finally {
    posting.value = false
  }
}

async function copyPost(q: Question) {
  await navigator.clipboard.writeText(blueskyPostText(q))
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

const unanswered = computed(() => questions.value?.filter(q => !q.answered) ?? [])
const answered = computed(() => questions.value?.filter(q => q.answered) ?? [])

useHead({ title: 'Admin — AMA' })
</script>

<template>
  <div class="admin-layout">
    <nav class="admin-nav" aria-label="Admin navigation">
      <span class="nav-title">AMA Admin</span>
      <div class="nav-actions">
        <a href="/" class="nav-link">← Public page</a>
        <button class="nav-signout" @click="handleSignOut">Sign out</button>
      </div>
    </nav>

    <main class="admin-main">
      <!-- question list -->
      <aside class="question-list" aria-label="Submitted questions">
        <section aria-labelledby="unanswered-heading">
          <h2 id="unanswered-heading" class="list-heading">
            Unanswered
            <span class="badge" aria-label="{{ unanswered.length }} unanswered">{{ unanswered.length
              }}</span>
          </h2>
          <ul class="q-list" role="list">
            <li
              v-for="q in unanswered"
              :key="q.id"
              class="q-item"
              :class="{ 'q-item--active': selected?.id === q.id }">
              <button class="q-btn" @click="selectQuestion(q)">
                {{ q.question }}
              </button>
            </li>
            <li v-if="unanswered.length === 0" class="q-empty">No questions yet.</li>
          </ul>
        </section>

        <section aria-labelledby="answered-heading" class="answered-section">
          <h2 id="answered-heading" class="list-heading">Answered</h2>
          <ul class="q-list" role="list">
            <li
              v-for="q in answered"
              :key="q.id"
              class="q-item q-item--answered"
              :class="{ 'q-item--active': selected?.id === q.id }">
              <button class="q-btn" @click="selectQuestion(q)">
                {{ q.question }}
              </button>
            </li>
            <li v-if="answered.length === 0" class="q-empty">None yet.</li>
          </ul>
        </section>
      </aside>

      <!-- detail / card panel -->
      <section class="detail-panel" aria-label="Question detail and card preview">
        <div v-if="!selected" class="detail-empty">
          <p>Select a question to preview its card.</p>
        </div>

        <div v-else class="detail-content">
          <header class="detail-header">
            <h2 class="detail-q">{{ selected.question }}</h2>
          </header>

          <!-- answer editor -->
          <div class="answer-editor">
            <label for="answer-input" class="editor-label">Your answer (optional)</label>
            <textarea
              id="answer-input"
              v-model="answerDraft"
              class="editor-textarea"
              rows="3"
              placeholder="Leave blank to share just the question…"></textarea>
            <div class="editor-actions">
              <button
                class="btn btn--primary"
                :disabled="saving"
                :aria-busy="saving"
                @click="saveAnswer">
                {{ saving ? 'Saving…' : 'Mark answered' }}
              </button>
              <button class="btn btn--ghost" @click="dismiss(selected)">
                Dismiss
              </button>
              <button class="btn btn--danger" @click="deleteQuestion(selected)">
                Delete
              </button>
            </div>
          </div>

          <!-- card preview -->
          <div class="card-preview" aria-label="Shareable card preview">
            <p class="preview-label">Card preview</p>
            <QuestionCard
              :question="selected"
              :handle="handle"
              :display-name="displayName" />
            <div class="share-actions">
              <button
                class="btn btn--copy"
                :aria-label="copied ? 'Copied!' : 'Copy post text'"
                @click="copyPost(selected)">
                {{ copied ? '✓ Copied!' : 'Copy post text' }}
              </button>
              <button
                class="btn btn--bluesky"
                :disabled="posting"
                :aria-busy="posting"
                @click="shareToBluesky(selected)">
                {{ posting ? 'Posting…' : 'Post to Bluesky' }}
              </button>
            </div>
            <p v-if="postError" class="post-error" role="alert">{{ postError }}</p>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.admin-layout {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--color-bg);
  color: var(--color-text);
}

.admin-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface);
}

.nav-title {
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--color-accent);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-signout {
  font-family: var(--font-body);
  font-size: 0.85rem;
  font-weight: 600;
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-muted);
  border-radius: 6px;
  padding: 0.35rem 0.75rem;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}

.nav-signout:hover {
  color: var(--color-text);
  border-color: var(--color-ruby);
}

.nav-link {
  font-size: 0.85rem;
  color: var(--color-muted);
  text-decoration: none;
}

.nav-link:hover {
  color: var(--color-text);
}

.admin-main {
  flex: 1;
  display: grid;
  grid-template-columns: 300px 1fr;
  overflow: hidden;
}

.question-list {
  border-right: 1px solid var(--color-border);
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.list-heading {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-muted);
  font-weight: 600;
  margin: 0 0 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.badge {
  background: var(--color-accent);
  color: #000;
  border-radius: 999px;
  font-size: 0.7rem;
  padding: 0.1em 0.5em;
  font-weight: 700;
}

.q-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.q-item {
  border-radius: 6px;
}

.q-item--active {
  background: var(--color-surface);
  outline: 1px solid var(--color-accent);
}

.q-item--answered .q-btn {
  color: var(--color-muted);
}

.q-btn {
  all: unset;
  display: block;
  width: 100%;
  padding: 0.6rem 0.75rem;
  font-size: 0.85rem;
  line-height: 1.5;
  cursor: pointer;
  color: var(--color-text);
  border-radius: 6px;
  box-sizing: border-box;
}

.q-btn:hover {
  background: var(--color-surface);
}

.q-empty {
  font-size: 0.82rem;
  color: var(--color-muted);
  padding: 0.5rem 0.75rem;
}

.answered-section {
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
}

.detail-panel {
  overflow-y: auto;
  padding: 1.5rem;
}

.detail-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--color-muted);
  font-size: 0.9rem;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 600px;
}

.detail-header {
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 1rem;
}

.detail-q {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  line-height: 1.5;
}

.answer-editor {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.editor-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.editor-textarea {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text);
  font-family: var(--font-body);
  font-size: 0.9rem;
  line-height: 1.6;
  padding: 0.75rem 1rem;
  resize: vertical;
  transition: border-color 0.15s;
  box-sizing: border-box;
  width: 100%;
}

.editor-textarea:focus {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.editor-actions {
  display: flex;
  gap: 0.5rem;
}

.btn {
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  padding: 0.55rem 1.1rem;
  transition: opacity 0.15s, transform 0.1s;
}

.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.btn:not(:disabled):active {
  transform: scale(0.97);
}

.btn--primary {
  background: var(--color-accent);
  color: #000;
}

.btn--primary:not(:disabled):hover {
  opacity: 0.85;
}

.btn--ghost {
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text);
}

.btn--ghost:hover {
  background: var(--color-surface);
}

.btn--danger {
  background: transparent;
  border: 1px solid #7f1d1d;
  color: #f87171;
}

.btn--danger:hover {
  background: #7f1d1d;
  color: #fff;
}

.card-preview {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.preview-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-muted);
  font-weight: 600;
  margin: 0;
}

.btn--copy {
  background: #1d9bf0;
  color: #fff;
}

.btn--copy:hover {
  opacity: 0.85;
}

.btn--bluesky {
  background: #1d9bf0;
  color: #fff;
}

.btn--bluesky:hover:not(:disabled) {
  opacity: 0.85;
}

.share-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.post-error {
  font-size: 0.85rem;
  color: #f87171;
  margin: 0;
}

@media (max-width: 640px) {
  .admin-main {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }

  .question-list {
    border-right: none;
    border-bottom: 1px solid var(--color-border);
    max-height: 220px;
  }
}
</style>