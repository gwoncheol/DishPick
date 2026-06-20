import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const manual = JSON.parse(fs.readFileSync(path.join(__dirname, 'manual-recipes.json'), 'utf8'))
const foodDataPath = path.resolve(__dirname, '../src/db/food-data.ts')
const content = fs.readFileSync(foodDataPath, 'utf8')
const match = content.match(/export const FOOD_SEED_DATA = (\[[\s\S]*?\]) as const/)

if (!match) throw new Error('FOOD_SEED_DATA not found')

const foods = JSON.parse(match[1])
for (const food of foods) {
  const manualEntry = manual[food.name]
  if (manualEntry?.description) food.description = manualEntry.description
}

const output = `/** food.txt 기준 시드 데이터 (node scripts/import-food-data.mjs) */\nexport const FOOD_SEED_DATA = ${JSON.stringify(foods, null, 2)} as const\n`
fs.writeFileSync(foodDataPath, output)
console.log(`updated descriptions for ${foods.length} foods`)
