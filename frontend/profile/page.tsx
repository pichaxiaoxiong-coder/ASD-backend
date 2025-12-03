"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { AnimatedBackground } from "@/components/animated-background"
import { StarCharacter } from "@/components/star-character"
import { FunctionButton } from "@/components/function-button"
import { BottomNav } from "@/components/bottom-nav"
import { ModeToggle } from "@/components/mode-toggle"
import { ParentTipCard } from "@/components/parent-tip-card"
import { StarLogo } from "@/components/star-logo"
import { NightModeToggle } from "@/components/night-mode-toggle"
import { ArrowLeft, User, Settings, Bell, Shield, HelpCircle, Info, LogOut, Edit, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function ProfilePage() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [isChildMode, setIsChildMode] = useState(true)
  const [starEmotion, setStarEmotion] = useState<{
    emoji: string
    message: string
  } | null>(null)
  const [timeOfDay, setTimeOfDay] = useState<"day" | "night">("day")
  const [manualNightMode, setManualNightMode] = useState<boolean | null>(null)

  useEffect(() => {
    const savedMode = sessionStorage.getItem("启明星-mode")
    if (savedMode) {
      setIsChildMode(savedMode === "child")
    }
    const savedNightMode = sessionStorage.getItem("启明星-night-mode")
    if (savedNightMode) {
      setManualNightMode(savedNightMode === "night")
    }
  }, [])

  const handleModeToggle = (isChild: boolean) => {
    setIsChildMode(isChild)
    sessionStorage.setItem("启明星-mode", isChild ? "child" : "parent")
  }

  const handleNightModeToggle = (isNight: boolean) => {
    setManualNightMode(isNight)
    sessionStorage.setItem("启明星-night-mode", isNight ? "night" : "day")
  }

  useEffect(() => {
    const checkTime = () => {
      const hour = new Date().getHours()
      if (manualNightMode === null) {
        setTimeOfDay(hour >= 20 || hour < 6 ? "night" : "day")
      } else {
        setTimeOfDay(manualNightMode ? "night" : "day")
      }
    }
    checkTime()
    const interval = setInterval(checkTime, 60000)
    return () => clearInterval(interval)
  }, [manualNightMode])

  const handleEmotionSelect = (emotion: string) => {
    const responses = {
      happy: { emoji: "😊", message: "很高兴认识你！" },
      okay: { emoji: "😐", message: "有什么需要帮助的吗？" },
      sad: { emoji: "😢", message: "星星会一直陪着你！" },
    }
    setStarEmotion(responses[emotion as keyof typeof responses])
    setTimeout(() => setStarEmotion(null), 4000)
  }

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AnimatedBackground timeOfDay={timeOfDay} />

      {/* 顶部导航栏 */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.back()}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 text-center">
            <h1 className="text-lg font-bold text-gray-800">我的</h1>
          </div>
          <NightModeToggle isNightMode={timeOfDay === "night"} onToggle={handleNightModeToggle} />
        </div>
      </div>

      <main className="flex-1 overflow-y-auto pt-16 pb-20">
        <div className="mx-auto max-w-md px-6 py-8">
          <div className="mb-6 flex items-center justify-center">
            <ModeToggle isChildMode={isChildMode} onToggle={handleModeToggle} />
          </div>

          {!isChildMode && (
            <div className="mb-6">
              <ParentTipCard />
            </div>
          )}

          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-3">
              <StarLogo />
            </div>
            <p className="text-balance text-sm text-muted-foreground mt-2">个人中心，管理你的信息</p>
          </div>

          <div className="mb-10 flex justify-center">
            <StarCharacter isChildMode={isChildMode} emotion={starEmotion} timeOfDay={timeOfDay} />
          </div>

          {/* 用户信息卡片 */}
          <div className="mb-8 bg-white/50 backdrop-blur-sm rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <Avatar className="w-16 h-16">
                  <AvatarImage src="/placeholder-user.jpg" alt="用户头像" />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg">
                    {user?.name?.[0] || user?.phone?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full p-0"
                  onClick={() => {/* 头像编辑功能 */}}
                >
                  <Camera className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800">
                  {user?.name || "用户"}
                </h3>
                <p className="text-sm text-gray-600">{user?.phone}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => router.push("/profile/edit")}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  编辑资料
                </Button>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="mb-4 text-sm font-medium text-muted-foreground">账户设置</h2>
            <div className="grid grid-cols-2 gap-4">
              <FunctionButton
                icon={<User className="h-6 w-6" />}
                label="个人资料"
                color="blue"
                onClick={() => router.push("/profile/edit")}
              />
              <FunctionButton
                icon={<Settings className="h-6 w-6" />}
                label="应用设置"
                color="green"
                onClick={() => router.push("/profile/settings")}
              />
              <FunctionButton
                icon={<Bell className="h-6 w-6" />}
                label="通知设置"
                color="purple"
                onClick={() => router.push("/profile/notifications")}
              />
              <FunctionButton
                icon={<Shield className="h-6 w-6" />}
                label="隐私安全"
                color="orange"
                onClick={() => router.push("/profile/privacy")}
              />
            </div>
          </div>

          <div className="mb-8">
            <h2 className="mb-4 text-sm font-medium text-muted-foreground">帮助与支持</h2>
            <div className="grid grid-cols-2 gap-4">
              <FunctionButton
                icon={<HelpCircle className="h-6 w-6" />}
                label="帮助中心"
                color="yellow"
                onClick={() => router.push("/profile/help")}
              />
              <FunctionButton
                icon={<Info className="h-6 w-6" />}
                label="关于应用"
                color="pink"
                onClick={() => router.push("/profile/about")}
              />
            </div>
          </div>

          {/* 退出登录按钮 */}
          <div className="pt-4">
            <Button 
              variant="outline" 
              className="w-full bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              退出登录
            </Button>
          </div>
        </div>
      </main>

      <BottomNav isNightMode={timeOfDay === "night"} />
    </div>
  )
}