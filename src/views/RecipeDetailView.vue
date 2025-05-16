<script setup lang="ts">
import { ref, onMounted, watch, computed, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Meal } from '../types/RecipeTypes' // Vi använder samma Meal-interface

interface Ingredient {
  name: string
  measure: string
}

const route = useRoute()
const router = useRouter()

const meal = ref<Meal | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)
const isFavorite = ref(false)

// Injicera appTheme med ett standardvärde
const appTheme = inject('appTheme', {
  primaryColor: '#007bff', // Standard primärfärg
  defaultFontSize: '1rem', // Standard teckenstorlek
})

const FAVORITES_STORAGE_KEY = 'vue-recipe-favorites'

function getFavoritesFromStorage(): Meal[] {
  const favoritesJson = localStorage.getItem(FAVORITES_STORAGE_KEY)
  return favoritesJson ? JSON.parse(favoritesJson) : []
}

function saveFavoritesToStorage(favorites: Meal[]) {
  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites))
}

function checkIfFavorite(mealId: string): boolean {
  if (!mealId) return false
  const favorites = getFavoritesFromStorage()
  return favorites.some((fav) => fav.idMeal === mealId)
}

const ingredientsList = computed<Ingredient[]>(() => {
  if (!meal.value) return []
  const ingredients: Ingredient[] = []
  for (let i = 1; i <= 20; i++) {
    const ingredientKey = `strIngredient${i}` as keyof Meal
    const measureKey = `strMeasure${i}` as keyof Meal

    const ingredientName = meal.value[ingredientKey] as string
    const measure = meal.value[measureKey] as string

    if (ingredientName && ingredientName.trim() !== '') {
      ingredients.push({ name: ingredientName, measure: measure || '' })
    } else {
      // Sluta loopa om vi stöter på en tom ingrediens, antar att resten också är tomma
      break
    }
  }
  return ingredients
})

