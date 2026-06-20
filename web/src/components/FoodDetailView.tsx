import type { FoodDetail } from '~/types'

interface FoodDetailViewProps {
  food: FoodDetail
}

export function FoodDetailView({ food }: FoodDetailViewProps) {
  return (
    <article className="detail-card">
      <div className="detail-image-wrap">
        {food.imageUrl ? (
          <img className="detail-image" src={food.imageUrl} alt={food.name} referrerPolicy="no-referrer" />
        ) : (
          <span>이미지 없음</span>
        )}
      </div>
      <div className="detail-body">
        <div className="detail-meta">{food.categoryName}</div>
        <h1 className="page-title">{food.name}</h1>
        <p>{food.description}</p>

        <section className="recipe-section">
          <h3>재료</h3>
          <ul>
            {food.ingredients.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="recipe-section">
          <h3>조리 방법</h3>
          <ol>
            {food.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>
      </div>
    </article>
  )
}
