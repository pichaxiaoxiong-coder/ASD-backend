"use client"

import * as React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, ChevronDown } from "lucide-react"

type TabType = "parent" | "child"

interface RegistrationFormProps {
  onSwitchToLogin?: () => void
}

export function RegistrationForm({ onSwitchToLogin }: RegistrationFormProps) {
  const [activeTab, setActiveTab] = useState<TabType>("parent")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Parent info
  const [parentName, setParentName] = useState("")
  const [phone, setPhone] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [countdown, setCountdown] = useState(0)
  const [relationship, setRelationship] = useState("")
  const [parentPassword, setParentPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  // Child info
  const [childName, setChildName] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [diagnosis, setDiagnosis] = useState("")

  // Agreement
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [showError, setShowError] = useState(false)

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return 0
    if (password.length <= 3) return 1
    if (password.length <= 5) return 2
    return 3
  }

  const passwordStrength = getPasswordStrength(parentPassword)

  const handleGetCode = () => {
    if (phone.length === 11) {
      setCountdown(60)
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
  }

  // Calculate button background color based on countdown
  const getCountdownButtonColor = () => {
    if (countdown === 0) return "rgb(59,130,246)"
    const progress = (60 - countdown) / 60
    const warmBlue = { r: 59, g: 130, b: 246 }
    const lightPurple = { r: 199, g: 146, b: 234 }
    const r = Math.round(warmBlue.r + (lightPurple.r - warmBlue.r) * progress)
    const g = Math.round(warmBlue.g + (lightPurple.g - warmBlue.g) * progress)
    const b = Math.round(warmBlue.b + (lightPurple.b - warmBlue.b) * progress)
    return `rgb(${r},${g},${b})`
  }

  const handleRegister = async () => {
    if (!agreedToTerms) {
      setShowError(true)
      setTimeout(() => setShowError(false), 2000)
      return
    }

    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsLoading(false)
  }

  const isFormValid =
    parentName &&
    phone.length === 11 &&
    verificationCode &&
    relationship &&
    parentPassword.length >= 6 &&
    childName &&
    birthDate &&
    diagnosis &&
    agreedToTerms

  const isParentValid =
    parentName &&
    phone.length === 11 &&
    verificationCode &&
    relationship &&
    parentPassword.length >= 6 &&
    agreedToTerms

  return (
    <div className="registration-form-container" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="tab-navigation" style={{ borderBottom: "1px solid rgb(229,229,229)" }}>
        <div className="flex">
          <button
            onClick={() => setActiveTab("parent")}
            className="flex-1 text-[18px] relative transition-colors duration-200"
            style={{
              height: "48px",
              color: activeTab === "parent" ? "rgb(59,130,246)" : "rgb(75,85,99)",
            }}
          >
            家长信息
            {activeTab === "parent" && (
              <div
                className="absolute bottom-0 left-0 right-0 transition-all duration-300"
                style={{ height: "2px", backgroundColor: "rgb(59,130,246)" }}
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab("child")}
            className="flex-1 text-[18px] relative transition-colors duration-200"
            style={{
              height: "48px",
              color: activeTab === "child" ? "rgb(59,130,246)" : "rgb(75,85,99)",
            }}
          >
            儿童基本信息
            {activeTab === "child" && (
              <div
                className="absolute bottom-0 left-0 right-0 transition-all duration-300"
                style={{ height: "2px", backgroundColor: "rgb(59,130,246)" }}
              />
            )}
          </button>
        </div>
      </div>

      {activeTab === "parent" && (
        <div
          className="animate-in fade-in tab-content"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            animationDuration: "0.3s",
            animationTimingFunction: "ease-out",
          }}
        >
          {/* Parent name */}
          <div>
            <label
              className="block text-[16px] font-medium leading-[1.5]"
              style={{ color: "rgb(75,85,99)", marginBottom: "8px" }}
            >
              家长姓名
            </label>
            <input
              type="text"
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              placeholder="请输入您的姓名"
              className="w-full rounded-lg transition-all duration-200 ease-in-out focus:outline-none"
              style={{
                height: "48px",
                paddingTop: "14px",
                paddingBottom: "14px",
                paddingLeft: "16px",
                paddingRight: "16px",
                backgroundColor: "rgb(255,255,255)",
                border: "1px solid rgb(229,229,229)",
                color: "rgb(30,30,30)",
                fontSize: "16px",
                lineHeight: "1.5",
                boxShadow: "0 2px 2px rgba(220,220,220,0.2)",
              }}
              onFocus={(e) => {
                e.target.style.border = "1.5px solid rgb(59,130,246)"
                e.target.style.backgroundColor = "rgb(250,250,255)"
              }}
              onBlur={(e) => {
                e.target.style.border = "1px solid rgb(229,229,229)"
                e.target.style.backgroundColor = "rgb(255,255,255)"
              }}
            />
          </div>

          {/* Phone and verification code */}
          <div>
            <label
              className="block text-[16px] font-medium leading-[1.5]"
              style={{ color: "rgb(75,85,99)", marginBottom: "8px" }}
            >
              手机号码
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
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
                    e.target.style.border = "1.5px solid rgb(59,130,246)"
                    e.target.style.backgroundColor = "rgb(250,250,255)"
                  }}
                  onBlur={(e) => {
                    e.target.style.border = "1px solid rgb(229,229,229)"
                    e.target.style.backgroundColor = "rgb(255,255,255)"
                  }}
                />
              </div>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="验证码"
                maxLength={6}
                className="w-[120px] rounded-lg transition-all duration-200 ease-in-out focus:outline-none"
                style={{
                  height: "48px",
                  paddingTop: "14px",
                  paddingBottom: "14px",
                  paddingLeft: "16px",
                  paddingRight: "16px",
                  backgroundColor: "rgb(255,255,255)",
                  border: "1px solid rgb(229,229,229)",
                  color: "rgb(30,30,30)",
                  fontSize: "16px",
                  lineHeight: "1.5",
                  boxShadow: "0 2px 2px rgba(220,220,220,0.2)",
                }}
                onFocus={(e) => {
                  e.target.style.border = "1.5px solid rgb(59,130,246)"
                  e.target.style.backgroundColor = "rgb(250,250,255)"
                }}
                onBlur={(e) => {
                  e.target.style.border = "1px solid rgb(229,229,229)"
                  e.target.style.backgroundColor = "rgb(255,255,255)"
                }}
              />
            </div>
            <button
              onClick={handleGetCode}
              disabled={phone.length !== 11 || countdown > 0}
              className="mt-2 rounded-lg text-[15px] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                width: "120px",
                height: "48px",
                backgroundColor:
                  phone.length === 11 && countdown === 0
                    ? "rgb(59,130,246)"
                    : countdown > 0
                      ? getCountdownButtonColor()
                      : "rgb(229,229,229)",
                color: phone.length === 11 || countdown > 0 ? "white" : "rgb(156,163,175)",
                boxShadow: "0 2px 2px rgba(220,220,220,0.2)",
              }}
              onMouseDown={(e) => {
                if (phone.length === 11 && countdown === 0) {
                  e.currentTarget.style.transform = "scale(0.98)"
                }
              }}
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              {countdown > 0 ? `${countdown}s` : "获取验证码"}
            </button>
          </div>

          <div>
            <label
              className="block text-[16px] font-medium leading-[1.5]"
              style={{ color: "rgb(75,85,99)", marginBottom: "8px" }}
            >
              亲属关系
            </label>
            <div className="relative">
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="w-full rounded-lg appearance-none transition-all duration-300 ease-out focus:outline-none"
                style={{
                  height: "48px",
                  paddingTop: "14px",
                  paddingBottom: "14px",
                  paddingLeft: "16px",
                  paddingRight: "40px",
                  backgroundColor: "rgb(255,255,255)",
                  border: "1px solid rgb(229,229,229)",
                  color: relationship ? "rgb(30,30,30)" : "rgb(156,163,175)",
                  fontSize: "16px",
                  lineHeight: "1.5",
                  boxShadow: "0 2px 2px rgba(220,220,220,0.2)",
                }}
                onFocus={(e) => {
                  e.target.style.border = "1.5px solid rgb(59,130,246)"
                  e.target.style.backgroundColor = "rgb(250,250,255)"
                }}
                onBlur={(e) => {
                  e.target.style.border = "1px solid rgb(229,229,229)"
                  e.target.style.backgroundColor = "rgb(255,255,255)"
                }}
              >
                <option value="">请选择</option>
                <option value="father">父亲</option>
                <option value="mother">母亲</option>
                <option value="guardian">监护人</option>
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                style={{ color: "rgb(156,163,175)" }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              className="block text-[16px] font-medium leading-[1.5]"
              style={{ color: "rgb(75,85,99)", marginBottom: "8px" }}
            >
              密码
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={parentPassword}
                onChange={(e) => setParentPassword(e.target.value)}
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
                  e.target.style.border = "1.5px solid rgb(59,130,246)"
                  e.target.style.backgroundColor = "rgb(250,250,255)"
                }}
                onBlur={(e) => {
                  e.target.style.border = "1px solid rgb(229,229,229)"
                  e.target.style.backgroundColor = "rgb(255,255,255)"
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

            {/* Password strength indicator */}
            {parentPassword && (
              <div className="flex gap-2 mt-2">
                <div
                  className="h-1.5 flex-1 rounded-full transition-colors duration-200"
                  style={{
                    backgroundColor: passwordStrength >= 1 ? "rgb(248,113,113)" : "rgb(229,229,229)",
                  }}
                />
                <div
                  className="h-1.5 flex-1 rounded-full transition-colors duration-200"
                  style={{
                    backgroundColor: passwordStrength >= 2 ? "rgb(252,211,77)" : "rgb(229,229,229)",
                  }}
                />
                <div
                  className="h-1.5 flex-1 rounded-full transition-colors duration-200"
                  style={{
                    backgroundColor: passwordStrength >= 3 ? "rgb(74,222,128)" : "rgb(229,229,229)",
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Child info tab */}
      {activeTab === "child" && (
        <div
          className="animate-in fade-in tab-content"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            animationDuration: "0.3s",
            animationTimingFunction: "ease-out",
          }}
        >
          {/* Child name */}
          <div>
            <label
              className="block text-[16px] font-medium leading-[1.5]"
              style={{ color: "rgb(75,85,99)", marginBottom: "8px" }}
            >
              儿童姓名
            </label>
            <input
              type="text"
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              placeholder="请输入孩子的姓名"
              className="w-full rounded-lg transition-all duration-200 ease-in-out focus:outline-none"
              style={{
                height: "48px",
                paddingTop: "14px",
                paddingBottom: "14px",
                paddingLeft: "16px",
                paddingRight: "16px",
                backgroundColor: "rgb(255,255,255)",
                border: "1px solid rgb(229,229,229)",
                color: "rgb(30,30,30)",
                fontSize: "16px",
                lineHeight: "1.5",
                boxShadow: "0 2px 2px rgba(220,220,220,0.2)",
              }}
              onFocus={(e) => {
                e.target.style.border = "1.5px solid rgb(59,130,246)"
                e.target.style.backgroundColor = "rgb(250,250,255)"
              }}
              onBlur={(e) => {
                e.target.style.border = "1px solid rgb(229,229,229)"
                e.target.style.backgroundColor = "rgb(255,255,255)"
              }}
            />
          </div>

          {/* Birth date */}
          <div>
            <label
              className="block text-[16px] font-medium leading-[1.5]"
              style={{ color: "rgb(75,85,99)", marginBottom: "8px" }}
            >
              儿童出生日期
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-[200px] rounded-lg transition-all duration-200 ease-in-out focus:outline-none"
              style={{
                height: "48px",
                paddingTop: "14px",
                paddingBottom: "14px",
                paddingLeft: "16px",
                paddingRight: "16px",
                backgroundColor: "rgb(255,255,255)",
                border: "1px solid rgb(229,229,229)",
                color: "rgb(30,30,30)",
                fontSize: "16px",
                lineHeight: "1.5",
                boxShadow: "0 2px 2px rgba(220,220,220,0.2)",
              }}
              onFocus={(e) => {
                e.target.style.border = "1.5px solid rgb(59,130,246)"
                e.target.style.backgroundColor = "rgb(250,250,255)"
              }}
              onBlur={(e) => {
                e.target.style.border = "1px solid rgb(229,229,229)"
                e.target.style.backgroundColor = "rgb(255,255,255)"
              }}
            />
          </div>

          {/* ASD diagnosis */}
          <div>
            <label
              className="block text-[16px] font-medium leading-[1.5]"
              style={{ color: "rgb(75,85,99)", marginBottom: "8px" }}
            >
              自闭症诊断情况
            </label>
            <div className="relative">
              <select
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                className="w-full rounded-lg appearance-none transition-all duration-300 ease-out focus:outline-none"
                style={{
                  height: "48px",
                  paddingTop: "14px",
                  paddingBottom: "14px",
                  paddingLeft: "16px",
                  paddingRight: "40px",
                  backgroundColor: "rgb(255,255,255)",
                  border: "1px solid rgb(229,229,229)",
                  color: diagnosis ? "rgb(30,30,30)" : "rgb(156,163,175)",
                  fontSize: "16px",
                  lineHeight: "1.5",
                  boxShadow: "0 2px 2px rgba(220,220,220,0.2)",
                }}
                onFocus={(e) => {
                  e.target.style.border = "1.5px solid rgb(59,130,246)"
                  e.target.style.backgroundColor = "rgb(250,250,255)"
                }}
                onBlur={(e) => {
                  e.target.style.border = "1px solid rgb(229,229,229)"
                  e.target.style.backgroundColor = "rgb(255,255,255)"
                }}
              >
                <option value="">请选择</option>
                <option value="confirmed">已确诊</option>
                <option value="unconfirmed">未确诊</option>
                <option value="evaluating">评估中</option>
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                style={{ color: "rgb(156,163,175)" }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex items-start gap-2">
        <button
          onClick={() => setAgreedToTerms(!agreedToTerms)}
          className="flex-shrink-0 mt-0.5 flex items-center justify-center rounded transition-all duration-100"
          style={{
            width: "18px",
            height: "18px",
            borderRadius: "3px",
            border: showError && !agreedToTerms ? "2px solid rgb(248,113,113)" : "1px solid rgb(229,229,229)",
            backgroundColor: agreedToTerms ? "rgba(59,130,246,0.9)" : "rgb(255,255,255)",
          }}
        >
          {agreedToTerms && (
            <svg className="w-3 h-3" viewBox="0 0 12 10" fill="none">
              <path
                d="M1 5L4.5 8.5L11 1.5"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
        <p className="text-[14px] leading-relaxed" style={{ color: "rgb(75,85,99)" }}>
          我已阅读并同意{" "}
          <a
            href="#"
            className="underline transition-colors duration-200"
            style={{ color: "rgb(59,130,246)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "rgb(49,110,226)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgb(59,130,246)")}
          >
            《用户服务协议》
          </a>{" "}
          和{" "}
          <a
            href="#"
            className="underline transition-colors duration-200"
            style={{ color: "rgb(59,130,246)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "rgb(49,110,226)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgb(59,130,246)")}
          >
            《隐私政策》
          </a>
        </p>
      </div>

      {/* Error message */}
      {showError && !agreedToTerms && (
        <p
          className="text-[12px] animate-in fade-in duration-200"
          style={{ color: "rgb(248,113,113)", marginTop: "-12px" }}
        >
          请阅读并同意用户协议与隐私政策
        </p>
      )}

      {/* Register button */}
      <button
        onClick={async () => {
          if (activeTab === "parent") {
            if (!isParentValid) {
              setShowError(!agreedToTerms)
              return
            }
            setIsLoading(true)
            await new Promise((resolve) => setTimeout(resolve, 800))
            setIsLoading(false)
            try {
              router.push("/child-basic-info")
            } catch {}
            return
          }
          await handleRegister()
        }}
        disabled={(activeTab === "parent" ? !isParentValid : !isFormValid) || isLoading}
        className="w-full rounded-lg text-[15px] font-medium transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center"
        style={{
          height: "48px",
          backgroundColor: (activeTab === "parent" ? isParentValid : isFormValid) ? "rgb(59,130,246)" : "rgb(229,229,229)",
          color: (activeTab === "parent" ? isParentValid : isFormValid) ? "white" : "rgb(156,163,175)",
          borderRadius: "8px",
          boxShadow: "0 2px 2px rgba(220,220,220,0.2)",
        }}
        onMouseDown={(e) => {
          const ok = activeTab === "parent" ? isParentValid : isFormValid
          if (ok) {
            e.currentTarget.style.transform = "scale(0.98)"
          }
        }}
        onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        {isLoading ? (
          <div className="flex items-center gap-1">
            <span className="w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: "0s" }} />
            <span className="w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
            <span className="w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: "0.4s" }} />
          </div>
        ) : (
          activeTab === "parent" ? "保存信息" : "立即注册"
        )}
      </button>

      {/* Switch to login link */}
      {onSwitchToLogin && (
        <div className="text-center switch-to-login">
          <span className="text-[14px]" style={{ color: "#666666" }}>
            已有账号？
          </span>{" "}
          <button
            onClick={onSwitchToLogin}
            className="text-[14px] underline transition-colors duration-200 cursor-pointer"
            style={{
              color: "#FF0000",
              background: "none",
              border: "none",
              padding: "0",
              minHeight: "auto",
              textDecoration: "underline",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#CC0000"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#FF0000"
            }}
          >
            去登录
          </button>
        </div>
      )}
    </div>
  )
}
