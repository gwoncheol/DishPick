import { FormEvent, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { AdminFoodForm, parseLines } from '~/components/AdminFoodForm'
import { createFood, getCategories } from '~/server/foods'
import type { FoodSavePayload } from '~/types'

export const Route = createFileRoute('/admin/new')({
  loader: () => getCategories(),
  component: AdminFoodNewPage,
})

function AdminFoodNewPage() {
  const categories = Route.useLoaderData()
  const navigate = useNavigate()
  const [form, setForm] = useState<FoodSavePayload>({
    categoryId: categories[0]?.id ?? 0,
    name: '',
    description: '',
    imageUrl: '',
    ingredients: [],
    steps: [],
  })
  const [ingredientsText, setIngredientsText] = useState('')
  const [stepsText, setStepsText] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    const payload: FoodSavePayload = {
      ...form,
      ingredients: parseLines(ingredientsText),
      steps: parseLines(stepsText),
    }
    if (!payload.categoryId || !payload.name.trim()) {
      setError('카테고리와 메뉴명은 필수입니다.')
      return
    }
    if (payload.ingredients.length === 0 || payload.steps.length === 0) {
      setError('재료와 조리 방법을 한 줄에 하나씩 입력해주세요.')
      return
    }
    try {
      await createFood({ data: payload })
      navigate({ to: '/admin' })
    } catch {
      setError('저장에 실패했습니다.')
    }
  }

  return (
    <AdminFoodForm
      title="메뉴 추가"
      categories={categories}
      form={form}
      setForm={setForm}
      ingredientsText={ingredientsText}
      setIngredientsText={setIngredientsText}
      stepsText={stepsText}
      setStepsText={setStepsText}
      error={error}
      submitLabel="메뉴 등록"
      onSubmit={handleSubmit}
    />
  )
}
