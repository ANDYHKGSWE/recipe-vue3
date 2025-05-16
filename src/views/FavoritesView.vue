<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Meal } from '../types/RecipeTypes'
import RecipeCard from '../components/RecipeCard.vue'

const favoriteMeals = ref<Meal[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)

const FAVORITES_STORAGE_KEY = 'vue-recipe-favorites'

function loadFavoriteMealsFromStorage() {
  isLoading.value = true
  error.value = null
  try {
    const favoritesJson = localStorage.getItem(FAVORITES_STORAGE_KEY)
    if (favoritesJson) {
      favoriteMeals.value = JSON.parse(favoritesJson)
    } else {
      favoriteMeals.value = []
    }
  } catch (e) {
    console.error('Error loading favorites from localStorage:', e)
    error.value = 'Could not load your favorites. The data might be corrupted.'
    favoriteMeals.value = [] // Rensa vid fel
  }
  isLoading.value = false
}

function removeFromFavorites(mealIdToRemove: string) {
  // Hämta aktuella favoriter, filtrera bort den som ska tas bort, och spara igen
  let currentFavorites = favoriteMeals.value
  currentFavorites = currentFavorites.filter((meal) => meal.idMeal !== mealIdToRemove)
  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(currentFavorites))
  favoriteMeals.value = currentFavorites // Uppdatera den lokala refen för att rendera om vyn
  // Ingen @toggle-favorite behövs från RecipeCard här om vi inte vill ha dubbelriktad borttagning direkt
}

// Denna funktion behövs om RecipeCard fortfarande förväntar sig den, annars kan den tas bort om RecipeCard bara visar status.
// För nu, låt oss anta att RecipeCard behöver veta om den är en favorit (t.ex. för styling)
function isMealFavorite(mealId: string): boolean {
  return favoriteMeals.value.some((meal) => meal.idMeal === mealId)
}

onMounted(() => {
  loadFavoriteMealsFromStorage()
})
</script>

<template>
  <div class="favorites-view">
    <h1>Your Favorite Recipes</h1>
    <div v-if="isLoading" class="loading">Loading your favorites...</div>
    <div v-if="error" class="error-message">{{ error }}</div>

    <div v-if="!isLoading && !error">
      <div v-if="favoriteMeals.length > 0" class="recipes-grid">
        <RecipeCard
          v-for="meal in favoriteMeals"
          :key="meal.idMeal"
          :meal="meal"
          :is-favorite="isMealFavorite(meal.idMeal)"
          @toggle-favorite="removeFromFavorites(meal.idMeal)"
        />
      </div>
      <p v-else>
        You haven't added any recipes to your favorites yet. Go to the
        <RouterLink to="/">Recipes</RouterLink> page to find some!
      </p>
    </div>
  </div>
</template>

<style scoped>
.favorites-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.loading,
.error-message {
  text-align: center;
  padding: 20px;
  font-size: 1.2em;
}

.error-message {
  color: red;
}

.recipes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

p {
  text-align: center;
  font-size: 1.1em;
  margin-top: 20px;
}
</style>
