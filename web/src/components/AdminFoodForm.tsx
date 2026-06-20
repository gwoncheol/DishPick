import { FormEvent } from 'react'
import { Link } from '@tanstack/react-router'
import type { Category, FoodSavePayload } from '~/types'

interface AdminFoodFormProps {
  title: string
  categories: Category[]
  form: FoodSavePayload
  setForm: (value: FoodSavePayload) => void
  ingredientsText: string
  setIngredientsText: (value: string) => void
  stepsText: string
  setStepsText: (value: string) => void
  error: string
  submitLabel: string
  onSubmit: (event: FormEvent) => void
}

export function AdminFoodForm({
  title,
  categories,
  form,
  setForm,
  ingredientsText,
  setIngredientsText,
  stepsText,
  setStepsText,
  error,
  submitLabel,
  onSubmit,
}: AdminFoodFormProps) {
  return (
    <>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">{title}</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            메뉴 정보와 레시피를 함께 등록합니다.
          </p>
        </div>
        <Link to="/admin" className="btn btn-outline">
          목록으로
        </Link>
      </div>

      <form className="admin-form" onSubmit={onSubmit}>
        <label>
          카테고리
          <select
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: Number(e.target.value) })}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          메뉴명
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </label>

        <label>
          설명
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
          />
        </label>

        <label>
          이미지 URL
          <input
            type="url"
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          />
        </label>

        <label>
          재료 (한 줄에 하나)
          <textarea
            value={ingredientsText}
            onChange={(e) => setIngredientsText(e.target.value)}
            rows={6}
            required
          />
        </label>

        <label>
          조리 방법 (한 줄에 하나)
          <textarea
            value={stepsText}
            onChange={(e) => setStepsText(e.target.value)}
            rows={6}
            required
          />
        </label>

        {error && <div className="error">{error}</div>}

        <button type="submit" className="btn btn-primary">
          {submitLabel}
        </button>
      </form>
    </>
  )
}

export function parseLines(value: string) {
  return value.split('\n').map((line) => line.trim()).filter(Boolean)
}
