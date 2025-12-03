"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import SimpleLogin from "@/components/SimpleLogin"
import { useAuth } from "@/contexts/AuthContext"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading, login, register } = useAuth()
  const [isLogin, setIsLogin] = useState(true)

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, isLoading, router])

  const handleLogin = (token, userData) => {
    login(token, userData)
  }

  const handleRegister = (token, userData) => {
    register(token, userData)
  }

  const switchToLogin = () => {
    setIsLogin(true)
  }

  const switchToRegister = () => {
    setIsLogin(false)
  }

  // 显示加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-100">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">正在加载...</p>
        </div>
      </div>
    )
  }

  // 如果已登录，显示跳转提示
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">欢迎使用启明星 ASD 应用</h1>
          <p className="text-gray-600">正在跳转到主界面...</p>
        </div>
      </div>
    )
  }

  return (
    <SimpleLogin 
      onLogin={handleLogin}
      onRegister={handleRegister}
      isLogin={isLogin}
      onSwitchToLogin={switchToLogin}
      onSwitchToRegister={switchToRegister}
    />
  )
}
