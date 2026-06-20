export interface Category {
  id: number
  name: string
}

export interface Food {
  id: number
  categoryId: number
  categoryName: string
  name: string
  description: string | null
  imageUrl: string | null
}

export interface FoodDetail extends Food {
  ingredients: string[]
  steps: string[]
}

export interface FoodSavePayload {
  categoryId: number
  name: string
  description: string
  imageUrl: string
  ingredients: string[]
  steps: string[]
}
