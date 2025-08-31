"use client"
import { useEffect, useState } from "react"
import { useAuth } from "./auth-context"
import * as api from "@/lib/api"
import { Button } from "@/components/ui/button"

export function UserProfile() {
  const { user } = useAuth()
  const [me, setMe] = useState<api.UserPublic | null>(null)
  const [myPosts, setMyPosts] = useState<api.PostPublic[]>([])

  useEffect(() => {
  api.getMe().then(async (me) => {
    setMe(me)
    const feed = await api.listPostsByAuthor(me.username, 0, 50)
    setMyPosts(feed.items)
  }).catch(() => setMe(null))
}, [])

  if (!user || !me) return null

  return (
    <div>
      <div className="bg-white rounded-xl shadow p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">{me.display_name || me.username}</h2>
            <p className="text-gray-600">@{me.username}</p>
          </div>
        </div>

        {me.bio ? <p className="mt-2">{me.bio}</p> : null}

        <div className="mt-3 text-sm text-gray-600 flex gap-4">
          <span><strong>{me.posts_count}</strong> постов</span>
          <span><strong>{me.followers_count}</strong> подписчиков</span>
          <span><strong>{me.following_count}</strong> подписки</span>
        </div>
      </div>
      <div className="mt-6 space-y-3">
        {myPosts.map(p => (
          <div key={p.id} className="bg-white rounded-xl shadow p-4">
            <div className="text-sm text-gray-600 mb-1">
              {new Date(p.created_at).toLocaleString()}
            </div>
            <div className="whitespace-pre-wrap">{p.text}</div>
          </div>))}
      </div>
    </div>
    
  )
}

