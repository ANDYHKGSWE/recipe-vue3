# Receptsida med Vue.js

Detta projekt är en individuell inlämningsuppgift som går ut på att skapa en receptsida med Vue.js som ramverk.

## Starta projektet

För att köra projektet lokalt, följ dessa steg:

1.  Klona repot.
2.  Navigera till projektets rotmapp i din terminal.
3.  Installera alla nödvändiga beroenden:
    ```bash
    npm install
    ```
4.  Starta utvecklingsservern:
    ```bash
    npm run dev
    ```
    Applikationen bör nu vara tillgänglig på den adress som visas i terminalen (oftast `http://localhost:5173`).

## Applikationens funktioner och struktur

Applikationen är en Single Page Application (SPA) byggd med Vue 3 (Composition API) och TypeScript. Vite används som byggverktyg.

### Kärnfunktioner:

- **Hämta och visa recept:** Applikationen hämtar initialt 10 slumpmässiga recept från ett externt API (TheMealDB API via dess `random.php`-slutpunkt) när startsidan ("Recipes") laddas.
- **Sökfunktion:** På receptsidan finns ett sökfält där användaren kan filtrera den visade receptlistan dynamiskt baserat på receptets namn. Sökningen är skiftlägesokänslig.
- **Detaljvy för recept:** Användare kan klicka på ett receptkort för att navigera till en detaljerad vy (`/recipe/:id`) som visar mer information om det valda receptet.
- **Favoritmarkering:** Användare kan markera och avmarkera recept som favoriter.
  - Varje receptkort har en knapp för att lägga till/ta bort från favoriter.
  - En lista med ID:n för favoritmarkerade recept sparas i webbläsarens `localStorage`, vilket innebär att de finns kvar även om sidan laddas om.
- **Visa favoriter:** Det finns en separat sida ("Favorites", nås via `/favorites`) som visar alla recept som användaren har markerat som favoriter.
  - Denna sida hämtar ID:n från `localStorage` och gör sedan API-anrop för att ladda fullständiga detaljer för varje favoritrecept.
  - Användare kan även ta bort recept från favoritlistan direkt från denna sida.
- **Navigationsskydd (simulerat):** Favorites-sidan (`/favorites`) har ett simpelt navigationsskydd. I den nuvarande implementationen är detta skydd dock alltid "passerande" (tillåter åtkomst) men är strukturerat för att kunna kopplas till en riktig autentiseringslogik.

### Teknisk struktur och Vue.js-koncept:

- **Routing:** Vue Router används för att hantera navigering mellan sidorna:
  - `/`: Visar alla recept (med sök/filter) (`HomeView`).
  - `/recipe/:id`: Visar en detaljerad vy för ett specifikt recept (`RecipeDetailView`).
  - `/favorites`: Visar favoritmarkerade recept (`FavoritesView`).
  - En "catch-all"-route finns för att hantera ogiltiga webbadresser och visa en `NotFoundView`.
- **Komponenter:** Applikationen är uppdelad i återanvändbara komponenter:
  - `App.vue`: Rotkomponent som innehåller header, navigeringslänkar och `<RouterView>`.
  - `HomeView.vue`: Vyn för att visa och söka bland recept, hanterar initiala API-anrop och logik för att addera/ta bort favoriter (sparar ID:n).
  - `FavoritesView.vue`: Vyn för att visa favoritrecept. Hämtar favorit-ID:n från `localStorage` och gör API-anrop för att ladda fullständiga receptdetaljer.
  - `RecipeDetailView.vue`: Vyn som visar detaljerad information om ett enskilt recept.
  - `RecipeCard.vue`: En komponent som visar ett enskilt receptkort (bild, namn, favoritknapp). Den tar emot receptdata och favoritstatus som typsäkra `props` och skickar en händelse (`emit`) när favoritknappen klickas. Kortet länkar också till receptets detaljvy.
  - `NotFoundView.vue`: Visas när en angiven route inte matchar någon existerande.
- **Reaktivitet och State:**
  - `ref()` används för att hantera reaktiv state (t.ex. listan med recept, söktermen, listan med favorit-ID:n, laddningsstatus).
  - `computed` properties används för att härleda state (t.ex. den filtrerade listan med recept i `HomeView.vue` och texten på favoritknappen i `RecipeCard.vue`).
- **Props och Events:** Komponenter kommunicerar via props (data neråt) och events (meddelanden uppåt, `$emit`). Props är typsäkrade med TypeScript-interfaces.
- **Livscykelkrokar:** `onMounted` används för att initiera datahämtning när komponenter laddas.
- **API-anrop:** `fetch` API:et används för att göra webbanrop till TheMealDB.
- **TypeScript:** Hela kodbasen använder TypeScript för ökad typsäkerhet och bättre utvecklarupplevelse.
- **`v-model`:** Används för tvåvägsdatabinding mellan sökfältet och `searchQuery`-variabeln.
- **Villkorlig rendering (`v-if`, `v-else-if`, `v-else`):** Används för att visa/dölja element baserat på state (t.ex. laddningsmeddelanden, felmeddelanden, listor med recept eller meddelanden om inga resultat).
- **Listrendering (`v-for`):** Används för att rendera listor av komponenter (t.ex. `RecipeCard`).
