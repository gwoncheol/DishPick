import { Link, useNavigate } from '@tanstack/react-router'
import { FormEvent, ReactNode, useState } from 'react'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const [keyword, setKeyword] = useState('')
  const navigate = useNavigate()

  const handleSearch = (event: FormEvent) => {
    event.preventDefault()
    const trimmed = keyword.trim()
    if (!trimmed) return
    navigate({ to: '/search', search: { q: trimmed } })
  }

  return (
    <div className="layout">
      <header className="header">
        <div className="container header-inner">
          <Link to="/" className="logo">
            🍽️ DishPick
          </Link>
          <form className="header-search" onSubmit={handleSearch}>
            <input
              type="search"
              placeholder="음식 검색..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">
              검색
            </button>
          </form>
          <nav className="nav">
            <Link to="/">홈</Link>
            <Link to="/random">랜덤 추천</Link>
            <Link to="/admin">관리</Link>
          </nav>
        </div>
      </header>
      <main className="main container">{children}</main>
      <footer className="footer">
        <div className="container">DishPick · 오늘 뭐 먹지?</div>
      </footer>
    </div>
  )
}
