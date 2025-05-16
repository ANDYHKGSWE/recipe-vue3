<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { provide } from 'vue'
import AppFooter from './components/AppFooter.vue'

// Provide data to child components
provide('theme', {
  primaryColor: 'var(--vt-c-indigo)',
  secondaryColor: 'green',
})
</script>

<template>
  <div class="app-container">
    <header>
      <div class="wrapper">
        <nav>
          <RouterLink to="/">Recipes</RouterLink>
          <RouterLink to="/favorites">Favorites</RouterLink>
        </nav>
      </div>
    </header>

    <main class="main-content">
      <RouterView />
    </main>

    <AppFooter />
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex-grow: 1;
}

header {
  line-height: 1.5;
  padding: 1rem 0;
  border-bottom: 1px solid #e0e0e0;
  background-color: #f8f9fa;
}

nav {
  width: 100%;
  font-size: 1rem;
  text-align: center;
}

nav a.router-link-exact-active {
  color: var(--color-text);
  font-weight: bold;
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0.5rem 1.5rem;
  border-left: 1px solid var(--color-border);
  text-decoration: none;
  color: #333;
}

nav a:hover {
  background-color: #e9ecef;
  color: #000;
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    justify-content: center;
  }

  nav {
    text-align: center;
    font-size: 1.1rem;
  }
}
</style>
