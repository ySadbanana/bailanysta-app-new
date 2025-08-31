"use client"

import { useState } from "react"
import { AuthProvider, useAuth } from "@/components/auth-context"
import { LoginForm } from "@/components/login-form"
import { SignupForm } from "@/components/signup-form"
import { BailanystaApp } from "@/components/bailanysta-app"
import { Button } from "@/components/ui/button"

function AppContent() {
  const { user, logout } = useAuth()
  const [showSignup, setShowSignup] = useState(false)

  if (user) {
    return <BailanystaApp />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Bailanysta</h1>
          <p className="text-gray-600">Байланыста бол!</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {showSignup ? (
            <>
              <SignupForm />
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <Button
                    variant="link"
                    className="p-0 h-auto font-medium text-blue-600"
                    onClick={() => setShowSignup(false)}
                  >
                    Sign in
                  </Button>
                </p>
              </div>
            </>
          ) : (
            <>
              <LoginForm />
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Button
                    variant="link"
                    className="p-0 h-auto font-medium text-blue-600"
                    onClick={() => setShowSignup(true)}
                  >
                    Sign up
                  </Button>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
