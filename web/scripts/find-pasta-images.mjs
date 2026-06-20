const queries = {
  '토마토 파스타': '%ED%86%A0%EB%A7%88%ED%86%A0+%ED%8C%8C%EC%8A%A4%ED%83%80',
  까르보나라: '%EC%B9%B4%EB%A5%B4%EB%B3%B4%EB%82%98%EB%9D%BC',
  '알리오 올리오': '%EC%95%8C%EB%A6%AC%EC%98%A4+%EC%98%AC%EB%A6%AC%EC%98%A4',
  '봉골레 파스타': '%EB%B4%89%EA%B3%A8%EB%A0%88',
  오믈렛: '%EC%98%A4%EB%AF%80%EB%A0%9B',
}

for (const [name, q] of Object.entries(queries)) {
  const res = await fetch(`https://www.10000recipe.com/search.html?q=${q}`, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  })
  const html = await res.text()
  const m = html.match(/href="\/recipe\/(\d+)"/)
  if (!m) {
    console.log(name, 'NOT FOUND')
    continue
  }
  const recipeRes = await fetch(`https://www.10000recipe.com/recipe/${m[1]}`, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  })
  const recipeHtml = await recipeRes.text()
  const img = recipeHtml.match(/https:\/\/recipe1\.ezmember\.co\.kr\/cache\/recipe\/[^"']+\.jpg/)?.[0] ?? ''
  console.log(JSON.stringify({ name, id: m[1], imageUrl: img }))
}
