"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AnimatedBackground } from "@/components/animated-background"
import { StarCharacter } from "@/components/star-character"
import { ArrowLeft } from "lucide-react"
import { apiClient } from "@/src/lib/api-client"

const emotions = [
  { id: "happy", emoji: "😊", label: "开心", color: "#FFE59D" },
  { id: "sad", emoji: "😢", label: "难过", color: "#B4D4FF" },
  { id: "angry", emoji: "😠", label: "生气", color: "#FFB4C4" },
  { id: "calm", emoji: "😌", label: "平静", color: "#C5E8B7" },
]

// 情绪ID到后端情绪名称的映射
const emotionIdToName: Record<string, string> = {
  happy: "开心",
  sad: "难过",
  angry: "生气",
  calm: "平静",
}

export default function EmotionDiaryPage() {
  const router = useRouter()
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null)
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showRetry, setShowRetry] = useState(false)
  const [daysRecorded, setDaysRecorded] = useState(0)
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([])
  const [userId, setUserId] = useState<string>("u1") // 默认用户ID

  // 获取用户ID
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId") || sessionStorage.getItem("userId") || "u1"
    setUserId(storedUserId)
  }, [])

  // 加载已记录的天数
  useEffect(() => {
    const loadDiaryCount = async () => {
      try {
        const response = await apiClient.getEmotionDiary(userId, undefined, 200)
        if (response.data) {
          const entries = response.data.entries || response.data.records || []
          // 统计不同日期的记录数
          const uniqueDates = new Set(
            entries.map((entry: any) => {
              const date = new Date(entry.timestamp || entry.created_at)
              return date.toDateString()
            })
          )
          setDaysRecorded(uniqueDates.size)
          sessionStorage.setItem("emotionDiaryDays", uniqueDates.size.toString())
        }
      } catch (error) {
        console.error("加载情绪日记失败:", error)
        // 如果API失败，尝试从sessionStorage读取
        const stored = sessionStorage.getItem("emotionDiaryDays")
        if (stored) {
          setDaysRecorded(Number.parseInt(stored, 10))
        }
      }
    }
    loadDiaryCount()
  }, [userId])

  const handleEmotionSelect = (emotionId: string) => {
    setSelectedEmotion(emotionId)
    setShowSuccess(false)
    setShowRetry(false)
  }

  const handleSubmit = async () => {
    if (!selectedEmotion || !description.trim()) {
      return
    }

    setIsSubmitting(true)
    setShowRetry(false)

    try {
      // 调用后端API创建情绪日记
      const emotionName = emotionIdToName[selectedEmotion] || selectedEmotion
      const response = await apiClient.createEmotionDiary(
        userId,
        description.trim(),
        emotionName,
        [emotionName], // tags
        `用户选择了${emotionName}情绪`
      )

      if (response.error) {
        console.error("创建情绪日记失败:", response.error)
        setIsSubmitting(false)
        setShowRetry(true)
        return
      }

      // 成功提交
      setShowSuccess(true)

      // Trigger rainbow particles
      const newParticles = Array.from({ length: 12 }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 100,
        y: Math.random() * 100,
      }))
      setParticles(newParticles)

      // 重新加载日记数量
      const diaryResponse = await apiClient.getEmotionDiary(userId, undefined, 200)
      if (diaryResponse.data) {
        const entries = diaryResponse.data.entries || diaryResponse.data.records || []
        const uniqueDates = new Set(
          entries.map((entry: any) => {
            const date = new Date(entry.timestamp || entry.created_at)
            return date.toDateString()
          })
        )
        const newDays = uniqueDates.size
        setDaysRecorded(newDays)
        sessionStorage.setItem("emotionDiaryDays", newDays.toString())
      } else {
        // 如果重新加载失败，简单增加计数
        const newDays = daysRecorded + 1
        setDaysRecorded(newDays)
        sessionStorage.setItem("emotionDiaryDays", newDays.toString())
      }

      setIsSubmitting(false)

      // Clear particles after animation
      setTimeout(() => setParticles([]), 1500)

      // Reset form after 2s
      setTimeout(() => {
        setSelectedEmotion(null)
        setDescription("")
        setShowSuccess(false)
      }, 2000)
    } catch (error) {
      console.error("提交情绪日记时发生错误:", error)
      setIsSubmitting(false)
      setShowRetry(true)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden pb-24">
      <AnimatedBackground />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-6">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm transition-all active:scale-95"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>

        {/* Progress indicator */}
        <div className="flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 backdrop-blur-sm">
          <span className="text-sm font-medium text-foreground">已记录</span>
          <span className="text-lg font-bold text-[#FFB86C]">{daysRecorded}</span>
          <span className="text-sm font-medium text-foreground">天</span>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center px-6 pt-4">
        {/* Title */}
        <h1 className="mb-2 text-2xl font-bold text-foreground">情绪日记</h1>
        <p className="mb-8 text-sm text-muted-foreground">记录你今天的情绪</p>

        {/* Star character */}
        <div className="mb-8">
          <StarCharacter
            size={isSubmitting ? 100 : 120}
            isChildMode={true}
            emotion={selectedEmotion ? "happy" : "neutral"}
          />
        </div>

        {/* Emotion selection */}
        <div className="mb-6 w-full max-w-md">
          <p className="mb-4 text-center text-sm font-medium text-foreground">今天的心情是？</p>
          <div className="grid grid-cols-2 gap-3">
            {emotions.map((emotion) => (
              <button
                key={emotion.id}
                onClick={() => handleEmotionSelect(emotion.id)}
                className={`relative flex flex-col items-center gap-2 rounded-[20px] border-2 bg-gradient-to-br from-[#FFF8F3] to-[#FFF4E8] p-6 transition-all active:scale-[0.96] ${
                  selectedEmotion === emotion.id ? "border-[#FFD8C1] shadow-lg" : "border-[#FFD8C1]/50"
                }`}
                style={{
                  boxShadow:
                    selectedEmotion === emotion.id
                      ? `0 0 20px ${emotion.color}40, inset 0 2px 8px rgba(255,255,255,0.5)`
                      : "inset 0 2px 8px rgba(255,255,255,0.5)",
                }}
              >
                <span className="text-4xl">{emotion.emoji}</span>
                <span className="text-sm font-medium text-foreground">{emotion.label}</span>

                {/* Rainbow particles on selection */}
                {selectedEmotion === emotion.id && particles.length > 0 && (
                  <div className="pointer-events-none absolute inset-0">
                    {particles.slice(0, 3).map((particle) => (
                      <div
                        key={particle.id}
                        className="absolute h-2 w-2 animate-ping rounded-full"
                        style={{
                          left: `${particle.x}%`,
                          top: `${particle.y}%`,
                          background: `linear-gradient(135deg, #FFB86C, #FF6B9D, #C792EA, #82AAFF)`,
                          animationDuration: "1s",
                        }}
                      />
                    ))}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Description text box */}
        <div className="mb-6 w-full max-w-md">
          <p className="mb-3 text-center text-sm font-medium text-foreground">说说你的感受吧～</p>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="今天发生了什么让你有这样的感受呢？"
            className="h-32 w-full resize-none rounded-[16px] border-2 border-[#FFD8C1]/50 bg-gradient-to-br from-[#FFF8F3] to-[#FFF4E8] p-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-[#FFD8C1] focus:outline-none"
            style={{
              boxShadow: "inset 0 2px 8px rgba(255,255,255,0.5)",
            }}
          />
        </div>

        {/* Submit button */}
        <div className="w-full max-w-md px-6 pb-10">
          <button
            onClick={handleSubmit}
            disabled={!selectedEmotion || !description.trim() || isSubmitting}
            className="relative w-full overflow-hidden rounded-[20px] border-2 border-[#FFD8C1] bg-gradient-to-br from-[#FFF8F3] to-[#FFF4E8] px-8 py-4 font-medium text-foreground shadow-lg transition-all active:scale-[0.96] disabled:opacity-50 disabled:active:scale-100"
            style={{
              boxShadow: "inset 0 2px 8px rgba(255,255,255,0.5), 0 4px 12px rgba(255,216,193,0.3)",
            }}
          >
            {isSubmitting ? "提交中..." : "提交"}

            {/* Rainbow particles on press */}
            {particles.length > 0 && (
              <div className="pointer-events-none absolute inset-0">
                {particles.map((particle) => (
                  <div
                    key={particle.id}
                    className="absolute h-1.5 w-1.5 animate-ping rounded-full"
                    style={{
                      left: `${particle.x}%`,
                      top: `${particle.y}%`,
                      background: `linear-gradient(135deg, #FFB86C, #FF6B9D, #C792EA, #82AAFF)`,
                      animationDuration: "1s",
                    }}
                  />
                ))}
              </div>
            )}
          </button>
        </div>

        {/* Success message */}
        {showSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <div className="animate-in fade-in zoom-in -translate-y-6 duration-500 flex flex-col items-center gap-4 rounded-[24px] border-2 border-[#FFD8C1] bg-gradient-to-br from-[#FFF8F3] to-[#FFF4E8] p-8 shadow-2xl">
              <div className="text-6xl">🎉</div>
              <p className="text-xl font-bold text-foreground">太棒了！</p>
              <p className="text-sm text-muted-foreground">情绪记录成功</p>

              {/* Rainbow particles */}
              <div className="pointer-events-none absolute inset-0">
                {particles.map((particle) => (
                  <div
                    key={particle.id}
                    className="absolute h-2 w-2 animate-ping rounded-full"
                    style={{
                      left: `${particle.x}%`,
                      top: `${particle.y}%`,
                      background: `linear-gradient(135deg, #FFB86C, #FF6B9D, #C792EA, #82AAFF)`,
                      animationDuration: "1s",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Retry message */}
        {showRetry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <div className="animate-in fade-in zoom-in -translate-y-6 duration-300 flex flex-col items-center gap-4 rounded-[24px] border-2 border-[#FFE59D] bg-[#FFFBF0] p-8 shadow-2xl">
              <div className="text-5xl">⭐</div>
              <p className="text-center text-base font-medium text-foreground">再试一次，星星陪你！</p>
              <button
                onClick={() => setShowRetry(false)}
                className="rounded-full bg-gradient-to-br from-[#FFF8F3] to-[#FFF4E8] px-6 py-2 text-sm font-medium text-foreground transition-all active:scale-95"
              >
                好的
              </button>
            </div>
          </div>
        )}

        {/* Submitting toast */}
        {isSubmitting && (
          <div className="fixed top-20 left-1/2 z-50 -translate-x-1/2 animate-in fade-in zoom-in duration-300">
            <div className="rounded-full bg-white/90 px-6 py-3 shadow-lg backdrop-blur-sm">
              <p className="text-sm font-medium text-foreground">提交中...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
