<script setup lang="ts">
import { ref, computed } from 'vue'
import { useHead, navigateTo } from '#imports'
import { useAuth } from '~/composables/useAuth'

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const { signIn } = useAuth()

async function submit() {
  error.value = ''
  if (!email.value.trim() || !password.value) {
    error.value = 'Email and password are required.'
    return
  }
  loading.value = true
  try {
    await signIn(email.value.trim(), password.value)
    await navigateTo('/admin')
  } catch (e: any) {
    error.value = e?.message ?? 'Invalid credentials.'
  } finally {
    loading.value = false
  }
}

useHead({ title: 'Sign in — AMA Admin' })
</script>

<template>
  <main class="login-main">
    <div class="login-container">
      <header class="login-header">
        <p class="login-eyebrow">admin</p>
        <h1 class="login-title">Sign in</h1>
      </header>

      <section class="login-form-section" aria-label="Sign in form">
        <div class="login-form">
          <div class="field">
            <label for="email-input" class="field-label">Email</label>
            <input
              id="email-input"
              v-model="email"
              type="email"
              class="field-input"
              autocomplete="email"
              :disabled="loading"
              aria-describedby="login-error"
              @keydown.enter="submit" />
          </div>

          <div class="field">
            <label for="password-input" class="field-label">Password</label>
            <input
              id="password-input"
              v-model="password"
              type="password"
              class="field-input"
              autocomplete="current-password"
              :disabled="loading"
              aria-describedby="login-error"
              @keydown.enter="submit" />
          </div>

          <p
            v-if="error"
            id="login-error"
            class="login-error"
            role="alert"
            aria-live="assertive">
            {{ error }}
          </p>

          <button
            class="btn btn--primary"
            :disabled="loading"
            :aria-busy="loading"
            @click="submit">
            {{ loading ? 'Signing in…' : 'Sign in' }}
          </button>
        </div>
      </section>

      <footer class="login-footer">
        <a href="/" class="login-link">← Back to AMA</a>
      </footer>
    </div>
  </main>
</template>

<style scoped>
.login-main {
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

.login-container {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.login-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.login-eyebrow {
  font-size: 0.78rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-peach);
  font-weight: 600;
  margin: 0;
}

.login-title {
  font-family: var(--font-display);
  font-size: clamp(1.75rem, 5vw, 2.5rem);
  font-weight: 400;
  color: var(--color-text);
  line-height: 1.1;
  margin: 0;
}

.login-form-section {
  background: rgba(20, 5, 6, 0.75);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.5rem;
  backdrop-filter: blur(8px);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.field-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.field-input {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text);
  font-family: var(--font-body);
  font-size: 0.95rem;
  padding: 0.75rem 1rem;
  transition: border-color 0.15s;
  box-sizing: border-box;
  width: 100%;
}

.field-input:focus {
  outline: 2px solid var(--color-ruby);
  outline-offset: 2px;
  border-color: var(--color-ruby);
}

.field-input:disabled {
  opacity: 0.5;
}

.login-error {
  font-size: 0.85rem;
  color: #f87171;
  margin: 0;
}

.btn {
  box-sizing: border-box;
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  padding: 0.7rem 1.25rem;
  transition: opacity 0.15s, transform 0.1s;
  margin-top: 0.25rem;
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
  width: 100%;
}

.btn--primary:not(:disabled):hover {
  opacity: 0.85;
}

.login-footer {
  text-align: center;
}

.login-link {
  font-size: 0.85rem;
  color: var(--color-muted);
  text-decoration: none;
}

.login-link:hover {
  color: var(--color-peach);
  text-decoration: underline;
}
</style>