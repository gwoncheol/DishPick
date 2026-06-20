import { Link, createFileRoute, useRouter } from '@tanstack/react-router'
import { getFoods, deleteFood } from '~/server/foods'

export const Route = createFileRoute('/admin/')({
  loader: () => getFoods(),
  component: AdminPage,
})

function AdminPage() {
  const foods = Route.useLoaderData()
  const router = useRouter()

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`"${name}" 메뉴를 삭제할까요?`)) return
    try {
      await deleteFood({ data: id })
      await router.invalidate()
    } catch {
      alert('삭제에 실패했습니다.')
    }
  }

  return (
    <>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">메뉴 관리</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            웹에서 메뉴와 레시피를 추가·수정·삭제할 수 있습니다.
          </p>
        </div>
        <Link to="/admin/new" className="btn btn-primary">
          + 메뉴 추가
        </Link>
      </div>

      <div className="admin-table-wrap" style={{ marginTop: '1.5rem' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>이미지</th>
              <th>메뉴명</th>
              <th>카테고리</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {foods.map((food) => (
              <tr key={food.id}>
                <td>
                  {food.imageUrl ? (
                    <img src={food.imageUrl} alt={food.name} className="admin-thumb" referrerPolicy="no-referrer" />
                  ) : (
                    '-'
                  )}
                </td>
                <td>{food.name}</td>
                <td>{food.categoryName}</td>
                <td>
                  <div className="admin-table-actions">
                    <Link
                      to="/admin/edit/$id"
                      params={{ id: String(food.id) }}
                      className="btn btn-outline btn-sm"
                    >
                      수정
                    </Link>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(food.id, food.name)}
                    >
                      삭제
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
