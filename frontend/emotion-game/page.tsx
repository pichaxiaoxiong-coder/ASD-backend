"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { apiClient } from "@/src/lib/api-client"
import { AnimatedBackground } from "@/components/animated-background"
import { StarCharacter } from "@/components/star-character"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

const EMOTIONS = [
  { emoji: "😊", name: "happy" },
  { emoji: "😮", name: "surprised" },
  { emoji: "😢", name: "sad" },
]

function EmotionGamePageContent() {
  const router = useRouter()
  const [timeOfDay, setTimeOfDay] = useState<"day" | "night">("day")
  const [currentEmotion, setCurrentEmotion] = useState(EMOTIONS[0])
  const [showPrompt, setShowPrompt] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const [showResult, setShowResult] = useState<"success" | "retry" | null>(null)
  const [progress, setProgress] = useState([false, false, false])
  const [currentLevel, setCurrentLevel] = useState(0)
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([])
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const updateTimeOfDay = () => {
      const hour = new Date().getHours()
      setTimeOfDay(hour >= 6 && hour < 20 ? "day" : "night")
    }
    updateTimeOfDay()
    const interval = setInterval(updateTimeOfDay, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch (err) {
        console.error("[v0] Camera access error:", err)
      }
    }
    initCamera()

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPrompt(true)
    }, 2000)
    return () => clearTimeout(timer)
  }, [currentEmotion])

  const handleCapture = async () => {
    if (isCapturing) return

    setIsCapturing(true)
    setShowResult(null)

    try {
      // 抓取当前帧
      const video = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas) throw new Error('camera not ready')

      const width = video.videoWidth || 480
      const height = video.videoHeight || 360
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('canvas ctx')
      ctx.drawImage(video, 0, 0, width, height)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85)

      // 先做人脸检测
      const faceRes = await apiClient.analyzeFace(dataUrl)
      if (faceRes.error || !faceRes.data?.has_face) {
        setShowResult("retry")
        setIsCapturing(false)
        return
      }

      // 再做微表情识别
      const microRes = await apiClient.analyzeMicroExpression(dataUrl, currentEmotion.name)
      if (microRes.error) {
        setShowResult("retry")
        setIsCapturing(false)
        return
      }

      const matched = microRes.data?.matched_expected
      if (matched) {
        setShowResult("success")
        const newProgress = [...progress]
        newProgress[currentLevel] = true
        setProgress(newProgress)

        setTimeout(() => {
          if (currentLevel < 2) {
            setCurrentLevel(currentLevel + 1)
            setCurrentEmotion(EMOTIONS[currentLevel + 1])
            setShowPrompt(false)
            setShowResult(null)
          }
          setIsCapturing(false)
        }, 1200)
      } else {
        setShowResult("retry")
        setIsCapturing(false)
      }
    } catch (e) {
      setShowResult("retry")
      setIsCapturing(false)
    }
  }

  const handleRetry = () => {
    setShowResult(null)
  }

  const handleButtonPress = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const newParticles = Array.from({ length: 6 }, (_, i) => ({
      id: Date.now() + i,
      x,
      y,
    }))
    setParticles((prev) => [...prev, ...newParticles])
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id)))
    }, 400)
  }

  return (
    <div className="relative min-h-screen overflow-hidden pb-24">
      <AnimatedBackground timeOfDay={timeOfDay} />

      <div className="relative z-10 flex min-h-screen flex-col">
        <div className="p-4">
          <button
            onClick={() => router.push("/")}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm transition-all hover:bg-white/95 active:scale-95"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
        </div>

        <div className="flex justify-center gap-2 py-4">
          {progress.map((completed, idx) => (
            <div
              key={idx}
              className={`h-3 w-3 rounded-full transition-all duration-300 ${
                completed ? "bg-[oklch(0.75_0.12_240)] scale-110" : "bg-white/40"
              }`}
            />
          ))}
        </div>

        <div className="flex flex-col items-center gap-4 px-4 pt-8">
          <div className="relative">
            {!showPrompt && (
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-6xl">{currentEmotion.emoji}</div>
              </div>
            )}
            <StarCharacter isChildMode={true} timeOfDay={timeOfDay} emotion={null} />
            {showPrompt && (
              <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 whitespace-nowrap animate-bounce">
                <div className="rounded-2xl bg-white/95 px-4 py-2 text-sm font-medium text-foreground shadow-lg border-2 border-[oklch(0.95_0.02_85)]">
                  轮到宝贝啦～
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
          <div className="relative w-full max-w-sm">
            <div className="overflow-hidden rounded-2xl border-2 border-[oklch(0.75_0.12_240)]/30 bg-white/80 backdrop-blur-sm shadow-lg">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-60 w-full object-cover"
                style={{ transform: "scaleX(-1)" }}
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {isCapturing && !showResult && (
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 animate-in fade-in duration-300">
                <div className="rounded-xl bg-foreground/90 px-6 py-3 text-sm font-medium text-background backdrop-blur-sm">
                  识别中...
                </div>
              </div>
            )}

            {showResult === "success" && (
              <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center -translate-y-6 animate-in fade-in zoom-in duration-500">
                <div className="relative">
                  <div className="rounded-2xl bg-white/95 px-8 py-6 text-center shadow-xl border-2 border-[oklch(0.75_0.12_240)]">
                    <div className="text-4xl mb-2">🎉</div>
                    <div className="text-lg font-semibold text-foreground">太棒了！</div>
                  </div>
                  <div className="absolute inset-0 pointer-events-none">
                    {[...Array(12)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-2 h-2 rounded-full animate-[particle_0.8s_ease-out]"
                        style={{
                          left: "50%",
                          top: "50%",
                          backgroundColor: ["#FF6B6B", "#FFE66D", "#4ECDC4", "#95E1D3", "#F38181", "#AA96DA"][i % 6],
                          transform: `translate(-50%, -50%) rotate(${i * 30}deg)`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {showResult === "retry" && (
              <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center -translate-y-6 animate-in fade-in zoom-in duration-300">
                <div className="rounded-2xl bg-[oklch(0.88_0.08_85)]/95 px-6 py-4 text-center shadow-xl border-2 border-[oklch(0.88_0.08_85)]">
                  <div className="text-sm font-medium text-foreground mb-3">再试一次，星星陪你！</div>
                  <button
                    onClick={handleRetry}
                    className="rounded-xl bg-white px-6 py-2 text-sm font-medium text-foreground transition-all active:scale-95"
                  >
                    重试
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 pb-10">
          <button
            onClick={handleCapture}
            onMouseDown={handleButtonPress}
            disabled={isCapturing || !showPrompt}
            className="relative w-full overflow-hidden rounded-[20px] bg-gradient-to-br from-[#FFF8F3] to-[#FFF4E8] border-2 border-[#FFD8C1] px-8 py-4 text-lg font-semibold text-[#4A7BA7] shadow-[inset_0_0_8px_rgba(0,0,0,0.04)] transition-all active:scale-96 disabled:opacity-50"
            style={{ opacity: 0.96 }}
          >
            {particles.map((particle, idx) => (
              <span
                key={particle.id}
                className="absolute w-1.5 h-1.5 rounded-full animate-[particle_0.4s_ease-out] pointer-events-none"
                style={{
                  left: particle.x,
                  top: particle.y,
                  backgroundColor: ["#FF6B6B", "#FFE66D", "#4ECDC4", "#95E1D3", "#F38181", "#AA96DA"][idx % 6],
                  transform: `translate(-50%, -50%) rotate(${idx * 60}deg)`,
                }}
              />
            ))}
            拍照
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes particle {
          0% {
            transform: translate(-50%, -50%) translateY(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) translateY(-32px) scale(0);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}

export default function EmotionGamePage() {
  return <EmotionGamePageContent />
}
