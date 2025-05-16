<script setup lang="ts">
import { ref, onMounted, computed, inject } from 'vue'
import type { Meal } from '../types/RecipeTypes'
import RecipeCard from '../components/RecipeCard.vue'

// Inject data from App.vue
// const providedMessage = inject('message', ref('Default meddelande om inget finns')) // Borttagen
const theme = inject('theme', { primaryColor: 'var(--vt-c-indigo)' }) // Behåller tema, men defaultMessage används inte längre här

// Reaktiv referens för att lagra listan med måltider
const meals = ref<Meal[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)

const FAVORITES_STORAGE_KEY = 'vue-recipe-favorites'

// --- Favoriter Start ---
const favoriteRecipeIds = ref<string[]>([])

// --- Sök/Filter Start ---
const searchQuery = ref('')

const filteredMeals = computed(() => {
  if (!searchQuery.value) {
    return meals.value // Om sökfältet är tomt, visa alla måltider
  }
  return meals.value.filter((meal) =>
    meal.strMeal.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
})
// --- Sök/Filter Slut ---

function loadFavorites() {
  const storedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY)
  if (storedFavorites) {
    favoriteRecipeIds.value = JSON.parse(storedFavorites)
  }
}

function saveFavorites() {
  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteRecipeIds.value))
}

function toggleFavorite(mealId: string) {
  const index = favoriteRecipeIds.value.indexOf(mealId)
  if (index === -1) {
    favoriteRecipeIds.value.push(mealId)
  } else {
    favoriteRecipeIds.value.splice(index, 1)
  }
  saveFavorites() // Spara till localStorage
  // console.log('Favorite IDs:', favoriteRecipeIds.value) // Kan tas bort eller behållas för debugging
}

function isFavorite(mealId: string): boolean {
  return favoriteRecipeIds.value.includes(mealId)
}
// --- Favoriter Slut ---

// Funktion för att hämta 10 slumpmässiga recept
async function fetchRecipes() {
  isLoading.value = true
  error.value = null
  meals.value = [] // Rensa tidigare recept

  try {
    const recipePromises: Promise<Response>[] = []
    for (let i = 0; i < 10; i++) {
      recipePromises.push(fetch('https://www.themealdb.com/api/json/v1/1/random.php'))
    }

    const responses = await Promise.all(recipePromises)

    const newMeals: Meal[] = []
    for (const response of responses) {
      if (!response.ok) {
        // Om ett enskilt anrop misslyckas, logga det men fortsätt om möjligt
        // eller kasta ett mer generellt fel. För nu, kastar vi ett fel om något går snett.
        console.warn(`Ett API-anrop misslyckades: ${response.status}`)
        // Kasta inte fel här direkt för att försöka få med så många som möjligt
        // throw new Error(`Misslyckades med att hämta alla recept. Servern svarade med status: ${response.status}`);
      }
      const data = await response.json()
      if (data.meals && data.meals[0]) {
        // Kontrollera om receptet redan finns (random kan returnera samma)
        // Detta är en enkel kontroll, kan göras mer robust
        if (!newMeals.find((m) => m.idMeal === data.meals[0].idMeal)) {
          newMeals.push(data.meals[0])
        }
      }
    }

    // Om vi inte fick 10 unika, försök hämta fler (enkel rekursion eller ytterligare loop)
    // För detta exempel nöjer vi oss med de vi fick, även om det är färre än 10 unika.
    // En mer robust lösning skulle fortsätta tills 10 UNIKA recept har hämtats.
    // Om API:et ofta returnerar samma "random" kan detta bli ett problem.

    if (newMeals.length === 0 && responses.some((r) => !r.ok)) {
      throw new Error('Misslyckades med att hämta några recept på grund av serverfel.')
    }

    meals.value = newMeals

    if (meals.value.length === 0) {
      error.value = 'Kunde inte ladda några recept för tillfället. Försök igen senare.'
    }
  } catch (e: unknown) {
    console.error('Misslyckades med att hämta recept:', e)
    if (e instanceof Error) {
      error.value = e.message
    } else {
      error.value =
        'Ett oväntat fel inträffade vid laddning av recept. Kontrollera din anslutning och försök igen.'
    }
  } finally {
    isLoading.value = false
  }
}

// Hämta recept när komponenten är "mounted"
onMounted(() => {
  loadFavorites() // Ladda favoriter från localStorage
  fetchRecipes()
})
</script>

<template>
  <main class="home-view">
    <!-- Borttagen visning av providedMessage -->

    <h1 :style="{ color: theme.primaryColor }">Recept</h1>

    <!-- Sökfält -->
    <div class="search-container">
      <input type="text" v-model="searchQuery" placeholder="Sök recept..." class="search-input" />
    </div>

    <div v-if="isLoading" class="loading">Laddar recept...</div>
    <div v-if="error" class="error-message">{{ error }}</div>

    <div v-if="!isLoading && !error">
      <div v-if="filteredMeals.length > 0" class="recipes-grid">
        <RecipeCard
          v-for="meal in filteredMeals"
          :key="meal.idMeal"
          :meal="meal"
          :is-favorite="isFavorite(meal.idMeal)"
          @toggle-favorite="toggleFavorite(meal.idMeal)"
        />
      </div>
      <p v-else-if="searchQuery && meals.length > 0">
        Inga recept hittades som matchar din sökning "{{ searchQuery }}".
      </p>
      <p v-else>Inga recept tillgängliga för tillfället.</p>
    </div>
  </main>
</template>

<style scoped>
.home-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.search-container {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}

.search-input {
  width: 100%;
  max-width: 500px;
  padding: 10px 15px;
  font-size: 1em;
  border: 1px solid #ccc;
  border-radius: 4px;
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

h1 {
  /* Styrs nu av inline style från theme via inject */
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 2.2rem;
}
</style>
