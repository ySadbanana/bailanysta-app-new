"use client"

import { useState, useEffect } from "react"
import { useAuth } from "./auth-context"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Heart, Repeat2 } from "lucide-react"
import * as api from "@/lib/api"
import Link from "next/link"

interface Post {
  id: number
  authorUsername: string
  authorDisplayName?: string | null
  content: string
  timestamp: string
  likes: number
  retweets: number
  likedByMe?: boolean
  repostedFromId?: number | null
  repostedByMe?: boolean
}

export function PostsFeed() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")

  const loadFeed = async () => {
    try {
      const feed = await api.publicFeed(0, 50)
      const mapped = feed.items.map(p => ({
        id: p.id,
        authorUsername: p.author.username,
        authorDisplayName: p.author.display_name,
        content: p.text,
        timestamp: p.created_at,
        likes: p.likes_count,
        retweets: p.reposts_count,
        repostedFromId: p.original_post_id ?? null,
        likedByMe: p.liked_by_me,
        repostedByMe: p.reposted_by_me
      } as Post))
      setPosts(mapped)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const search = async () => {
  if (!query.trim()) return loadFeed()
  try {
    const res = await api.searchPosts(query.trim(), 0, 50)
    const mapped = res.items.map(p => ({
      id: p.id,
      authorUsername: p.author.username,
      authorDisplayName: p.author.display_name,
      content: p.text,
      timestamp: p.created_at,
      likes: p.likes_count,
      retweets: p.reposts_count,
      likedByMe: p.liked_by_me,
      repostedByMe: p.reposted_by_me,
      repostedFromId: p.original_post_id ?? null,
    } as Post))
    setPosts(mapped)
  } catch (e) {
    console.error(e)
  }
}

  useEffect(() => {
    loadFeed()
    const handler = () => loadFeed()
    window.addEventListener("postsUpdated", handler)
    return () => window.removeEventListener("postsUpdated", handler)
  }, [])

  const handleLike = async (postId: number) => {
    // оптимистичное обновление
    setPosts(prev => prev.map(p => p.id === postId
    ? { ...p, likedByMe: !p.likedByMe, likes: p.likes + (p.likedByMe ? -1 : 1) }
    : p))

    try {
      const post = posts.find(p => p.id === postId)
      if (post?.likedByMe) {
        await api.unlikePost(postId)  // если был лайкнут — снимаем
      } else {
        await api.likePost(postId)    // иначе — ставим
      }
    } catch (e) {
      console.error(e)
      // откат
      setPosts(prev => prev.map(p => p.id === postId
        ? { ...p, likedByMe: !p.likedByMe, likes: p.likes + (p.likedByMe ? -1 : 1) }
        : p))
    }
  }

  const handleRetweet = async (postId: number) => {
    // запретим повторный репост: если уже делал — просто выходим
    const post = posts.find(p => p.id === postId)
    if (post?.repostedByMe) return

    setPosts(prev => prev.map(p => p.id === postId
    ? { ...p, repostedByMe: true, retweets: p.retweets + 1 }
    : p))

    try {
      await api.repostPost(postId)
    } catch (e) {
      console.error(e)
      setPosts(prev => prev.map(p => p.id === postId
        ? { ...p, repostedByMe: false, retweets: Math.max(0, p.retweets - 1) }
        : p))
    }
  }

  if (loading) return <div className="p-4">Загрузка...</div>

  return (
    <div>
      <div className="p-4">
        <input
          className="w-full border rounded-lg px-3 py-2"
          placeholder="Поиск (слова или #хэштеги)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
        />
        <div className="mt-2 flex gap-2">
          <Button onClick={search} size="sm">Найти</Button>
          <Button variant="ghost" size="sm" onClick={loadFeed}>Сброс</Button>
        </div>
      </div>
      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-xl shadow p-4">
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>{post.authorUsername.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Link href={`/u/${post.authorUsername}`} className="font-semibold text-gray-900 hover:underline">
                    {post.authorDisplayName || post.authorUsername}
                  </Link>
                  <Link href={`/u/${post.authorUsername}`} className="hover:underline">
                    @{post.authorUsername}
                  </Link>
                  <span>· {new Date(post.timestamp).toLocaleString()}</span>
                </div>

                <div className="mt-2 whitespace-pre-wrap">{post.content}</div>

                <div className="mt-3 flex items-center gap-6 text-sm text-gray-600">
                  <button
                    className={`flex items-center gap-2 ${post.likedByMe ? "text-red-600" : ""}`}
                    aria-pressed={post.likedByMe}
                    onClick={() => handleLike(post.id)}
                  >
                    <Heart className="h-4 w-4" /> {post.likes}
                  </button>
                  <button
                    className={`flex items-center gap-2 ${post.repostedByMe ? "text-blue-600" : ""}`}
                    aria-pressed={post.repostedByMe}
                    onClick={() => handleRetweet(post.id)}
                    disabled={post.authorUsername === user?.username}
                    title={post.authorUsername === user?.username ? "Нельзя репостить свой пост" : ""}
                  >
                    <Repeat2 className="h-4 w-4" /> {post.retweets}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
