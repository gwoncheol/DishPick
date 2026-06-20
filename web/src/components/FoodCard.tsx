import { Link } from '@tanstack/react-router'
import type { Food } from '~/types'

interface FoodCardProps {
  food: Food
}

export function FoodCard({ food }: FoodCardProps) {
  return (
    <Link to="/foods/$id" params={{ id: String(food.id) }} className="food-card">
      <div className="food-card-image">
        {food.imageUrl ? (
          <img src={food.imageUrl} alt={food.name} loading="lazy" referrerPolicy="no-referrer" />
        ) : (
          <span>이미지 없음</span>
        )}
      </div>
      <div className="food-card-body">
        <span className="food-card-category">{food.categoryName}</span>
        <h3>{food.name}</h3>
        <p>{food.description}</p>
      </div>
    </Link>
  )
}
