<script setup lang="ts">
import { computed } from 'vue'
import type { Meal } from '../types/RecipeTypes'

interface Props {
  meal: Meal
  isFavorite: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{ (e: 'toggle-favorite'): void }>()

function handleToggleFavorite() {
  emit('toggle-favorite')
}

const favoriteButtonText = computed(() => {
  return props.isFavorite ? 'Ta bort från favoriter' : 'Lägg till som favorit'
})
</script>

<template>
  <router-link
    :to="{ name: 'RecipeDetail', params: { id: props.meal.idMeal } }"
    class="recipe-card-link"
  >
    <div class="recipe-card">
      <img :src="props.meal.strMealThumb" :alt="props.meal.strMeal" class="recipe-image" />
      <h3>{{ props.meal.strMeal }}</h3>
      <button @click.prevent="handleToggleFavorite" class="favorite-button">
        {{ favoriteButtonText }}
      </button>
    </div>
  </router-link>
</template>

<style scoped>
.recipe-card-link {
  text-decoration: none;
  color: var(--color-text);
  display: block;
}

.recipe-card {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  background-color: var(--color-background-soft);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
  transition:
    transform 0.2s ease-in-out,
    box-shadow 0.2s ease-in-out;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}

.recipe-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
}

.recipe-image {
  width: 100%;
  max-width: 200px;
  height: auto;
  border-radius: 4px;
  margin-bottom: 12px;
  align-self: center;
}

h3 {
  margin: 10px 0;
  font-size: 1.15em;
  color: var(--color-heading);
  font-weight: 600;
}

.favorite-button {
  padding: 8px 15px;
  background-color: var(--vt-c-indigo);
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: auto;
  font-size: 0.9em;
}

.favorite-button:hover {
  background-color: #1a2b3c;
}

.favorite-button.is-favorite {
  background-color: #e74c3c;
}

.favorite-button.is-favorite:hover {
  background-color: #c0392b;
}
</style>