async function fetchRecipeDetails(id: string) {
  isLoading.value = true
  error.value = null
  meal.value = null
  try {
    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`)
    if (!response.ok) {
      if (response.status === 404) {
        router.push({ name: 'NotFound' })
        return
      }
      throw new Error(
        `Misslyckades med att hämta receptdetaljer. Servern svarade med status: ${response.status}`,
      )
    }
    const data = await response.json()
    if (data.meals && data.meals.length > 0) {
      meal.value = data.meals[0]
      if (meal.value) {
        isFavorite.value = checkIfFavorite(meal.value.idMeal)
      }
    } else {
      router.push({ name: 'NotFound' })
    }
  } catch (e: unknown) {
    console.error('Misslyckades med att hämta receptdetaljer:', e)
    if (e instanceof Error) {
      error.value = e.message
    } else {
      error.value = 'Ett okänt fel inträffade vid hämtning av receptdetaljer.'
    }
  } finally {
    isLoading.value = false
  }
}

// Hämta data när komponenten mountas och när route.params.id ändras
onMounted(() => {
  if (route.params.id) {
    fetchRecipeDetails(route.params.id as string)
  }
})

watch(
  () => route.params.id,
  (newId) => {
    if (newId && route.name === 'RecipeDetail') {
      // Säkerställ att vi är på rätt route
      fetchRecipeDetails(newId as string)
    }
  },
  { immediate: false },
) // immediate: false eftersom onMounted redan hanterar första laddningen

function toggleFavorite() {
  if (!meal.value) return

  const currentFavorites = getFavoritesFromStorage()
  let updatedFavorites: Meal[]

  if (isFavorite.value) {
    // Ta bort från favoriter
    updatedFavorites = currentFavorites.filter((fav) => fav.idMeal !== meal.value!.idMeal)
    alert(`${meal.value.strMeal} har tagits bort från favoriter.`)
  } else {
    // Lägg till i favoriter
    updatedFavorites = [...currentFavorites, meal.value]
    alert(`${meal.value.strMeal} har lagts till i favoriter!`)
  }
  saveFavoritesToStorage(updatedFavorites)
  isFavorite.value = !isFavorite.value // Växla status efter att ha sparat
}
</script>

<template>
  <div class="recipe-detail-view">
    <div v-if="isLoading" class="loading">Laddar receptdetaljer...</div>
    <div v-if="error && !isLoading" class="error-message">
      <p>{{ error }}</p>
      <router-link to="/">Tillbaka till Recept</router-link>
    </div>

    <article v-if="meal && !isLoading && !error">
      <h1 :style="{ color: appTheme.primaryColor }">{{ meal.strMeal }}</h1>
      <div class="recipe-layout">
        <div class="recipe-image-container">
          <img :src="meal.strMealThumb" :alt="meal.strMeal" class="recipe-image" />
        </div>
        <div class="recipe-info">
          <div v-if="meal.strCategory || meal.strArea">
            <p>
              <strong v-if="meal.strCategory">Kategori:</strong> {{ meal.strCategory }}
              <span v-if="meal.strCategory && meal.strArea"> | </span>
              <strong v-if="meal.strArea">Område:</strong> {{ meal.strArea }}
            </p>
          </div>

          <div v-if="ingredientsList.length > 0">
            <h2>Ingredienser</h2>
            <ul>
              <li v-for="(item, index) in ingredientsList" :key="index">
                {{ item.measure }} {{ item.name }}
              </li>
            </ul>
          </div>
          <button @click="toggleFavorite" class="favorite-button">
            {{ isFavorite ? 'Ta bort från favoriter' : 'Lägg till i favoriter' }}
          </button>
        </div>
      </div>

      <div v-if="meal.strInstructions">
        <h2>Instruktioner</h2>
        <p class="instructions">{{ meal.strInstructions }}</p>
      </div>

      <div v-if="meal.strYoutube">
        <h2>Videorecept</h2>
        <div class="video-container">
          <iframe
            :src="meal.strYoutube.replace('watch?v=', 'embed/')"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          >
          </iframe>
        </div>
      </div>
      <router-link to="/" class="back-link"> &laquo; Tillbaka till alla recept</router-link>
    </article>
  </div>
</template>

<style scoped>
.recipe-detail-view {
  max-width: 900px;
  margin: 20px auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
}

.loading,
.error-message {
  text-align: center;
  padding: 40px;
  font-size: 1.4em;
}

.error-message p {
  margin-bottom: 20px;
}

.error-message a {
  color: #007bff;
  text-decoration: none;
}

article h1 {
  text-align: center;
  margin-bottom: 25px;
  color: #333;
}

.recipe-layout {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
}

.recipe-image-container {
  flex: 1 1 300px; /* Flex-grow, flex-shrink, flex-basis */
  max-width: 400px;
}

.recipe-image {
  width: 100%;
  height: auto;
  border-radius: 8px;
  border: 1px solid #eee;
}

.recipe-info {
  flex: 2 1 400px; /* Tar mer plats om möjligt */
}

.recipe-info h2,
.recipe-detail-view h2 {
  color: #555;
  border-bottom: 1px solid #eee;
  padding-bottom: 5px;
  margin-top: 20px;
  margin-bottom: 10px;
}

.recipe-info ul {
  list-style: inside disc;
  padding-left: 0;
}

.recipe-info li {
  margin-bottom: 5px;
}

.instructions {
  white-space: pre-wrap; /* Bevarar nyradstecken från API:et */
  line-height: 1.6;
  text-align: justify;
}

.video-container {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 Aspect Ratio */
  height: 0;
  overflow: hidden;
  max-width: 100%;
  background: #000;
  margin-top: 15px;
}

.video-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.back-link {
  display: inline-block;
  margin-top: 30px;
  color: #007bff;
  text-decoration: none;
}
.back-link:hover {
  text-decoration: underline;
}

.favorite-button {
  background-color: #ffc107;
  color: #333;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9em;
  font-weight: bold;
  margin-top: 15px;
  transition: background-color 0.2s ease-in-out;
}

.favorite-button:hover {
  background-color: #e0a800;
}
</style>
