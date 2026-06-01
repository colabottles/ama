<script setup lang="ts">
import { ref, computed } from 'vue'
import { useHead } from '#imports'

const question = ref('')
const submitted = ref(false)
const error = ref('')
const loading = ref(false)
const MAX = 280

const remaining = computed(() => MAX - question.value.length)

async function submit() {
  error.value = ''
  if (!question.value.trim()) {
    error.value = 'Please write a question.'
    return
  }
  loading.value = true
  try {
    await $fetch('/api/questions', {
      method: 'POST',
      body: { question: question.value }
    })
    submitted.value = true
  } catch (e: any) {
    error.value = e?.data?.message ?? 'Something went wrong. Try again.'
  } finally {
    loading.value = false
  }
}

function reset() {
  question.value = ''
  submitted.value = false
  error.value = ''
}

useHead({ title: 'Ask me anything, anonymously' })
</script>

<template>
  <main class="ama-main">
    <div class="ama-container">
      <header class="ama-header">
        <p class="ama-eyebrow">Todd L. 🦞 </p>
        <h1 class="ama-title">Ask me anything!</h1>
        <p class="ama-subtitle">
          Questions are anonymous. I read every one.
        </p>
      </header>

      <section aria-label="Question submission form" class="ama-form-section">
        <div v-if="submitted" class="ama-success" role="alert" aria-live="polite">
          <p class="success-icon" aria-hidden="true">✓</p>
          <p class="success-text">Question sent. Thanks!</p>
          <button class="btn btn--ghost" @click="reset">Ask another</button>
        </div>

        <div v-else class="ama-form">
          <label for="question-input" class="sr-only">Your question</label>
          <textarea
            id="question-input"
            v-model="question"
            class="ama-textarea"
            placeholder="How do you maintain large projects well?"
            :maxlength="MAX"
            rows="4"
            aria-describedby="char-count error-msg"></textarea>

          <div class="form-footer">
            <span
              id="char-count"
              class="char-count"
              :class="{ 'char-count--warn': remaining < 40 }"
              aria-live="polite"
              aria-atomic="true">
              {{ remaining }} left
            </span>
            <button
              class="btn btn--primary"
              :disabled="loading || !question.trim()"
              :aria-busy="loading"
              @click="submit">
              {{ loading ? 'Sending…' : 'Send question' }}
            </button>
          </div>

          <p
            v-if="error"
            id="error-msg"
            class="ama-error"
            role="alert"
            aria-live="assertive">
            {{ error }}
          </p>
        </div>
      </section>

      <footer class="ama-footer">
        <a href="https://bsky.app/profile/toddl.dev" class="ama-link" target="_blank"
          rel="noopener noreferrer">
          @toddl.dev on Bluesky
        </a>
      </footer>
    </div>
  </main>
</template>

<style scoped>
.ama-main {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  background:
    radial-gradient(ellipse at 60% 20%, #C11E23 0%, transparent 55%),
    radial-gradient(ellipse at 20% 80%, #572620 0%, transparent 50%),
    #000000;
}

.ama-container {
  width: 100%;
  max-width: 520px;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.ama-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.ama-eyebrow {
  font-size: 0.78rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-peach);
  font-weight: 600;
  margin: 0;
}

.ama-title {
  font-family: var(--font-display);
  font-size: clamp(1.8rem, 6vw, 2.4rem);
  font-weight: 800;
  color: var(--color-text);
  line-height: 1.1;
  margin: 0;
}

.ama-subtitle {
  color: var(--color-muted);
  font-size: 0.95rem;
  margin: 0;
}

.ama-form-section {
  background: rgba(20, 5, 6, 0.75);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.5rem;
  backdrop-filter: blur(8px);
}

.ama-textarea {
  width: 100%;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text);
  font-family: var(--font-mono);
  font-size: 0.9rem;
  line-height: 1.6;
  padding: 0.875rem 1rem;
  resize: vertical;
  transition: border-color 0.15s;
  box-sizing: border-box;
}

.ama-textarea:focus {
  outline: 2px solid var(--color-ruby);
  outline-offset: 2px;
  border-color: var(--color-ruby);
}

.ama-textarea::placeholder {
  color: var(--color-muted);
}

.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.75rem;
  gap: 0.75rem;
}

.char-count {
  font-size: 0.8rem;
  color: var(--color-muted);
  font-variant-numeric: tabular-nums;
}

.char-count--warn {
  color: #f97316;
}

.btn {
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  padding: 0.6rem 1.25rem;
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
  background: var(--color-ruby);
  color: #fff;
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

.ama-error {
  margin-top: 0.75rem;
  font-size: 0.85rem;
  color: #f87171;
}

/* success state */
.ama-success {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 0;
  text-align: center;
}

.success-icon {
  font-size: 2rem;
  color: var(--color-peach);
  margin: 0;
}

.success-text {
  font-size: 1.05rem;
  color: var(--color-text);
  font-weight: 600;
  margin: 0;
}

.ama-footer {
  text-align: center;
}

.ama-link {
  font-size: 0.85rem;
  color: var(--color-muted);
  text-decoration: none;
}

.ama-link:hover {
  color: var(--color-peach);
  text-decoration: underline;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>