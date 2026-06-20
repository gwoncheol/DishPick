import { FormEvent, useEffect, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { AdminFoodForm, parseLines } from '~/components/AdminFoodForm'
import { getCategories, getFoodDetail, updateFood } from '~/server/foods'
import type { FoodSavePayload } from '~/types'

export const Route = createFileRoute('/admin/edit/$id')({
  loader: async ({ params }) => {
    const [categories, food] = await Promise.all([
      getCategories(),
      getFoodDetail({ data: Number(params.id) }),
    ])
    return { categories, food }
  },
  component: AdminFoodEditPage,
})

function AdminFoodEditPage() {
  const { categories, food } = Route.useLoaderData()
  const navigate = useNavigate()
  const [form, setForm] = useState<FoodSavePayload>({
    categoryId: food.categoryId,
    name: food.name,
    description: food.description ?? '',
    imageUrl: food.imageUrl ?? '',
    ingredients: food.ingredients,
    steps: food.steps,
  })
  const [ingredientsText, setIngredientsText] = useState(food.ingredients.join('\n'))
  const [stepsText, setStepsText] = useState(food.steps.join('\n'))
  const [error, setError] = useState('')

  useEffect(() => {
    setForm({
      categoryId: food.categoryId,
      name: food.name,
      description: food.description ?? '',
      imageUrl: food.imageUrl ?? '',
      ingredients: food.ingredients,
      steps: food.steps,
    })
    setIngredientsText(food.ingredients.join('\n'))
    setStepsText(food.steps.join('\n'))
  }, [food])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    const payload: FoodSavePayload = {
      ...form,
      ingredients: parseLines(ingredientsText),
      steps: parseLines(stepsText),
    }
    try {
      await updateFood({ data: { id: food.id, data: payload } })
      navigate({ to: '/admin' })
    } catch {
      setError('저장에 실패했습니다.')
    }
  }

  return (
    <AdminFoodForm
      title="메뉴 수정"
      categories={categories}
      form={form}
      setForm={setForm}
      ingredientsText={ingredientsText}
      setIngredientsText={setIngredientsText}
      stepsText={stepsText}
      setStepsText={setStepsText}
      error={error}
      submitLabel="수정 저장"
      onSubmit={handleSubmit}
    />
  )
}
