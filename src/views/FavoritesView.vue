<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Meal } from '../types/RecipeTypes'
import RecipeCard from '../components/RecipeCard.vue'

const favoriteMealsDetails = ref<Meal[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)

const FAVORITES_STORAGE_KEY = 'vue-recipe-favorites'

async function fetchFavoriteMealDetails(mealId: string): Promise<Meal | null> {
  try {
    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`)
    if (!response.ok) {
      console.warn(`API call failed for meal ID ${mealId}: ${response.status}`)
      return null
    }
    const data = await response.json()
    return data.meals && data.meals.length > 0 ? data.meals[0] : null
  } catch (e) {
    console.error(`Error fetching details for meal ID ${mealId}:`, e)
    return null
  }
}

async function loadFavoriteDetails() {
  isLoading.value = true
  error.value = null
  favoriteMealsDetails.value = []
  try {
    const favoritesJson = localStorage.getItem(FAVORITES_STORAGE_KEY)
    if (favoritesJson) {
      const favoriteIds: string[] = JSON.parse(favoritesJson)
      if (favoriteIds.length === 0) {
        favoriteMealsDetails.value = []
        isLoading.value = false
        return
      }

      const mealPromises = favoriteIds.map(fetchFavoriteMealDetails)
      const results = await Promise.all(mealPromises)
      favoriteMealsDetails.value = results.filter((meal): meal is Meal => meal !== null)

      if (favoriteMealsDetails.value.length === 0 && favoriteIds.length > 0) {
        error.value = 'Could not load details for your favorite recipes. Some might be unavailable.'
      }
    } else {
      favoriteMealsDetails.value = []
    }
  } catch (e) {
    console.error('Error loading favorite IDs from localStorage:', e)
    error.value = 'Could not load your favorites. The stored data might be corrupted.'
    favoriteMealsDetails.value = []
  }
  isLoading.value = false
}

function removeFromFavorites(mealIdToRemove: string) {
  try {
    const favoritesJson = localStorage.getItem(FAVORITES_STORAGE_KEY)
    if (favoritesJson) {
      let favoriteIds: string[] = JSON.parse(favoritesJson)
      favoriteIds = favoriteIds.filter((id) => id !== mealIdToRemove)
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteIds))
      favoriteMealsDetails.value = favoriteMealsDetails.value.filter(
        (meal) => meal.idMeal !== mealIdToRemove,
      )
      if (favoriteMealsDetails.value.length === 0 && favoriteIds.length === 0) {
      }
    }
  } catch (e) {
    console.error('Error updating favorites in localStorage:', e)
    error.value = 'Could not update your favorites list.'
  }
}

function isMealFavorite(mealId: string): boolean {
  return favoriteMealsDetails.value.some((meal) => meal.idMeal === mealId)
}

onMounted(() => {
  loadFavoriteDetails()
})
</script>

<template>
  <div class="favorites-view">
    <h1>Your Favorite Recipes</h1>
    <div v-if="isLoading" class="loading">Loading your favorites...</div>
    <div v-if="error" class="error-message">{{ error }}</div>

    <div v-if="!isLoading && !error">
      <div v-if="favoriteMealsDetails.length > 0" class="recipes-grid">
        <RecipeCard
          v-for="meal in favoriteMealsDetails"
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
