import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const FOOD_TXT = path.resolve(ROOT, '..', 'food.txt')
const MANUAL_RECIPES = path.resolve(__dirname, 'manual-recipes.json')
const IMAGE_DIR = path.resolve(ROOT, 'public', 'images', 'foods')
const OUT_DATA = path.resolve(ROOT, 'src', 'db', 'food-data.ts')
const OUT_JSON = path.resolve(ROOT, 'scripts', 'imported-recipes.json')

const CATEGORY_ORDER = ['한식', '일식', '중식', '양식', '디저트']

/** 이미지를 가져올 수 없는 메뉴용 대체 이미지 */
const IMAGE_FALLBACKS = {
  '토마토 파스타': 'https://picsum.photos/seed/dishpick-tomato-pasta/800/600.jpg',
}

const STEP_NOISE =
  /등록일|저작자|구매|쇼핑|유튜브|광고|http|pstatic\.net|<img|userAgent|function\s|var gb|JEagleEye|\.com\/|점검 시간|공유된 글/i

function slugify(name) {
  return name
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[\\/:*?"<>|]/g, '')
}

function decodeHtml(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

function stripHtml(html) {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function parseFoodTxt(raw) {
  const lines = raw.split(/\r?\n/)
  const items = []
  let category = ''

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue
    if (CATEGORY_ORDER.includes(trimmed)) {
      category = trimmed
      continue
    }
    if (trimmed.startsWith('http')) {
      const last = items[items.length - 1]
      if (last && !last.url) last.url = trimmed
      continue
    }
    items.push({ category, name: trimmed, url: '' })
  }

  return items.filter((item) => item.url)
}

function splitIngredientLine(line) {
  return line
    .split(/[,·]/)
    .map((part) => part.replace(/^[\s\-]+/, '').trim())
    .filter((part) => part.length > 1 && part.length < 80)
}

function parseNaverIngredients(og, plain) {
  const ingredients = []
  const patterns = [
    /재료(?:\([^)]*\))?-\s*([\s\S]*?)(?=국물\s*재료-|고기\s*양념-|\[|$)/,
    /국물\s*재료-\s*([\s\S]*?)(?=고기\s*양념-|\[|$)/,
    /고기\s*양념-\s*([\s\S]*?)(?=\[|$)/,
  ]

  for (const pattern of patterns) {
    const match = og.match(pattern)
    if (match?.[1]) splitIngredientLine(match[1]).forEach((part) => ingredients.push(part))
  }

  const bracketMatch = og.match(/\[재료\]\s*([^[\]]+)/) || plain.match(/\[재료\]\s*([^[\]]+)/)
  if (bracketMatch?.[1]) {
    splitIngredientLine(bracketMatch[1]).forEach((part) => ingredients.push(part))
  }

  return [...new Set(ingredients)]
}

function cleanStepText(text) {
  return text
    .replace(/\s*출처[\s\S]*$/, '')
    .replace(/\s*만드는법\s*$/, '')
    .replace(/\s*만들기\s*$/, '')
    .replace(/【[^】]*】/g, '')
    .replace(/\s*Tip[\s\S]*$/i, '')
    .replace(/\s*가열시간[\s\S]*$/i, '')
    .replace(/\s*조리과정[\s\S]*$/i, '')
    .replace(/\s*재료준비[\s\S]*$/i, '')
    .trim()
}

function dedupeSteps(steps) {
  const seen = new Set()
  return steps.filter((step) => {
    if (seen.has(step)) return false
    seen.add(step)
    return true
  })
}

function splitNumberedBlock(block) {
  const steps = []
  for (const part of block.split(/\d+\.\s/).slice(1)) {
    const body = cleanStepText(part)
    if (
      body.length > 8 &&
      body.length < 400 &&
      !STEP_NOISE.test(body) &&
      !/^\d{4}\./.test(body)
    ) {
      steps.push(body)
    }
  }
  return steps
}

function parseNaverSteps(plain) {
  return plain
    .split(/STEP\s*\d+/i)
    .slice(1)
    .map((chunk) =>
      chunk
        .replace(/^[\s:]*소요시간\s*:\s*\d+\s*분\.?\s*/i, '')
        .replace(/\s*출처[\s\S]*$/, '')
        .trim(),
    )
    .filter((chunk) => chunk.length > 8 && !STEP_NOISE.test(chunk))
}

function parseNaverAllSteps(plain) {
  const stepFormat = parseNaverSteps(plain)
  if (stepFormat.length > 0) return stepFormat

  const steps = []
  const prepBlock = plain.match(/(\d+\.\s[^]*?)만들기\s*1\./)?.[1]
  if (prepBlock) steps.push(...splitNumberedBlock(prepBlock))

  const cookingBlock = plain.match(/만들기\s*1\.\s([\s\S]*?)(?=출처|제공처|$)/)?.[1]
  if (cookingBlock) steps.push(...splitNumberedBlock(`1. ${cookingBlock}`))

  if (steps.length > 0) return dedupeSteps(steps)

  const recipeArea = plain.match(/(\d+\.\s[^]*?)(?=출처|제공처)/)?.[1]
  if (recipeArea) return dedupeSteps(splitNumberedBlock(recipeArea))

  return []
}

function pickImageUrl(html, pageUrl) {
  const og =
    html.match(/property="og:image"\s+content="([^"]+)"/) ||
    html.match(/content="([^"]+)"\s+property="og:image"/)
  if (og?.[1]) {
    const url = og[1].replace(/&amp;/g, '&')
    if (!url.endsWith('.svg')) return url
  }

  if (pageUrl.includes('10000recipe.com')) {
    const m = html.match(/https:\/\/recipe1\.ezmember\.co\.kr\/cache\/recipe\/[^"']+\.(?:jpg|jpeg|png)/i)
    if (m?.[0]) return m[0]
  }

  if (pageUrl.includes('terms.naver.com')) {
    const imgs = [
      ...html.matchAll(
        /https:\/\/(?:dbscthumb|terms-post)-phinf\.pstatic\.net\/[^"'?\s]+(?:\?[^"'\s]*)?/gi,
      ),
    ]
    if (imgs.length) return imgs[0][0]
  }

  if (pageUrl.includes('blog.naver.com')) {
    const postImg = html.match(/https:\/\/postfiles\.pstatic\.net\/[^"']+\.(?:jpg|jpeg|png|webp)/i)
    if (postImg?.[0]) return postImg[0]
    const thumb = html.match(/https:\/\/blogthumb\.pstatic\.net\/[^"']+/i)
    if (thumb?.[0]) return thumb[0]
  }

  if (pageUrl.includes('namu.wiki')) {
    const imgs = [
      ...html.matchAll(/https:\/\/i\.namu\.wiki\/i\/[^"']+\.(?:webp|jpg|jpeg|png)/gi),
    ]
    const photo = imgs.find((m) => !m[0].endsWith('.svg') && !m[0].includes('logo'))
    if (photo?.[0]) return photo[0]
  }

  return ''
}

function parse10000Recipe(html) {
  const ingredients = []
  for (const match of html.matchAll(/class="ingre_list_name"[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/g)) {
    const text = stripHtml(match[1])
    if (text) ingredients.push(text)
  }

  const steps = []
  for (const match of html.matchAll(/class="view_step_cont[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/g)) {
    const text = stripHtml(match[1])
    if (text.length > 12 && !STEP_NOISE.test(text)) steps.push(text)
  }

  const summaryMatch = html.match(/property="og:description"\s+content="([^"]+)"/)
  const description = summaryMatch?.[1]
    ? stripHtml(summaryMatch[1]).split('[재료]')[0].slice(0, 120)
    : ''

  return { ingredients: [...new Set(ingredients)], steps, description }
}

function parseNaverTerms(html) {
  const ogMatch = html.match(/property="og:description"\s+content="([^"]+)"/)
  const og = ogMatch ? decodeHtml(ogMatch[1]) : ''
  const plain = stripHtml(html)

  const ingredients = parseNaverIngredients(og, plain)
  const steps = parseNaverAllSteps(plain)
  const description = og ? og.split('[')[0].trim().slice(0, 120) : ''

  return { ingredients, steps, description }
}

function parseBlog(html) {
  const ogDesc = html.match(/property="og:description"\s+content="([^"]+)"/)
  const raw = ogDesc?.[1] ? stripHtml(decodeHtml(ogDesc[1])) : ''
  const description = raw.slice(0, 120)

  const sentences = raw
    .split(/\.|\n/)
    .map((s) => s.trim())
    .filter(
      (s) =>
        s.length > 15 &&
        s.length < 180 &&
        /(썰|넣|볶|끓|데치|섞|구워|완성|준비|올려|재워|삶|익|팬|양념|소스|밥|볶|찜|튀|데운|절|간)/.test(s) &&
        !STEP_NOISE.test(s),
    )

  return {
    ingredients: [],
    steps: sentences.slice(0, 10),
    description,
  }
}

function parseNamuWiki(html) {
  const ogDesc = html.match(/property="og:description"\s+content="([^"]+)"/)
  const description = ogDesc?.[1] ? stripHtml(decodeHtml(ogDesc[1])).slice(0, 120) : ''
  const plain = stripHtml(html)

  const steps = plain
    .split(/\.\s+/)
    .map((s) => s.trim())
    .filter(
      (s) =>
        s.length > 20 &&
        /(만들|넣|볶|끓|섞|구워|삶|익|절|간|오븐|팬|면|소스|재료)/.test(s) &&
        !/(나무위키|문서|분류|여러|일반인|오해|위키)/.test(s),
    )
    .slice(0, 8)

  return {
    ingredients: [],
    steps,
    description,
  }
}

function isGoodParse(parsed) {
  if (parsed.steps.length === 0) return false
  if (parsed.steps.some((step) => STEP_NOISE.test(step))) return false
  if (parsed.steps.length >= 3 && parsed.steps.every((step) => step.length >= 12)) return true
  return parsed.steps.length >= 2 && parsed.ingredients.length >= 4
}

function pickDescription(manualEntry, parsed, name) {
  if (manualEntry?.description) return manualEntry.description
  const parsedDesc = parsed.description?.trim() ?? ''
  if (parsedDesc && parsedDesc.length <= 60 && !/문서|위키|일반인\(\?\)|조리시간\s*\|/.test(parsedDesc)) {
    return parsedDesc
  }
  return `${name} 한 그릇`
}

function hasValidSteps(steps) {
  return steps.length > 0 && !steps.some((step) => STEP_NOISE.test(step))
}

function mergeWithManual(parsed, manualEntry, pageUrl) {
  if (!manualEntry) return parsed

  const fromSource = hasValidSteps(parsed.steps)

  if (
    fromSource &&
    (pageUrl.includes('terms.naver.com') || pageUrl.includes('10000recipe.com'))
  ) {
    return {
      ...parsed,
      ingredients: parsed.ingredients.length >= 1 ? parsed.ingredients : manualEntry.ingredients ?? parsed.ingredients,
    }
  }

  if (pageUrl.includes('namu.wiki')) {
    return {
      ingredients:
        parsed.ingredients.length >= 3 ? parsed.ingredients : manualEntry.ingredients ?? [],
      steps: manualEntry.steps ?? [],
      description: manualEntry.description ?? parsed.description,
    }
  }

  if (!isGoodParse(parsed)) {
    return {
      ingredients:
        manualEntry.ingredients?.length > 0 ? manualEntry.ingredients : parsed.ingredients,
      steps: manualEntry.steps?.length > 0 ? manualEntry.steps : parsed.steps,
      description:
        !parsed.description || parsed.description.length < 20
          ? (manualEntry.description ?? parsed.description)
          : parsed.description,
    }
  }

  return parsed
}

async function search10000RecipeImage(name) {
  const q = encodeURIComponent(name)
  const html = await fetch(`https://www.10000recipe.com/recipe/list.html?q=${q}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      Accept: 'text/html',
    },
  }).then((r) => r.text())

  const match = html.match(/https:\/\/recipe1\.ezmember\.co\.kr\/cache\/recipe\/\d+\/\d+\.jpg/i)
  return match?.[0] ?? ''
}

async function fetchPage(url) {
  const blogMatch = url.match(/blog\.naver\.com\/([^/]+)\/(\d+)/)
  const fetchUrl = blogMatch
    ? `https://blog.naver.com/PostView.naver?blogId=${blogMatch[1]}&logNo=${blogMatch[2]}`
    : url

  const res = await fetch(fetchUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      Accept: 'text/html,application/xhtml+xml',
    },
    redirect: 'follow',
  })

  return { html: await res.text(), fetchUrl }
}

async function downloadImage(imageUrl, filePath, referer) {
  if (!imageUrl || imageUrl.endsWith('.svg')) return false

  const url = imageUrl.startsWith('//') ? `https:${imageUrl}` : imageUrl
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      Referer: referer,
      Accept: 'image/*,*/*',
    },
  })

  if (!res.ok) return false

  const contentType = res.headers.get('content-type') ?? ''
  if (!contentType.includes('image')) return false

  const buffer = Buffer.from(await res.arrayBuffer())
  if (buffer.length < 500) return false

  fs.writeFileSync(filePath, buffer)
  return true
}

function parseRecipe(html, pageUrl) {
  if (pageUrl.includes('10000recipe.com')) return parse10000Recipe(html)
  if (pageUrl.includes('terms.naver.com')) return parseNaverTerms(html)
  if (pageUrl.includes('blog.naver.com')) return parseBlog(html)
  if (pageUrl.includes('namu.wiki')) return parseNamuWiki(html)
  return { ingredients: [], steps: [], description: '' }
}

async function importOne(item, index, manualRecipes) {
  const { html, fetchUrl } = await fetchPage(item.url)
  const parsed = mergeWithManual(parseRecipe(html, fetchUrl), manualRecipes[item.name], fetchUrl)
  let remoteImage = pickImageUrl(html, fetchUrl)

  const slug = `${String(index + 1).padStart(2, '0')}-${slugify(item.name)}`
  let ext = remoteImage.includes('.png') ? 'png' : remoteImage.includes('.webp') ? 'webp' : 'jpg'
  let localFile = `${slug}.${ext}`
  let localPath = path.join(IMAGE_DIR, localFile)

  let imageUrl = `/images/foods/${localFile}`
  let downloaded = await downloadImage(remoteImage, localPath, fetchUrl)

  if (!downloaded) {
    const fallback = IMAGE_FALLBACKS[item.name] ?? (await search10000RecipeImage(item.name))
    if (fallback) {
      remoteImage = fallback
      ext = fallback.includes('.png') ? 'png' : fallback.includes('.webp') ? 'webp' : 'jpg'
      localFile = `${slug}.${ext}`
      localPath = path.join(IMAGE_DIR, localFile)
      imageUrl = `/images/foods/${localFile}`
      downloaded = await downloadImage(remoteImage, localPath, fetchUrl)
    }
  }

  if (downloaded && fs.statSync(localPath).size < 20_000 && fetchUrl.includes('namu.wiki')) {
    const fallback = IMAGE_FALLBACKS[item.name] ?? (await search10000RecipeImage(item.name))
    if (fallback) {
      remoteImage = fallback
      ext = 'jpg'
      localFile = `${slug}.${ext}`
      localPath = path.join(IMAGE_DIR, localFile)
      imageUrl = `/images/foods/${localFile}`
      downloaded = await downloadImage(remoteImage, localPath, fetchUrl)
    }
  }

  if (!downloaded) {
    imageUrl = remoteImage.startsWith('//') ? `https:${remoteImage}` : remoteImage
  }

  const ingredients =
    parsed.ingredients.length > 0 ? parsed.ingredients : [item.name, '소금', '후추', '식용유']
  const steps = parsed.steps
    .map((step) => step.replace(/^\d+\.\s*/, '').trim())
    .filter(Boolean)

  return {
    categoryIndex: CATEGORY_ORDER.indexOf(item.category),
    name: item.name,
    description: pickDescription(manualRecipes[item.name], parsed, item.name),
    imageUrl,
    sourceUrl: item.url,
    ingredients: ingredients.join('|'),
    steps: steps.join('\n'),
    ingredientCount: ingredients.length,
    stepCount: steps.length,
    imageDownloaded: downloaded,
  }
}

const manualRecipes = JSON.parse(fs.readFileSync(MANUAL_RECIPES, 'utf8'))
const raw = fs.readFileSync(FOOD_TXT, 'utf8')
const items = parseFoodTxt(raw)
fs.mkdirSync(IMAGE_DIR, { recursive: true })

const results = []
for (let i = 0; i < items.length; i += 1) {
  process.stdout.write(`import ${i + 1}/${items.length} ${items[i].name}...\n`)
  results.push(await importOne(items[i], i, manualRecipes))
  await new Promise((r) => setTimeout(r, 350))
}

fs.writeFileSync(OUT_JSON, JSON.stringify(results, null, 2))

const foods = results.map(({ sourceUrl, ingredientCount, stepCount, imageDownloaded, ...food }) => food)
const output = `/** food.txt 기준 시드 데이터 (node scripts/import-food-data.mjs) */\nexport const FOOD_SEED_DATA = ${JSON.stringify(foods, null, 2)} as const\n`
fs.writeFileSync(OUT_DATA, output)

const downloaded = results.filter((r) => r.imageDownloaded).length
console.log(`done: ${results.length} foods, images downloaded ${downloaded}/${results.length}`)
