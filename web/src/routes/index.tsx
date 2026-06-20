import { Link, createFileRoute } from '@tanstack/react-router'
import { CategoryCard } from '~/components/CategoryCard'
import { FoodCard } from '~/components/FoodCard'
import { getCategories, getFoods } from '~/server/foods'

export const Route = createFileRoute('/')({
  loader: async () => {
    const [categories, foods] = await Promise.all([getCategories(), getFoods()])
    return { categories, foods: foods.slice(0, 4) }
  },
  component: HomePage,
})

function HomePage() {
  const { categories, foods } = Route.useLoaderData()

  return (
    <>
      <section className="hero">
        <h1>오늘 뭐 먹지?</h1>
        <p>고민하지 마세요. DishPick이 메뉴와 레시피를 추천해 드립니다.</p>
        <div className="hero-actions">
          <Link to="/random" className="btn btn-primary">
            🎲 랜덤 추천 받기
          </Link>
          <Link to="/search" search={{ q: '' }} className="btn btn-outline">
            🔍 음식 검색
          </Link>
        </div>
      </section>

      <section>
        <h2 className="section-title">카테고리</h2>
        <div className="category-grid">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      <section style={{ marginTop: '2.5rem' }}>
        <h2 className="section-title">인기 메뉴</h2>
        <div className="food-grid">
          {foods.map((food) => (
            <FoodCard key={food.id} food={food} />
          ))}
        </div>
      </section>
    </>
  )
}
