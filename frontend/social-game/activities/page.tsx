"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AnimatedBackground } from "@/components/animated-background"
import { StarCharacter } from "@/components/star-character"
import { BottomNav } from "@/components/bottom-nav"
import { ModeToggle } from "@/components/mode-toggle"
import { ParentTipCard } from "@/components/parent-tip-card"
import { StarLogo } from "@/components/star-logo"
import { NightModeToggle } from "@/components/night-mode-toggle"
import { ArrowLeft, RotateCcw, CheckCircle, XCircle, Star, Trophy, Filter, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { socialScenarios, getScenariosByAge, getScenariosByDifficulty, type SocialScenario } from "@/lib/social-scenarios"

export default function SocialActivitiesPage() {
  const router = useRouter()
  const [isChildMode, setIsChildMode] = useState(true)
  const [currentScenario, setCurrentScenario] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [completed, setCompleted] = useState<number[]>([])
  const [timeOfDay, setTimeOfDay] = useState<"day" | "night">("day")
  const [manualNightMode, setManualNightMode] = useState<boolean | null>(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [selectedAge, setSelectedAge] = useState<string>("3-6")
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("简单")
  const [showSettings, setShowSettings] = useState(false)
  const [gameScenarios, setGameScenarios] = useState<SocialScenario[]>(() => {
    // 初始加载时使用默认筛选
    return getScenariosByAge(selectedAge)
  })

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

  const handleAnswerSelect = (answerId: string) => {
    if (showResult) return
    setSelectedAnswer(answerId)
  }

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return
    
    const current = gameScenarios[currentScenario]
    if (!current) return
    
    const selectedOption = current.options.find(opt => opt.id === selectedAnswer)
    
    if (selectedOption?.correct) {
      setScore(score + 1)
    }
    
    setCompleted([...completed, currentScenario])
    setShowResult(true)
  }

  const handleNextScenario = () => {
    if (currentScenario < gameScenarios.length - 1) {
      setCurrentScenario(currentScenario + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    } else {
      // 游戏结束
      setGameStarted(false)
    }
  }

  const handleRestart = () => {
    setCurrentScenario(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setScore(0)
    setCompleted([])
    setGameStarted(false)
  }

  const startGame = () => {
    // 根据设置筛选场景
    let filteredScenarios = socialScenarios
    if (selectedAge && selectedAge !== "全部") {
      filteredScenarios = getScenariosByAge(selectedAge)
    }
    if (selectedDifficulty && selectedDifficulty !== "全部") {
      filteredScenarios = filteredScenarios.filter(s => s.difficulty === selectedDifficulty)
    }
    
    // 如果没有筛选到任何场景，使用全部场景
    if (filteredScenarios.length === 0) {
      filteredScenarios = socialScenarios
    }
    
    setGameScenarios(filteredScenarios)
    setGameStarted(true)
    setCurrentScenario(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setScore(0)
    setCompleted([])
  }

  const current = gameScenarios[currentScenario]
  const progress = gameScenarios.length > 0 ? ((currentScenario + 1) / gameScenarios.length) * 100 : 0
  const isLastScenario = currentScenario === gameScenarios.length - 1 && gameScenarios.length > 0

  // 游戏结束界面
  if (!gameStarted && gameScenarios.length > 0 && completed.length === gameScenarios.length) {
    const finalScore = score
    const totalQuestions = gameScenarios.length
    const percentage = Math.round((finalScore / totalQuestions) * 100)
    
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
              <h1 className="text-lg font-bold text-gray-800">游戏结果</h1>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRestart}
              className="p-2"
            >
              <RotateCcw className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto pt-16 pb-20">
          <div className="mx-auto max-w-md px-6 py-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">
                {percentage >= 80 ? "🎉" : percentage >= 60 ? "😊" : "💪"}
              </div>
              <h2 className="text-2xl font-bold mb-2">游戏完成！</h2>
              <p className="text-muted-foreground">
                {percentage >= 80 ? "太棒了！你做得很好！" : 
                 percentage >= 60 ? "不错！继续努力！" : 
                 "加油！多练习会更好！"}
              </p>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-center">成绩统计</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{finalScore}</div>
                    <div className="text-sm text-blue-600">正确答案</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{percentage}%</div>
                    <div className="text-sm text-green-600">正确率</div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-2">总体表现</div>
                  <div className="text-lg font-semibold">
                    {percentage >= 80 ? "优秀" : percentage >= 60 ? "良好" : "需要练习"}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button 
                onClick={handleRestart} 
                className="w-full"
                size="lg"
              >
                再玩一次
              </Button>
              <Button 
                onClick={() => router.back()} 
                variant="outline"
                className="w-full"
              >
                返回主页
              </Button>
            </div>
          </div>
        </main>

        <BottomNav isNightMode={timeOfDay === "night"} />
      </div>
    )
  }

  if (!gameStarted) {
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
              <h1 className="text-lg font-bold text-gray-800">社交游戏</h1>
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
              <p className="text-balance text-sm text-muted-foreground mt-2">通过场景练习学习社交技巧</p>
            </div>

            <div className="mb-10 flex justify-center">
              <StarCharacter isChildMode={isChildMode} emotion={null} timeOfDay={timeOfDay} />
            </div>

            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-center flex-1">社交场景练习</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSettings(!showSettings)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  通过不同的社交场景，学习如何在不同情况下做出正确的社交选择。
                </p>
                
                {showSettings && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className="text-sm font-medium mb-2 block">年龄范围</label>
                      <div className="grid grid-cols-3 gap-2">
                        {["3-6", "7-10", "11-14"].map((age) => (
                          <Button
                            key={age}
                            variant={selectedAge === age ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedAge(age)}
                          >
                            {age}岁
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">难度等级</label>
                      <div className="grid grid-cols-3 gap-2">
                        {["简单", "中等", "困难"].map((difficulty) => (
                          <Button
                            key={difficulty}
                            variant={selectedDifficulty === difficulty ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedDifficulty(difficulty)}
                          >
                            {difficulty}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>{gameScenarios.length}个场景</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-orange-500" />
                    <span>获得奖励</span>
                  </div>
                </div>

                <Button 
                  onClick={startGame} 
                  className="w-full"
                  size="lg"
                >
                  开始游戏
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>

        <BottomNav isNightMode={timeOfDay === "night"} />
      </div>
    )
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
            <h1 className="text-lg font-bold text-gray-800">社交游戏</h1>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRestart}
            className="p-2"
          >
            <RotateCcw className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto pt-16 pb-20">
        <div className="mx-auto max-w-md px-6 py-8">
          {/* 进度条 */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">进度</span>
              <span className="text-sm text-muted-foreground">{currentScenario + 1}/{gameScenarios.length}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* 加载提示 */}
          {!current && (
            <Card className="mb-6">
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  加载中...
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* 场景卡片 */}
          {current && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary">{current.category}</Badge>
                <Badge variant={current.difficulty === "简单" ? "default" : "destructive"}>
                  {current.difficulty}
                </Badge>
              </div>
              <CardTitle className="text-lg">{current.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">{current.image}</div>
                <p className="text-sm text-muted-foreground">{current.description}</p>
              </div>

              {/* 选项 */}
              <div className="space-y-3">
                {current.options.map((option) => {
                  const isSelected = selectedAnswer === option.id
                  const isCorrect = option.correct
                  const showCorrect = showResult && isCorrect
                  const showIncorrect = showResult && isSelected && !isCorrect

                  return (
                    <Button
                      key={option.id}
                      variant={isSelected ? "default" : "outline"}
                      className={`w-full justify-start h-auto p-4 text-left ${
                        showCorrect ? "bg-green-100 border-green-500 text-green-700" : ""
                      } ${
                        showIncorrect ? "bg-red-100 border-red-500 text-red-700" : ""
                      }`}
                      onClick={() => handleAnswerSelect(option.id)}
                      disabled={showResult}
                    >
                      <div className="flex items-center gap-3 w-full">
                        {showResult && (
                          <div className="flex-shrink-0">
                            {isCorrect ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : isSelected && !isCorrect ? (
                              <XCircle className="h-5 w-5 text-red-600" />
                            ) : null}
                          </div>
                        )}
                        <span className="flex-1">{option.text}</span>
                      </div>
                    </Button>
                  )
                })}
              </div>

              {/* 解释 */}
              {showResult && selectedAnswer && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    {current.options.find(opt => opt.id === selectedAnswer)?.explanation}
                  </p>
                </div>
              )}

              {/* 操作按钮 */}
              <div className="mt-6 flex gap-3">
                {!showResult ? (
                  <Button 
                    onClick={handleSubmitAnswer}
                    disabled={!selectedAnswer}
                    className="flex-1"
                  >
                    提交答案
                  </Button>
                ) : (
                  <Button 
                    onClick={handleNextScenario}
                    className="flex-1"
                  >
                    {isLastScenario ? "查看结果" : "下一题"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
          )}

          {/* 分数显示 */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              当前得分: <span className="font-semibold text-foreground">{score}</span> / {currentScenario + 1}
            </p>
          </div>
        </div>
      </main>

      <BottomNav isNightMode={timeOfDay === "night"} />
    </div>
  )
}
