"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import * as api from "@/lib/api"

interface User {
  id: number
  username: string
  email?: string
  displayName?: string | null
  avatar?: string
  bio?: string | null
  joinedAt?: string
}

interface AuthContextType {
  user: User | null
  login: (emailOrUsername: string, password: string) => Promise<boolean>
  signup: (email: string, password: string, username: string, displayName: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => false,
  signup: async () => false,
  logout: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // try restore from token
    api.getMe().then(
      (me) => setUser({
        id: me.id,
        username: me.username,
        displayName: me.display_name,
        bio: me.bio ?? null,
      } as User)
    ).catch(() => {
      // not logged in
      setUser(null)
    })
  }, [])

  const login = async (emailOrUsername: string, password: string) => {
    try {
      const token = await api.login(emailOrUsername, password)
      api.saveToken(token.access_token)
      const me = await api.getMe()
      setUser({
        id: me.id,
        username: me.username,
        displayName: me.display_name,
        bio: me.bio ?? null,
      } as User)
      return true
    } catch (e) {
      console.error(e)
      return false
    }
  }

  const signup = async (email: string, password: string, username: string, displayName: string) => {
    try {
      await api.signup({ email, password, username, display_name: displayName })
      // auto-login user after signup
      const token = await api.login(username, password)
      api.saveToken(token.access_token)
      const me = await api.getMe()
      setUser({
        id: me.id,
        username: me.username,
        displayName: me.display_name,
        bio: me.bio ?? null,
      } as User)
      return true
    } catch (e) {
      console.error(e)
      return false
    }
  }

  const logout = () => {
    api.clearToken()
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, signup, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
