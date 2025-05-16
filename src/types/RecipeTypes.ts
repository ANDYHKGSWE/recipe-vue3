export interface Meal {
  idMeal: string
  strMeal: string
  strMealThumb: string // URL till bilden
  strInstructions?: string
  strCategory?: string
  strArea?: string
  strYoutube?: string // URL till YouTube-video
  strSource?: string
  // För att täcka strIngredient1-20, strMeasure1-20 och andra potentiella strängfält
  [key: string]: string | null | undefined
}
