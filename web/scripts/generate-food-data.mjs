import fs from 'node:fs'

const blogImages = {
  규동: 'https://blogthumb.pstatic.net/MjAyNDA0MjRfMTU1/MDAxNzEzOTQ1Njk0ODA2.uWCrCP7cEf8uyTiUXMU2yOdB8YfCPwmcec0bJw4UIzwg.kDajm-Bck0PirPC9IzdXYXiTzyS-LvNc4Set0zYKqjUg.JPEG/DSC07875.jpg?type=w2',
  오야꼬동: 'https://blogthumb.pstatic.net/MjAyNjA2MTRfNDEg/MDAxNzgxNDIxNjY4MDM1.8pubVvdADLR_OVnNHjYxRZqE-0nyGDJmr0Mf2SS-B6Ug.PN9duIGz7urCBUss6dJjtTAyaSQJg-I76txD1EcqpKsg.JPEG/0-024.JPG?type=w2',
  야끼우동: 'https://blogthumb.pstatic.net/MjAyNjA2MTBfNjkg/MDAxNzgxMDUwMTAzMzMw.KY-pwv56sqqhhMJuHuM1ipwbpBlC7emNO2IBm6Pg6rIg.kwfMTP_jOg3SS6lOk5UL-CRHCljnee8U_gVye7sZPuEg.JPEG/%B8%DE%C0%CE1.JPG?type=w2',
  차슈덮밥: 'https://blogthumb.pstatic.net/MjAyNjA0MjNfNjYg/MDAxNzc2OTQ3NzA2MTEy.3_8cZLZ_r-JYRuB_dI7X9KgyK8u7usxLj9oABSxCVXAg.zVGOyZpMbl9mWPqoQDi9M0ITiqrcy_wJH6DW-tkujiAg.GIF/copy%A3%DF0657AA8F%A3%AD91FB%A3%AD4DE3%A3%AD8A07%A3%AD76806F39B30E.gif?type=w2',
  나폴리탄: 'https://blogthumb.pstatic.net/MjAyNjA1MjJfNTAg/MDAxNzc5NDIzMzU3MTYw.4dy6a5wVqTdUdP7dG-PcTh-SKdCTTvEXm9PdUPuYC7kg.qWvcjAf2KlVC5xWVY7zodidOXt4MtITQS2_EBOL8y_Ig.JPEG/%B3%AA%C6%FA%B8%AE%C5%BA%BD%BA%C6%C4%B0%D4%C6%BC2.jpg?type=w2',
  마파두부: 'https://blogthumb.pstatic.net/MjAyNjA2MTZfNTEg/MDAxNzgxNTY4ODg1NjE1.Q5AkRB4WBl6wQ6qGKsZ0r_YTqZMluhVXkH7omyn61dYg.wJv4ffsJob8zyDLSRQFusqe7_5YaelN6pNulreCWB58g.JPEG/%B8%DE%C0%CE1.JPG?type=w2',
  고추잡채: 'https://blogthumb.pstatic.net/MjAyNjA2MDZfMTcz/MDAxNzgwNjk5MjM5MzIz.0035EOmW-eiW8R21s2Y56bZu2JXBB6QCgSqZ4ncoxdIg.W0MIr_fFw3bREZLdURfpt8o_VhBtZkfQY3sulKMwOIog.JPEG/%B8%DE%C0%CE1.JPG?type=w2',
}

const imageFallbacks = {
  '토마토 파스타': 'https://images.unsplash.com/photo-1598866594230-a7c1c2f1c878?w=600',
}

const scraped = JSON.parse(fs.readFileSync('scripts/scrape-results.json', 'utf8'))
const manualRecipes = JSON.parse(fs.readFileSync('scripts/manual-recipes.json', 'utf8'))

