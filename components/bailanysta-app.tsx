"use client"

import { useState } from "react"
import { useAuth } from "./auth-context"
import { PostComposer } from "./post-composer"
import { PostsFeed } from "./posts-feed"
import { UserProfile } from "./user-profile"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function BailanystaApp() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<"home" | "profile">("home")

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600">Bailanysta</h1>

          <div className="flex items-center gap-4">
            <Button
              variant={activeTab === "home" ? "default" : "ghost"}
              onClick={() => setActiveTab("home")}
              className="text-sm"
            >
              Home
            </Button>
            <Button
              variant={activeTab === "profile" ? "default" : "ghost"}
              onClick={() => setActiveTab("profile")}
              className="text-sm"
            >
              Profile
            </Button>

            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
                  {user.displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="sm" onClick={logout} className="text-gray-600 hover:text-gray-900">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {activeTab === "home" ? (
          <div className="space-y-6">
            <PostComposer />
            <PostsFeed />
          </div>
        ) : (
          <UserProfile />
        )}
      </main>
    </div>
  )
}
