import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const category = sqliteTable('category', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
})

export const food = sqliteTable('food', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  categoryId: integer('category_id').notNull().references(() => category.id),
  name: text('name').notNull(),
  description: text('description'),
  imageUrl: text('image_url'),
})

export const recipe = sqliteTable('recipe', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  foodId: integer('food_id').notNull().unique().references(() => food.id),
  ingredients: text('ingredients').notNull(),
  steps: text('steps').notNull(),
})
