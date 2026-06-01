<script setup lang="ts">
import type { Question } from '../types/question'

defineProps<{
  question: Question
}>()
</script>

<template>
  <article class="question-card" aria-label="AMA question card">
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
</style>