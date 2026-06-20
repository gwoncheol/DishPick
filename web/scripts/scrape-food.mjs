import fs from 'node:fs'

const items = [
  { category: '한식', name: '돼지고기 김치찌개', url: 'https://terms.naver.com/entry.naver?docId=5646093&cid=42785&categoryId=60402' },
  { category: '한식', name: '된장찌개', url: 'https://terms.naver.com/entry.naver?docId=5685364&cid=48163&categoryId=48201' },
  { category: '한식', name: '순두부찌개', url: 'https://terms.naver.com/entry.naver?docId=1988773&cid=48163&categoryId=48201' },
  { category: '한식', name: '부대찌개', url: 'https://terms.naver.com/entry.naver?docId=5670038&cid=42785&categoryId=62795' },
  { category: '한식', name: '삼계탕', url: 'https://terms.naver.com/entry.naver?docId=3390195&cid=48163&categoryId=48200' },
  { category: '한식', name: '갈비탕', url: 'https://terms.naver.com/entry.naver?docId=3390194&cid=48163&categoryId=48200' },
  { category: '한식', name: '설렁탕', url: 'https://terms.naver.com/entry.naver?docId=3390196&cid=48163&categoryId=48200' },
  { category: '한식', name: '육개장', url: 'https://terms.naver.com/entry.naver?docId=3390193&cid=48163&categoryId=48200' },
  { category: '한식', name: '해물 칼국수', url: 'https://terms.naver.com/entry.naver?docId=3390222&cid=48162&categoryId=48198' },
  { category: '한식', name: '불고기', url: 'https://terms.naver.com/entry.naver?docId=3390149&categoryId=58360&cid=42701' },
  { category: '한식', name: '닭찜', url: 'https://terms.naver.com/entry.naver?docId=3390185&categoryId=58360&cid=42701' },
  { category: '한식', name: '떡국', url: 'https://terms.naver.com/entry.naver?docId=3390220&categoryId=58360&cid=42701' },
  { category: '한식', name: '전복죽', url: 'https://terms.naver.com/entry.naver?docId=3390230&categoryId=58360&cid=42701' },
  { category: '한식', name: '팥죽', url: 'https://terms.naver.com/entry.naver?docId=3390227&categoryId=58360&cid=42701' },
  { category: '한식', name: '만둣국', url: 'https://terms.naver.com/entry.naver?docId=3390217&categoryId=58360&cid=42701' },
  { category: '일식', name: '가츠동', url: 'https://terms.naver.com/entry.naver?docId=1991175&cid=48161&categoryId=48196' },
  { category: '일식', name: '규동', url: 'https://blog.naver.com/firehouse79/223426067283' },
  { category: '일식', name: '오야꼬동', url: 'https://blog.naver.com/naettee/224315589626' },
  { category: '일식', name: '야끼우동', url: 'https://blog.naver.com/jin5194/224311470361' },
  { category: '일식', name: '오코노미야키', url: 'https://www.10000recipe.com/recipe/6865655' },
  { category: '일식', name: '니쿠자가', url: 'https://www.10000recipe.com/recipe/6839856' },
  { category: '일식', name: '차슈덮밥', url: 'https://blog.naver.com/hoy2u/224263348281' },
  { category: '일식', name: '나베', url: 'https://www.10000recipe.com/recipe/6869524' },
  { category: '일식', name: '나폴리탄', url: 'https://blog.naver.com/lalacucina/224293479869' },
  { category: '중식', name: '마파두부', url: 'https://blog.naver.com/jin5194/224317430984' },
  { category: '중식', name: '동파육', url: 'https://www.10000recipe.com/recipe/6847827' },
  { category: '중식', name: '토마토달걀볶음', url: 'https://www.10000recipe.com/recipe/6888319' },
  { category: '중식', name: '고추잡채', url: 'https://blog.naver.com/jin5194/224307565638' },
  { category: '양식', name: '토마토 파스타', url: 'https://namu.wiki/w/%ED%86%A0%EB%A7%88%ED%86%A0%20%ED%8C%8C%EC%8A%A4%ED%83%80' },
  { category: '양식', name: '까르보나라', url: 'https://namu.wiki/w/%EC%B9%B4%EB%A5%B4%EB%B3%B4%EB%82%98%EB%9D%BC' },
  { category: '양식', name: '알리오 올리오', url: 'https://namu.wiki/w/%EC%95%8C%EB%A6%AC%EC%98%A4%20%EC%97%90%20%EC%98%AC%EB%A6%AC%EC%98%A4' },
  { category: '양식', name: '봉골레 파스타', url: 'https://namu.wiki/w/%EB%B4%89%EA%B3%A8%EB%A0%88%20%ED%8C%8C%EC%8A%A4%ED%83%80' },
  { category: '양식', name: '오믈렛', url: 'https://namu.wiki/w/%EC%98%A4%EB%AF%88%EB%A0%9B' },
  { category: '양식', name: '파니니', url: 'https://www.10000recipe.com/recipe/6912777' },
  { category: '양식', name: '리조또', url: 'https://www.10000recipe.com/recipe/6840571' },
  { category: '양식', name: '감바스', url: 'https://www.10000recipe.com/recipe/6884805' },
  { category: '양식', name: '그라탱', url: 'https://www.10000recipe.com/recipe/6838688' },
  { category: '디저트', name: '브라우니', url: 'https://www.10000recipe.com/recipe/6884342' },
  { category: '디저트', name: '마들렌', url: 'https://www.10000recipe.com/recipe/6837548' },
  { category: '디저트', name: '티라미수', url: 'https://www.10000recipe.com/recipe/6888536' },
  { category: '디저트', name: '머핀', url: 'https://www.10000recipe.com/recipe/6838450' },
  { category: '디저트', name: '스콘', url: 'https://terms.naver.com/entry.naver?docId=1988080&cid=48169&categoryId=48223' },
]

