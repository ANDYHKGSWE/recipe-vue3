import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import FavoritesView from '../views/FavoritesView.vue'
import RecipeDetailView from '../views/RecipeDetailView.vue'
import NotFoundView from '../views/NotFoundView.vue'

// Simulerad autentiseringsstatus (ersätt med din faktiska autentiseringslogik)
// För demonstration, sätt till true för att se favorites, false för att blockeras.
const isAuthenticated = () => {
  // I en riktig app, kolla t.ex. localStorage, Vuex/Pinia store, eller en cookie
  // console.log("Kontrollerar autentisering...");
  return true // Ändra till true för att simulera inloggad användare
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/favorites',
      name: 'favorites',
      component: FavoritesView,
      meta: { requiresAuth: true }, // Lägg till meta-fält för att markera skyddade routes
    },
    {
      path: '/recipe/:id',
      name: 'RecipeDetail',
      component: RecipeDetailView,
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: NotFoundView,
    },
  ],
})

router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    // Denna route kräver autentisering, kolla om användaren är inloggad
    if (!isAuthenticated()) {
      // Användaren är inte inloggad, omdirigera till startsidan
      // I en riktig app, omdirigera till en inloggningssida: next({ name: 'Login' })
      alert('Åtkomst nekad. Du måste vara inloggad för att se favoriter.') // Enkel alert för demo
      next({ name: 'home' })
    } else {
      // Användaren är inloggad, fortsätt till routen
      next()
    }
  } else {
    // Denna route kräver inte autentisering, fortsätt som vanligt
    next()
  }
})

export default router
