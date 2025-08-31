"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import * as api from "@/lib/api"

export default function UserProfilePage() {
  const { username } = useParams<{ username: string }>()
  const [user, setUser] = useState<api.UserPublic | null>(null)
  const [posts, setPosts] = useState<api.PostPublic[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const u = await api.getUser(username)
        const feed = await api.listPostsByAuthor(username, 0, 50)
        if (!mounted) return
        setUser(u)
        setPosts(feed.items)
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [username])

  if (loading) return <div className="p-4">Загрузка…</div>
  if (!user) return <div className="p-4">Пользователь не найден</div>

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="bg-white rounded-xl shadow p-4">
        <h1 className="text-2xl font-semibold">{user.display_name || user.username}</h1>
        <div className="text-gray-600">@{user.username}</div>
        {user.bio ? <p className="mt-2 whitespace-pre-wrap">{user.bio}</p> : null}
        <div className="mt-3 text-sm text-gray-600 flex gap-4">
          <span><strong>{user.posts_count}</strong> постов</span>
          <span><strong>{user.followers_count}</strong> подписчиков</span>
          <span><strong>{user.following_count}</strong> подписки</span>
        </div>
        <div className="mt-3">
          <Link href="/" className="text-blue-600 hover:underline">← На главную</Link>
        </div>
      </div>

      <div className="space-y-3">
        {posts.map(p => (
          <div key={p.id} className="bg-white rounded-xl shadow p-4">
            <div className="text-sm text-gray-600 mb-1">
              {new Date(p.created_at).toLocaleString()}
            </div>
            <div className="whitespace-pre-wrap">{p.text}</div>
            <div className="mt-2 text-sm text-gray-600">❤ {p.likes_count}  ↻ {p.reposts_count}</div>
          </div>
        ))}
        {!posts.length && <div className="text-gray-500">Постов пока нет.</div>}
      </div>
    </div>
  )
}
