import { createServerFn } from '@tanstack/react-start'
import { eq, like, sql } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '~/db'
import { sortCategories } from '~/db/seed'
import { category, food, recipe } from '~/db/schema'
import type { Category, Food, FoodDetail } from '~/types'

const foodSaveSchema = z.object({
  categoryId: z.number().int().positive(),
  name: z.string().trim().min(1),
  description: z.string().optional().default(''),
  imageUrl: z.string().optional().default(''),
  ingredients: z.array(z.string().trim().min(1)).min(1),
  steps: z.array(z.string().trim().min(1)).min(1),
})

function joinIngredients(items: string[]) {
  return items.map((item) => item.trim()).filter(Boolean).join('|')
}

function joinSteps(items: string[]) {
  return items.map((item) => item.trim()).filter(Boolean).join('\n')
}

function parseIngredients(raw: string | null) {
  if (!raw) return []
  return raw.split('|').map((item) => item.trim()).filter(Boolean)
}

function parseSteps(raw: string | null) {
  if (!raw) return []
  return raw
    .split('\n')
    .map((item) => item.trim().replace(/^\d+\.\s*/, ''))
    .filter(Boolean)
}

async function toFoodDetail(foodRow: typeof food.$inferSelect): Promise<FoodDetail> {
  const [categoryRow] = await db.select().from(category).where(eq(category.id, foodRow.categoryId))
  const [recipeRow] = await db.select().from(recipe).where(eq(recipe.foodId, foodRow.id))

  if (!categoryRow || !recipeRow) {
    throw new Error('연관 데이터를 찾을 수 없습니다.')
  }

  return {
    id: foodRow.id,
    categoryId: foodRow.categoryId,
    categoryName: categoryRow.name,
    name: foodRow.name,
    description: foodRow.description,
    imageUrl: foodRow.imageUrl,
    ingredients: parseIngredients(recipeRow.ingredients),
    steps: parseSteps(recipeRow.steps),
  }
}

async function toFoodResponse(foodRow: typeof food.$inferSelect): Promise<Food> {
  const detail = await toFoodDetail(foodRow)
  return {
    id: detail.id,
    categoryId: detail.categoryId,
    categoryName: detail.categoryName,
    name: detail.name,
    description: detail.description,
    imageUrl: detail.imageUrl,
  }
}

export const getCategories = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Category[]> => sortCategories(await db.select().from(category)),
)

export const getFoods = createServerFn({ method: 'GET' }).handler(async (): Promise<Food[]> => {
  const rows = await db.select().from(food)
  return Promise.all(rows.map(toFoodResponse))
})

export const getRandomFood = createServerFn({ method: 'GET' }).handler(async (): Promise<FoodDetail> => {
  const [row] = await db.select().from(food).orderBy(sql`RANDOM()`).limit(1)
  if (!row) throw new Error('추천할 음식이 없습니다.')
  return toFoodDetail(row)
})

export const getFoodsByCategory = createServerFn({ method: 'GET' })
  .validator((categoryId: number) => categoryId)
  .handler(async ({ data: categoryId }): Promise<Food[]> => {
    const rows = await db.select().from(food).where(eq(food.categoryId, categoryId))
    return Promise.all(rows.map(toFoodResponse))
  })

export const searchFoods = createServerFn({ method: 'GET' })
  .validator((keyword: string) => keyword.trim())
  .handler(async ({ data: keyword }): Promise<Food[]> => {
    if (!keyword) throw new Error('검색어를 입력해주세요.')
    const rows = await db.select().from(food).where(like(food.name, `%${keyword}%`))
    return Promise.all(rows.map(toFoodResponse))
  })

export const getFoodDetail = createServerFn({ method: 'GET' })
  .validator((id: number) => id)
  .handler(async ({ data: id }): Promise<FoodDetail> => {
    const [row] = await db.select().from(food).where(eq(food.id, id))
    if (!row) throw new Error('음식을 찾을 수 없습니다.')
    return toFoodDetail(row)
  })

export const createFood = createServerFn({ method: 'POST' })
  .validator((payload: unknown) => foodSaveSchema.parse(payload))
  .handler(async ({ data }) => {
    const [categoryRow] = await db.select().from(category).where(eq(category.id, data.categoryId))
    if (!categoryRow) throw new Error('카테고리를 찾을 수 없습니다.')

    const [created] = await db
      .insert(food)
      .values({
        categoryId: data.categoryId,
        name: data.name,
        description: data.description,
        imageUrl: data.imageUrl,
      })
      .returning()

    if (!created) throw new Error('음식 등록에 실패했습니다.')

    await db.insert(recipe).values({
      foodId: created.id,
      ingredients: joinIngredients(data.ingredients),
      steps: joinSteps(data.steps),
    })

    return toFoodDetail(created)
  })

export const updateFood = createServerFn({ method: 'POST' })
  .validator((payload: { id: number; data: unknown }) => ({
    id: payload.id,
    data: foodSaveSchema.parse(payload.data),
  }))
  .handler(async ({ data: { id, data } }) => {
    const [existing] = await db.select().from(food).where(eq(food.id, id))
    if (!existing) throw new Error('음식을 찾을 수 없습니다.')

    await db.update(food).set({
      categoryId: data.categoryId,
      name: data.name,
      description: data.description,
      imageUrl: data.imageUrl,
    }).where(eq(food.id, id))

    const [recipeRow] = await db.select().from(recipe).where(eq(recipe.foodId, id))
    if (recipeRow) {
      await db.update(recipe).set({
        ingredients: joinIngredients(data.ingredients),
        steps: joinSteps(data.steps),
      }).where(eq(recipe.foodId, id))
    } else {
      await db.insert(recipe).values({
        foodId: id,
        ingredients: joinIngredients(data.ingredients),
        steps: joinSteps(data.steps),
      })
    }

    const [updated] = await db.select().from(food).where(eq(food.id, id))
    return toFoodDetail(updated)
  })

export const deleteFood = createServerFn({ method: 'POST' })
  .validator((id: number) => id)
  .handler(async ({ data: id }) => {
    await db.delete(recipe).where(eq(recipe.foodId, id))
    await db.delete(food).where(eq(food.id, id))
  })
