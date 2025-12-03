"use client"

import React, { useState } from "react"
import { Eye, EyeOff, ChevronDown } from "lucide-react"

interface LoginFormProps {
  onSwitchToRegister?: () => void
}

export function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async () => {
    try {
      console.log("🎯 handleLogin 函数被调用了！")
      console.log("🔍 1. 开始登录处理")
      setIsLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 1500))
      console.log("🔍 2. 登录验证通过，准备跳转")
      setIsLoading(false)
      window.location.href = "http://localhost:5173"
      console.log("🔍 3. 跳转指令已执行")
    } catch (error) {
      console.log("🔍 登录失败:", error)
    }
  }

  return (
    <div className="login-form-container" style={{ display: "flex", flexDirection: "column" }}>
      {/* Phone number field */}
      <div className="form-field" style={{ marginBottom: "16px" }}>
        <label
          className="block text-[16px] font-medium leading-[1.5]"
          style={{ color: "rgb(75,85,99)", marginBottom: "8px" }}
        >
          手机号码
        </label>
        <div className="relative">
          <div
            className="absolute left-0 top-0 bottom-0 w-[60px] flex items-center justify-center"
            style={{ borderRight: "1px solid rgb(229,229,229)" }}
          >
            <span className="text-[14px]" style={{ color: "rgb(75,85,99)" }}>
              +86
            </span>
            <ChevronDown className="w-4 h-4 ml-1" style={{ color: "rgb(156,163,175)" }} />
          </div>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="请输入 11 位手机号码"
            maxLength={11}
            className="w-full rounded-lg transition-all duration-200 ease-in-out focus:outline-none"
            style={{
              height: "48px",
              paddingTop: "14px",
              paddingBottom: "14px",
              paddingLeft: "72px",
              paddingRight: "16px",
              backgroundColor: "rgb(255,255,255)",
              border: "1px solid rgb(229,229,229)",
              color: "rgb(30,30,30)",
              fontSize: "16px",
              lineHeight: "1.5",
              boxShadow: "0 2px 2px rgba(220,220,220,0.2)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.border = "1.5px solid rgb(59,130,246)"
              e.currentTarget.style.backgroundColor = "rgb(250,250,255)"
            }}
            onBlur={(e) => {
              e.currentTarget.style.border = "1px solid rgb(229,229,229)"
              e.currentTarget.style.backgroundColor = "rgb(255,255,255)"
            }}
          />
        </div>
      </div>

      {/* Password field */}
      <div className="form-field" style={{ marginBottom: "8px" }}>
        <label
          className="block text-[16px] font-medium leading-[1.5]"
          style={{ color: "rgb(75,85,99)", marginBottom: "8px" }}
        >
          密码
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请输入 6-18 位密码（字母 + 数字组合）"
            maxLength={18}
            className="w-full rounded-lg transition-all duration-200 ease-in-out focus:outline-none"
            style={{
              height: "48px",
              paddingTop: "14px",
              paddingBottom: "14px",
              paddingLeft: "16px",
              paddingRight: "48px",
              backgroundColor: "rgb(255,255,255)",
              border: "1px solid rgb(229,229,229)",
              color: "rgb(30,30,30)",
              fontSize: "16px",
              lineHeight: "1.5",
              boxShadow: "0 2px 2px rgba(220,220,220,0.2)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.border = "1.5px solid rgb(59,130,246)"
              e.currentTarget.style.backgroundColor = "rgb(250,250,255)"
            }}
            onBlur={(e) => {
              e.currentTarget.style.border = "1px solid rgb(229,229,229)"
              e.currentTarget.style.backgroundColor = "rgb(255,255,255)"
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 transition-transform duration-100"
            style={{ color: "rgb(156,163,175)" }}
          >
            {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Forgot password */}
      <div className="text-left forgot-password" style={{ marginBottom: "12px" }}>
        <a
          href="#"
          className="text-[14px] underline transition-colors duration-200"
          style={{ color: "rgb(59,130,246)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "rgb(49,110,226)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgb(59,130,246)")}
        >
          忘记密码
        </a>
      </div>

      <button
        type="button"
        onClick={handleLogin}
        disabled={isLoading}
        className="w-full rounded-lg text-[15px] font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center login-button"
        style={{
          height: "48px",
          backgroundColor: "rgb(59,130,246)",
          color: "white",
          borderRadius: "8px",
          boxShadow: "0 2px 2px rgba(220,220,220,0.2)",
          marginBottom: "20px",
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = "scale(0.98)"
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = "scale(1)"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)"
        }}
      >
        {isLoading ? (
          <div className="flex items-center gap-1">
            <span className="w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: "0s" }} />
            <span className="w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
            <span className="w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: "0.4s" }} />
          </div>
        ) : (
          "立即登录"
        )}
      </button>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "12px" }}>
        <button
          className="w-full flex items-center px-3 rounded-lg transition-all duration-200"
          style={{
            height: "48px",
            backgroundColor: "rgb(243,244,246)",
            boxShadow: "0 2px 2px rgba(220,220,220,0.2)",
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <div className="w-7 h-7 flex items-center justify-center">
            <svg className="w-7 h-7" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="14" fill="#07C160" />
              <path
                d="M10.5 11.5C10.5 10.5 11 9.5 12.5 9.5C13.5 9.5 14 10 14 11C14 12 13 12.5 12 13L11 13.5V15M11 17.5H11.01"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M16 11.5C16 10.5 16.5 9.5 18 9.5C19 9.5 19.5 10 19.5 11C19.5 12 18.5 12.5 17.5 13L16.5 13.5V15M16.5 17.5H16.51"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span className="flex-1 text-[16px] text-center mr-7" style={{ color: "rgb(75,85,99)" }}>
            微信登录
          </span>
        </button>

        <button
          className="w-full flex items-center px-3 rounded-lg transition-all duration-200"
          style={{
            height: "48px",
            backgroundColor: "rgb(243,244,246)",
            boxShadow: "0 2px 2px rgba(220,220,220,0.2)",
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <div className="w-7 h-7 flex items-center justify-center">
            <svg className="w-7 h-7" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="14" fill="#12B7F5" />
              <path
                d="M18 10C19.5 10 20 11 20 12C20 13.5 18.5 14 17 14.5C16 15 15 15 14 16M8 14C8 12.5 9 12 10.5 12C11.5 12 12 12.5 12 13.5C12 15 10 15.5 9 16.5"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span className="flex-1 text-[16px] text-center mr-7" style={{ color: "rgb(75,85,99)" }}>
            QQ 登录
          </span>
        </button>
      </div>

      {/* Register prompt */}
      {onSwitchToRegister && (
        <div className="text-center" style={{ marginTop: "12px" }}>
          <span className="text-[14px]" style={{ color: "#999999" }}>
            还没有账户？
          </span>{" "}
          <button
            onClick={onSwitchToRegister}
            className="text-[14px] underline transition-colors duration-200 cursor-pointer"
            style={{
              color: "#ff0000",
              background: "none",
              border: "none",
              padding: "0",
              minHeight: "auto",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#ff0000"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#ff0000"
            }}
          >
            立即注册
          </button>
        </div>
      )}
    </div>
  )
}
