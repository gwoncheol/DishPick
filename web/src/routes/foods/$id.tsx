import { createFileRoute } from '@tanstack/react-router'
import { FoodDetailView } from '~/components/FoodDetailView'
import { getFoodDetail } from '~/server/foods'

export const Route = createFileRoute('/foods/$id')({
  loader: ({ params }) => getFoodDetail({ data: Number(params.id) }),
  component: FoodDetailPage,
})

function FoodDetailPage() {
  const food = Route.useLoaderData()
  return <FoodDetailView food={food} />
}
