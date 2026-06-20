import { createFileRoute, useRouter } from '@tanstack/react-router'
import { FoodDetailView } from '~/components/FoodDetailView'
import { getRandomFood } from '~/server/foods'

export const Route = createFileRoute('/random')({
  loader: () => getRandomFood(),
  component: RandomPage,
})

function RandomPage() {
  const food = Route.useLoaderData()
  const router = useRouter()

  return (
    <>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">랜덤 추천</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            오늘의 메뉴를 운명에 맡겨보세요.
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => router.invalidate()}>
          🎲 다시 추천
        </button>
      </div>
      <div style={{ marginTop: '1.5rem' }}>
        <FoodDetailView food={food} />
      </div>
    </>
  )
}
