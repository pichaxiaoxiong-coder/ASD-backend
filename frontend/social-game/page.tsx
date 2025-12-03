"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AnimatedBackground } from "@/components/animated-background"
import { StarCharacter } from "@/components/star-character"
import { FunctionButton } from "@/components/function-button"
import { BottomNav } from "@/components/bottom-nav"
import { ModeToggle } from "@/components/mode-toggle"
import { ParentTipCard } from "@/components/parent-tip-card"
import { StarLogo } from "@/components/star-logo"
import { NightModeToggle } from "@/components/night-mode-toggle"
import { ArrowLeft, Smile, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SocialGamePage() {
  const router = useRouter()
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
      happy: { emoji: "😊", message: "社交练习让星星很开心！" },
      okay: { emoji: "😐", message: "慢慢来，社交技能需要练习～" },
      sad: { emoji: "😢", message: "星星陪着你一起学习社交技巧！" },
    }
    setStarEmotion(responses[emotion as keyof typeof responses])
    setTimeout(() => setStarEmotion(null), 4000)
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
            <h1 className="text-lg font-bold text-gray-800">社交解码</h1>
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
            <p className="text-balance text-sm text-muted-foreground mt-2">学会社交，建立友谊</p>
          </div>

          <div className="mb-10 flex justify-center">
            <StarCharacter isChildMode={isChildMode} emotion={starEmotion} timeOfDay={timeOfDay} />
          </div>

          <div className="mb-8 text-center">
            <h2 className="text-lg font-medium text-foreground mb-1">社交技能训练</h2>
            <p className="text-sm text-muted-foreground">通过游戏学习社交技巧</p>
          </div>

          <div className="mb-8">
            <h2 className="mb-4 text-sm font-medium text-muted-foreground">社交练习</h2>
            <div className="grid grid-cols-2 gap-4">
              <FunctionButton
                icon={<Smile className="h-6 w-6" />}
                label="情绪识别"
                color="pink"
                onClick={() => router.push("/emotion-game")}
              />
              <FunctionButton
                icon={<Activity className="h-6 w-6" />}
                label="社交游戏"
                color="yellow"
                onClick={() => router.push("/social-game/activities")}
              />
            </div>
          </div>
        </div>
      </main>

      <BottomNav isNightMode={timeOfDay === "night"} />
    </div>
  )
}