function pickImage(html, url) {
  const og = html.match(/property="og:image"\s+content="([^"]+)"/) ||
    html.match(/content="([^"]+)"\s+property="og:image"/)
  if (og?.[1]) return og[1].replace(/&amp;/g, '&')

  if (url.includes('10000recipe.com')) {
    const imgs = [...html.matchAll(/https:\/\/recipe1\.ezmember\.co\.kr\/cache\/recipe\/[^"']+\.(?:jpg|jpeg|png)/gi)]
    if (imgs.length) return imgs[0][0]
  }

  if (url.includes('terms.naver.com')) {
    const imgs = [...html.matchAll(/https:\/\/dthumb-phinf\.pstatic\.net\/[^"'?]+\?type=[^"']+/gi)]
    if (imgs.length) return imgs[0][0]
  }

  if (url.includes('blog.naver.com')) {
    const imgs = [...html.matchAll(/https:\/\/blogpfthumb-phinf\.pstatic\.net[^"']+/gi)]
    if (imgs.length) return imgs[0][0]
    const postImg = html.match(/https:\/\/postfiles\.pstatic\.net[^"']+\.(?:jpg|jpeg|png)/i)
    if (postImg?.[0]) return postImg[0]
  }

  if (url.includes('namu.wiki')) {
    const imgs = [...html.matchAll(/https:\/\/i\.namu\.wiki\/i\/[^"']+\.(?:webp|jpg|jpeg|png)/gi)]
    if (imgs.length) return imgs[0][0]
  }

  return ''
}

function pickDescription(html) {
  const og = html.match(/property="og:description"\s+content="([^"]+)"/) ||
    html.match(/content="([^"]+)"\s+property="og:description"/)
  return og?.[1]?.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'") ?? ''
}

async function scrapeOne(item) {
  try {
    const res = await fetch(item.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: 'text/html',
      },
      redirect: 'follow',
    })
    const html = await res.text()
    return {
      ...item,
      status: res.status,
      imageUrl: pickImage(html, item.url),
      description: pickDescription(html),
    }
  } catch (error) {
    return { ...item, status: 0, imageUrl: '', description: '', error: String(error) }
  }
}

const results = []
for (const item of items) {
  results.push(await scrapeOne(item))
  await new Promise((r) => setTimeout(r, 250))
}

fs.mkdirSync('scripts', { recursive: true })
fs.writeFileSync('scripts/scrape-results.json', JSON.stringify(results, null, 2))
console.log(`scraped ${results.length}, images ${results.filter((r) => r.imageUrl).length}`)
