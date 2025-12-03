"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react"

type Role = "parent" | "child" | "therapist" | "admin"

export interface AuthUser {
  id: string
  email: string
  role: Role
  nickname?: string | null
}

interface AuthContextValue {
  user: AuthUser | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  fetchMe: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"
const ACCESS_TOKEN_KEY = "access_token"

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      ...(options.headers || {}),
    },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Request failed: ${res.status}`)
  }
  return res.json() as Promise<T>
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 初始化：从本地恢复 token 并尝试获取用户信息
  useEffect(() => {
    const storedToken = typeof window !== "undefined" ? localStorage.getItem(ACCESS_TOKEN_KEY) : null
    if (storedToken) {
      setAccessToken(storedToken)
      void fetchMeInternal(storedToken)
    } else {
      setIsLoading(false)
    }
  }, [])

  const fetchMeInternal = async (token: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!res.ok) {
        throw new Error("failed")
      }
      const data = (await res.json()) as AuthUser
      setUser(data)
    } catch {
      // token 失效，清理
      localStorage.removeItem(ACCESS_TOKEN_KEY)
      setAccessToken(null)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const body = new URLSearchParams({
        username: email,
        password,
      })
      // OAuth2PasswordRequestForm 风格：/auth/login
      const data = await request<{ access_token: string; token_type: string }>("/auth/login", {
        method: "POST",
        body,
      })
      const token = data.access_token
      setAccessToken(token)
      if (typeof window !== "undefined") {
        localStorage.setItem(ACCESS_TOKEN_KEY, token)
      }
      await fetchMeInternal(token)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMe = async () => {
    if (!accessToken) return
    setIsLoading(true)
    try {
      await fetchMeInternal(accessToken)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(ACCESS_TOKEN_KEY)
    }
    setAccessToken(null)
    setUser(null)
  }

  const value: AuthContextValue = {
    user,
    accessToken,
    isAuthenticated: !!user && !!accessToken,
    isLoading,
    login,
    logout,
    fetchMe,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return ctx
}



