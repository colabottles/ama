<template>
  <div>
    <NuxtPage />
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Michroma&family=Barlow:wght@400;500;600;700&display=swap');

*,
*::before,
*::after {
  box-sizing: content-box;
}

:root {
  --color-bg: #000000;
  --color-deep-crimson: #140506;
  --color-rich-crimson: #572620;
  --color-ruby: #C11E23;
  --color-peach: #F46945;
  --color-surface: #1a0608;
  --color-border: #3a1012;
  --color-text: #fafafa;
  --color-muted: #a07070;
  --color-accent: #F46945;

  --font-display: 'Michroma', sans-serif;
  --font-body: 'Barlow', sans-serif;
  --font-mono: 'Jetbrains Mono', Courier, monospace;
}

html,
body {
  margin: 0;
  padding: 0;
  font-family: var(--font-body);
  background: var(--color-bg);
  color: var(--color-text);
  -webkit-font-smoothing: antialiased;
}

/* focus visible for keyboard nav */
:focus-visible {
  outline: 2px solid var(--color-ruby);
  outline-offset: 3px;
}
</style>