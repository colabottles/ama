<script setup lang="ts">
import type { Question } from '../types/question'

const props = defineProps<{
  question: Question
  handle: string
  displayName: string
}>()

// format relative time
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}
</script>

<template>
  <article class="question-card" aria-label="AMA question card">
    <header class="card-header">
      <div class="card-meta">
        <span class="card-display-name">{{ displayName }}</span>
        <span class="card-handle">{{ handle }}</span>
      </div>
      <span class="card-badge" aria-label="AMA tag">#ama</span>
    </header>

    <div class="card-terminal" role="img" :aria-label="`Question: ${question.question}`">
      <div class="terminal-chrome" aria-hidden="true">
        <span class="dot dot--red"></span>
        <span class="dot dot--yellow"></span>
        <span class="dot dot--green"></span>
      </div>
      <div class="terminal-body">
        <div class="terminal-line">
          <span class="line-text">{{ question.question }}</span>
        </div>
      </div>
      <footer class="terminal-footer" aria-hidden="true">
        <span>toddl.dev/ama</span>
        <span>asked {{ timeAgo(question.created_at) }}</span>
      </footer>
    </div>
  </article>
</template>

<style scoped>
.question-card {
  background: #000000;
  border: 1px solid #3a1012;
  border-radius: 12px;
  padding: 1.25rem;
  max-width: 480px;
  font-family: inherit;
  color: #fafafa;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.card-meta {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.card-display-name {
  font-weight: 700;
  font-size: 1rem;
  color: #fafafa;
}

.card-handle {
  font-size: 0.85rem;
  color: #a07070;
}

.card-badge {
  font-size: 0.85rem;
  font-weight: 600;
  color: #F46945;
}

/* terminal */
.card-terminal {
  background: linear-gradient(135deg, #140506 0%, #C11E23 100%);
  border-radius: 8px;
  padding: 0.75rem;
  overflow: hidden;
}

.terminal-chrome {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin-bottom: 0.6rem;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.dot--red {
  background: #ff5f57;
}

.dot--yellow {
  background: #febc2e;
}

.dot--green {
  background: #28c840;
}

.terminal-body {
  background: #000000;
  border-radius: 4px;
  padding: 0.6rem 0.75rem;
}

.terminal-line {
  display: flex;
  gap: 0.75rem;
  font-family: 'Courier New', monospace;
  font-size: 0.82rem;
  color: #fafafa;
  line-height: 1.5;
}

.line-text {
  flex: 1;
  white-space: pre-wrap;
  word-break: break-word;
}

.terminal-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.35);
  font-family: 'Courier New', monospace;
}
</style>