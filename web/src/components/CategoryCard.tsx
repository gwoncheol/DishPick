import { Link } from '@tanstack/react-router'
import type { Category } from '~/types'

interface CategoryCardProps {
  category: Category
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link to="/categories/$id" params={{ id: String(category.id) }} className="category-card">
      {category.name}
    </Link>
  )
}
