import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import { count, eq } from 'drizzle-orm'
import { FOOD_SEED_DATA } from './food-data'
import * as schema from './schema'

/** 화면·Admin 표시 순서 */
export const CATEGORY_ORDER = ['한식', '일식', '중식', '양식', '디저트'] as const

export type CategoryName = (typeof CATEGORY_ORDER)[number]

export function sortCategories<T extends { name: string }>(rows: T[]): T[] {
  return [...rows].sort(
    (a, b) => CATEGORY_ORDER.indexOf(a.name as CategoryName) - CATEGORY_ORDER.indexOf(b.name as CategoryName),
  )
}

type SeedFood = (typeof FOOD_SEED_DATA)[number]

async function insertFoodWithRecipe(
  db: BetterSQLite3Database<typeof schema>,
  categoryId: number,
  item: SeedFood,
) {
  const [insertedFood] = await db
    .insert(schema.food)
    .values({
      categoryId,
      name: item.name,
      description: item.description,
      imageUrl: item.imageUrl,
    })
    .returning()

  if (!insertedFood) return

  await db.insert(schema.recipe).values({
    foodId: insertedFood.id,
    ingredients: item.ingredients,
    steps: item.steps,
  })
}

async function updateFoodWithRecipe(
  db: BetterSQLite3Database<typeof schema>,
  foodId: number,
  item: SeedFood,
  categoryId: number,
) {
  await db
    .update(schema.food)
    .set({
      categoryId,
      name: item.name,
      description: item.description,
      imageUrl: item.imageUrl,
    })
    .where(eq(schema.food.id, foodId))

  const [recipeRow] = await db.select().from(schema.recipe).where(eq(schema.recipe.foodId, foodId))
  if (recipeRow) {
    await db
      .update(schema.recipe)
      .set({
        ingredients: item.ingredients,
        steps: item.steps,
      })
      .where(eq(schema.recipe.foodId, foodId))
  } else {
    await db.insert(schema.recipe).values({
      foodId,
      ingredients: item.ingredients,
      steps: item.steps,
    })
  }
}

async function removeDeprecatedCategories(db: BetterSQLite3Database<typeof schema>) {
  const allowed = new Set<string>(CATEGORY_ORDER)
  const existing = await db.select().from(schema.category)

  for (const cat of existing) {
    if (allowed.has(cat.name)) continue

    const foodsInCategory = await db
      .select()
      .from(schema.food)
      .where(eq(schema.food.categoryId, cat.id))

    for (const foodRow of foodsInCategory) {
      await db.delete(schema.recipe).where(eq(schema.recipe.foodId, foodRow.id))
      await db.delete(schema.food).where(eq(schema.food.id, foodRow.id))
    }

    await db.delete(schema.category).where(eq(schema.category.id, cat.id))
  }
}

async function ensureCategories(db: BetterSQLite3Database<typeof schema>) {
  const existing = await db.select().from(schema.category)
  const existingNames = new Set(existing.map((row) => row.name))

  for (const name of CATEGORY_ORDER) {
    if (!existingNames.has(name)) {
      await db.insert(schema.category).values({ name })
    }
  }
}

async function syncSeedFoods(db: BetterSQLite3Database<typeof schema>) {
  const categoryRows = sortCategories(await db.select().from(schema.category))
  const categoryIdsByIndex = CATEGORY_ORDER.map(
    (name) => categoryRows.find((row) => row.name === name)?.id,
  )

  const seedNames = FOOD_SEED_DATA.map((item) => item.name)
  const existingFoods = await db.select().from(schema.food)
  const existingByName = new Map(existingFoods.map((row) => [row.name, row]))

  for (const item of FOOD_SEED_DATA) {
    const categoryId = categoryIdsByIndex[item.categoryIndex]
    if (!categoryId) continue

    const existing = existingByName.get(item.name)
    if (existing) {
      await updateFoodWithRecipe(db, existing.id, item, categoryId)
    } else {
      await insertFoodWithRecipe(db, categoryId, item)
    }
  }

  for (const foodRow of existingFoods) {
    if (seedNames.includes(foodRow.name)) continue
    await db.delete(schema.recipe).where(eq(schema.recipe.foodId, foodRow.id))
    await db.delete(schema.food).where(eq(schema.food.id, foodRow.id))
  }
}

export async function seedIfEmpty(db: BetterSQLite3Database<typeof schema>) {
  await removeDeprecatedCategories(db)
  await ensureCategories(db)

  const [result] = await db.select({ value: count() }).from(schema.category)
  if ((result?.value ?? 0) === 0) {
    for (const name of CATEGORY_ORDER) {
      await db.insert(schema.category).values({ name })
    }
  }

  await syncSeedFoods(db)
}
