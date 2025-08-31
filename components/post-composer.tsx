"use client"

import { useState } from "react"
import { useAuth } from "./auth-context"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Post {
  id: string
  userId: string
  username: string
  displayName: string
  content: string
  timestamp: string
  likes: number
  retweets: number
  replies: number
  likedBy: string[]
  retweetedBy: string[]
}

export function PostComposer() {
  const { user } = useAuth()
  const [content, setContent] = useState("")
  const [isPosting, setIsPosting] = useState(false)

  if (!user) return null

  const handlePost = async () => {
    if (!content.trim() || isPosting) return

    setIsPosting(true)

    // Create new post
    const newPost: Post = {
      id: Date.now().toString(),
      userId: user.id,
      username: user.username,
      displayName: user.displayName,
      content: content.trim(),
      timestamp: new Date().toISOString(),
      likes: 0,
      retweets: 0,
      replies: 0,
      likedBy: [],
      retweetedBy: [],
    }

    // Create post via API
    try {
      const created = await (await import("@/lib/api")).createPost(content);
      setContent("")
      setIsPosting(false)
      // Notify listeners to reload feed
      window.dispatchEvent(new CustomEvent("postsUpdated"))
    } catch (e) {
      console.error(e)
      setIsPosting(false)
      alert("Не удалось опубликовать пост: " + (e as Error).message)
    }
      }

  const characterCount = content.length
  const maxCharacters = 280
  const isOverLimit = characterCount > maxCharacters

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex gap-4">
        <Avatar className="h-12 w-12 flex-shrink-0">
          <AvatarFallback className="bg-blue-100 text-blue-600 text-lg font-medium">
            {user.displayName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-4">
          <Textarea
            placeholder="What's happening?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[120px] text-lg border-none shadow-none resize-none focus-visible:ring-0 p-0 placeholder:text-gray-500"
            maxLength={maxCharacters + 50} // Allow slight overflow for warning
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`text-sm ${
                  isOverLimit
                    ? "text-red-500"
                    : characterCount > maxCharacters * 0.8
                      ? "text-yellow-600"
                      : "text-gray-500"
                }`}
              >
                {characterCount}/{maxCharacters}
              </span>
              {isOverLimit && <span className="text-xs text-red-500">Превышено кол-во символов</span>}
            </div>

            <Button
              onClick={handlePost}
              disabled={!content.trim() || isPosting || isOverLimit}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 px-8 py-2 rounded-full font-medium"
            >
              {isPosting ? "Posting..." : "Post"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
