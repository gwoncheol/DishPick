import { FormEvent, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { FoodCard } from '~/components/FoodCard'
import { searchFoods } from '~/server/foods'

export const Route = createFileRoute('/search')({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === 'string' ? search.q : '',
  }),
  loaderDeps: ({ search }) => ({ q: search.q }),
  loader: async ({ deps }) => {
    if (!deps.q.trim()) return []
    return searchFoods({ data: deps.q })
  },
  component: SearchPage,
})

function SearchPage() {
  const foods = Route.useLoaderData()
  const { q } = Route.useSearch()
  const navigate = Route.useNavigate()
  const [keyword, setKeyword] = useState(q)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    navigate({ to: '/search', search: { q: keyword.trim() } })
  }

  return (
    <>
      <h1 className="page-title">음식 검색</h1>
      <p className="page-subtitle">먹고 싶은 메뉴 이름을 검색해보세요.</p>

      <form className="search-bar" onSubmit={handleSubmit}>
        <input
          type="search"
          placeholder="예: 김치찌개, 파스타"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <button type="submit" className="btn btn-primary">
          검색
        </button>
      </form>

      {q && foods.length === 0 && <div className="empty">검색 결과가 없습니다.</div>}
      {foods.length > 0 && (
        <div className="food-grid">
          {foods.map((food) => (
            <FoodCard key={food.id} food={food} />
          ))}
        </div>
      )}
    </>
  )
}
