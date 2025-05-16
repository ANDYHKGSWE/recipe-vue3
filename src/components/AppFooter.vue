<template>
  <footer class="app-footer">
    <div class="footer-content">
      <p>&copy; {{ currentYear }} Andy Cheung.</p>
      <p>
        <a href="#top" @click.prevent="scrollToTop">Till toppen av sidan</a>
      </p>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}
</script>

<style scoped>
.app-footer {
  background-color: var(--color-background-mute); /* Anpassa färgen efter ditt tema */
  color: var(--color-text); /* Anpassa textfärgen */
  padding: 20px 0;
  text-align: center;
  border-top: 1px solid var(--color-border);
  margin-top: 40px; /* Ge lite utrymme från innehållet ovanför */
}

.footer-content p {
  margin: 5px 0;
  font-size: 0.9em;
}

.footer-content a {
  color: var(--color-heading); /* Anpassa länkfärgen */
  text-decoration: none;
}

.footer-content a:hover {
  text-decoration: underline;
}
</style>
