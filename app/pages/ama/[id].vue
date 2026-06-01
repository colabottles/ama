<script setup lang="ts">
import { useHead, useRoute, useFetch, createError } from '#imports'
import type { Question } from '../../types/question'

const route = useRoute()
const id = route.params.id as string

const { data: question } = await useFetch<Question>(`/api/questions/${id}`)

if (!question.value) {
  throw createError({ statusCode: 404, message: 'Question not found.' })
}

const siteUrl = 'https://asktodd.netlify.app'

useHead({
  title: question.value.question,
  meta: [
    { name: 'description', content: question.value.answer ?? 'Ask Todd anything, anonymously.' },
    { property: 'og:title', content: question.value.question },
    { property: 'og:description', content: question.value.answer ?? 'Ask Todd anything, anonymously.' },
    { property: 'og:image', content: `${siteUrl}/api/og/${id}` },
    { property: 'og:image:width', content: '800' },
    { property: 'og:image:height', content: '418' },
    { property: 'og:url', content: `${siteUrl}/ama/${id}` },
    { property: 'og:type', content: 'article' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:image', content: `${siteUrl}/api/og/${id}` },
  ],
})
</script>

<template>
  <main class="question-page">
    <div class="question-container">
      <a href="/ama" class="back-link">← Ask a question</a>

      <article class="question-article" v-if="question">
        <h1 class="question-text">{{ question.question }}</h1>
        <div v-if="question.answer" class="answer-block">
          <p class="answer-text">{{ question.answer }}</p>
        </div>
      </article>
    </div>
  </main>
</template>

<style scoped>
.question-page {
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

.question-container {
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.back-link {
  font-size: 0.85rem;
  color: var(--color-muted);
  text-decoration: none;
}

.back-link:hover {
  color: var(--color-peach);
}

.question-article {
  background: rgba(20, 5, 6, 0.75);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 2rem;
  backdrop-filter: blur(8px);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.question-text {
  font-family: var(--font-display);
  font-size: clamp(1.25rem, 4vw, 1.75rem);
  font-weight: 400;
  color: var(--color-text);
  line-height: 1.4;
  margin: 0;
}

.answer-block {
  border-left: 3px solid var(--color-ruby);
  padding-left: 1rem;
}

.answer-text {
  font-size: 1rem;
  line-height: 1.7;
  color: var(--color-text);
  margin: 0;
}
</style>