import { createFileRoute } from '@tanstack/react-router'
import { FoodCard } from '~/components/FoodCard'
import { getCategories, getFoodsByCategory } from '~/server/foods'

export const Route = createFileRoute('/categories/$id')({
  loader: async ({ params }) => {
    const categoryId = Number(params.id)
    const [categories, foods] = await Promise.all([
      getCategories(),
      getFoodsByCategory({ data: categoryId }),
    ])
    const categoryName = categories.find((item) => item.id === categoryId)?.name ?? '카테고리'
    return { categoryName, foods }
  },
  component: CategoryPage,
})

function CategoryPage() {
  const { categoryName, foods } = Route.useLoaderData()

  return (
    <>
      <h1 className="page-title">{categoryName}</h1>
      <p className="page-subtitle">{categoryName} 메뉴를 골라보세요.</p>
      {foods.length === 0 ? (
        <div className="empty">등록된 메뉴가 없습니다.</div>
      ) : (
        <div className="food-grid">
          {foods.map((food) => (
            <FoodCard key={food.id} food={food} />
          ))}
        </div>
      )}
    </>
  )
}
