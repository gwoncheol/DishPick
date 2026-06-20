const blogItems = [
  { name: '규동', url: 'https://blog.naver.com/PostView.naver?blogId=firehouse79&logNo=223426067283' },
  { name: '오야꼬동', url: 'https://blog.naver.com/PostView.naver?blogId=naettee&logNo=224315589626' },
  { name: '야끼우동', url: 'https://blog.naver.com/PostView.naver?blogId=jin5194&logNo=224311470361' },
  { name: '차슈덮밥', url: 'https://blog.naver.com/PostView.naver?blogId=hoy2u&logNo=224263348281' },
  { name: '나폴리탄', url: 'https://blog.naver.com/PostView.naver?blogId=lalacucina&logNo=224293479869' },
  { name: '마파두부', url: 'https://blog.naver.com/PostView.naver?blogId=jin5194&logNo=224317430984' },
  { name: '고추잡채', url: 'https://blog.naver.com/PostView.naver?blogId=jin5194&logNo=224307565638' },
]

function pickImage(html) {
  const og = html.match(/property="og:image"\s+content="([^"]+)"/)
  if (og?.[1]) return og[1].replace(/&amp;/g, '&')
  const imgs = [...html.matchAll(/https:\/\/postfiles\.pstatic\.net\/[^"']+\.(?:jpg|jpeg|png|webp)/gi)]
  return imgs[0]?.[0] ?? ''
}

function pickDescription(html) {
  const og = html.match(/property="og:description"\s+content="([^"]+)"/)
  return og?.[1]?.replace(/&amp;/g, '&') ?? ''
}

for (const item of blogItems) {
  const res = await fetch(item.url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
  })
  const html = await res.text()
  console.log(JSON.stringify({
    name: item.name,
    imageUrl: pickImage(html),
    description: pickDescription(html).slice(0, 200),
  }))
}
