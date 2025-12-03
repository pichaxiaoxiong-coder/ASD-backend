"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { AnimatedBackground } from "@/components/animated-background"
import { BottomNav } from "@/components/bottom-nav"
import { StarCharacter } from "@/components/star-character"
import { EmotionCheckIn } from "@/components/emotion-check-in"
import { DailyTask } from "@/components/daily-task"
import { ParentTipCard } from "@/components/parent-tip-card"
import { ModeToggle } from "@/components/mode-toggle"
import { NightModeToggle } from "@/components/night-mode-toggle"
import { StarLogo } from "@/components/star-logo"
import { FunctionButton } from "@/components/function-button"
import { Loader2, User, LogOut, MessageCircle, Smile, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, logout, isLoading } = useAuth()
  const [isChildMode, setIsChildMode] = useState(true)
  const [starEmotion, setStarEmotion] = useState<{
    emoji: string
    message: string
  } | null>(null)
  const [timeOfDay, setTimeOfDay] = useState<"day" | "night">("day")
  const [manualNightMode, setManualNightMode] = useState<boolean | null>(null)

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push("/")
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    const savedMode = sessionStorage.getItem("启明星-mode")
    if (savedMode) {
      setIsChildMode(savedMode === "child")
    }
    const savedNightMode = sessionStorage.getItem("启明星-night-mode")
    if (savedMode) {
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
      happy: { emoji: "😊", message: "太好啦！把快乐传给星星吧～" },
      okay: { emoji: "😐", message: "星星陪你一起平平常常也很好～" },
      sad: { emoji: "😢", message: "星星抱抱你，我们深呼吸一口气～" },
    }
    setStarEmotion(responses[emotion as keyof typeof responses])
    setTimeout(() => setStarEmotion(null), 4000)
  }

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-100">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AnimatedBackground timeOfDay={timeOfDay} />

      {/* 顶部用户信息栏 */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">
                {user?.name || user?.phone || "用户"}
              </p>
              <p className="text-xs text-gray-500">欢迎回来</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NightModeToggle isNightMode={timeOfDay === "night"} onToggle={handleNightModeToggle} />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-800"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
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
            <p className="text-balance text-sm text-muted-foreground mt-2">每一颗星星都有自己的光芒</p>
          </div>

          <div className="mb-10 flex justify-center">
            <StarCharacter isChildMode={isChildMode} emotion={starEmotion} timeOfDay={timeOfDay} />
          </div>

          <div className="mb-8 text-center">
            <h2 className="text-lg font-medium text-foreground mb-1">你好！我是启明星小助手</h2>
            <p className="text-sm text-muted-foreground">今天也要开心成长哦～</p>
          </div>

          <div className="mb-8">
            <EmotionCheckIn onEmotionSelect={handleEmotionSelect} timeOfDay={timeOfDay} />
          </div>

          <div className="mb-8">
            <h2 className="mb-4 text-sm font-medium text-muted-foreground">成长陪伴</h2>
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 mb-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">与启明星对话</h3>
                <p className="text-sm text-gray-600">AI助手陪伴你成长，解答问题，分享快乐</p>
              </div>
              <div className="flex gap-3">
                <Button 
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  onClick={() => router.push("/companion")}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  开始对话
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push("/companion")}
                >
                  <Activity className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="mb-4 text-sm font-medium text-muted-foreground">其他功能</h2>
            <div className="grid grid-cols-2 gap-4">
              <FunctionButton
                icon={<MessageCircle className="h-6 w-6" />}
                label="社交解码"
                color="yellow"
                onClick={() => router.push("/social-game")}
              />
              <FunctionButton
                icon={<Smile className="h-6 w-6" />}
                label="情绪识别"
                color="pink"
                onClick={() => router.push("/emotion-game")}
              />
              <FunctionButton
                icon={<Activity className="h-6 w-6" />}
                label="康复监测"
                color="green"
                onClick={() => router.push("/recovery-monitoring")}
              />
              <FunctionButton
                icon={<User className="h-6 w-6" />}
                label="我的"
                color="blue"
                onClick={() => router.push("/profile")}
              />
            </div>
          </div>

          <div className="mb-6">
            <DailyTask timeOfDay={timeOfDay} />
          </div>
        </div>
      </main>

      <BottomNav isNightMode={timeOfDay === "night"} />
    </div>
  )
}