function cleanText(text) {
  return text
    .replace(/&middot;/g, '·')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function shortDescription(text, name) {
  const cleaned = cleanText(text)
  if (!cleaned) return `${name} 레시피`
  const first = cleaned.split(/\[|\n|STEP \d|재료\(/)[0].trim()
  return (first.slice(0, 100) || `${name} 레시피`).replace(/"/g, "'")
}

function extractIngredients(text) {
  const cleaned = cleanText(text)
  const bracket = cleaned.match(/\[재료[^\]]*\]\s*([^[]+)/)
  if (bracket?.[1]) {
    return bracket[1]
      .split(/,|\n/)
      .map((s) => s.replace(/\[.*?\]/g, '').trim())
      .filter((s) => s.length > 1 && s.length < 35)
      .slice(0, 10)
  }

  const ingLine = cleaned.match(/\[기본 재료\]\s*([^[]+)/)
  if (ingLine?.[1]) {
    return ingLine[1]
      .split(/,|\n/)
      .map((s) => s.trim())
      .filter((s) => s.length > 1 && s.length < 35)
      .slice(0, 10)
  }

  return []
}

function extractSteps(text) {
  const cleaned = cleanText(text)
  const body = cleaned.replace(/\[재료[^\]]*\][^[]*/, '').replace(/\[기본 재료\][^[]*/, '')

  const stepMatches = [...cleaned.matchAll(/STEP\s*\d+[^STEP]*?(?=STEP\s*\d+|$)/gi)]
  if (stepMatches.length) {
    return stepMatches
      .map((m) => m[0].replace(/STEP\s*\d+/i, '').replace(/소요시간:[^\.]+/g, '').trim())
      .filter((s) => s.length > 8)
      .slice(0, 6)
      .map((s, i) => `${i + 1}. ${s}`)
  }

  const sentences = body
    .split(/(?<=[\.!?])\s+/)
    .map((s) => s.trim())
    .filter(
      (s) =>
        s.length > 12 &&
        s.length < 120 &&
        /(썰|넣|볶|끓|데치|절|섞|구워|완성|준비|올려|붓|재워|삶|익|팬|오븐|섞어|달군|찬물|간을)/.test(s),
    )

  if (sentences.length >= 2) {
    return sentences.slice(0, 6).map((s, i) => `${i + 1}. ${s.replace(/^\d+\.\s*/, '')}`)
  }

  return []
}

function normalizeImage(url, name) {
  if (blogImages[name]) return blogImages[name]
  if (imageFallbacks[name]) return imageFallbacks[name]
  if (!url) return ''
  if (url.startsWith('//')) return `https:${url}`
  if (url.endsWith('.svg')) return imageFallbacks[name] ?? ''
  return url
}

const categoryOrder = ['한식', '일식', '중식', '양식', '디저트']
const categoryIndex = Object.fromEntries(categoryOrder.map((name, index) => [name, index]))

const foods = scraped.map((item) => {
  const manual = manualRecipes[item.name]
  const ingredients = manual?.ingredients ?? extractIngredients(item.description)
  const steps = manual?.steps ?? extractSteps(item.description)
  const fallbackIngredients = [item.name, '소금', '후추']
  const fallbackSteps = [`${item.name} 재료를 준비한다.`, '레시피에 맞게 조리한다.', '간을 맞춰 완성한다.']

  return {
    categoryIndex: categoryIndex[item.category],
    name: item.name,
    description: manual?.description ?? shortDescription(item.description, item.name),
    imageUrl: normalizeImage(item.imageUrl, item.name),
    ingredients: (ingredients.length ? ingredients : fallbackIngredients).join('|'),
    steps: (steps.length ? steps : fallbackSteps).join('\n'),
  }
})

const output = `/** food.txt 기준 시드 데이터 (자동 생성 — node scripts/generate-food-data.mjs) */\nexport const FOOD_SEED_DATA = ${JSON.stringify(foods, null, 2)} as const\n`
fs.writeFileSync('src/db/food-data.ts', output)
console.log(`generated ${foods.length} foods`)
