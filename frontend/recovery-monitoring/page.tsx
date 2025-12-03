"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, BarChart3, TrendingUp, Calendar, Award, Loader2, X } from "lucide-react"
import { apiClient, type ProgressSummary } from "@/src/lib/api-client"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"

type ViewMode = "overview" | "statistics" | "growth" | "activities" | "achievements"

export default function RecoveryMonitoringPage() {
  const goBack = () => { try { window.history.back() } catch { window.location.href = "/" } }
  const [isChildMode, setIsChildMode] = useState(true)
  const [starEmotion, setStarEmotion] = useState<{
    emoji: string
    message: string
  } | null>(null)
  const [timeOfDay, setTimeOfDay] = useState<"day" | "night">("day")
  const [manualNightMode, setManualNightMode] = useState<boolean | null>(null)
  const [userId, setUserId] = useState<string>("u1")
  const [rangeDays, setRangeDays] = useState<number>(30)
  const [isLoading, setIsLoading] = useState(true)
  const [progressSummary, setProgressSummary] = useState<ProgressSummary | null>(null)
  const [weeklyStats, setWeeklyStats] = useState({
    socialSkills: 0,
    emotionRecognition: 0,
    communication: 0,
  })
  const [currentView, setCurrentView] = useState<ViewMode>("overview")
  
  // 详细数据状态
  const [statisticsData, setStatisticsData] = useState<any>(null)
  const [growthCurveData, setGrowthCurveData] = useState<any>(null)
  const [activitiesData, setActivitiesData] = useState<any>(null)
  const [achievementsData, setAchievementsData] = useState<any>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  // 简单的多用户候选（实际项目可从后端获取孩子列表）
  const userOptions = [
    { id: "u1", label: "孩子 A（u1）" },
    { id: "u2", label: "孩子 B（u2）" },
    { id: "u3", label: "孩子 C（u3）" },
  ]

  useEffect(() => {
    const savedMode = sessionStorage.getItem("启明星-mode")
    if (savedMode) {
      setIsChildMode(savedMode === "child")
    }
    const savedNightMode = sessionStorage.getItem("启明星-night-mode")
    if (savedNightMode) {
      setManualNightMode(savedNightMode === "night")
    }
    const storedUserId = localStorage.getItem("userId") || sessionStorage.getItem("userId") || "u1"
    setUserId(storedUserId)
  }, [])

  // 加载康复监测数据
  useEffect(() => {
    const loadRecoveryData = async () => {
      if (!userId) return

      setIsLoading(true)
      try {
        // 加载进度摘要
        const summaryResponse = await apiClient.getProgressSummary(userId, 7)
        if (summaryResponse.data) {
          setProgressSummary(summaryResponse.data)
          
          // 计算各项技能百分比
          const total = summaryResponse.data.total_entries || 0
          const completed = summaryResponse.data.completed_entries || 0
          const categories = summaryResponse.data.categories || {}
          
          // 社交技能：social类别的完成率
          const socialTotal = categories.social || 0
          const socialCompleted = Math.round((socialTotal / Math.max(total, 1)) * completed)
          const socialSkills = total > 0 ? Math.round((socialCompleted / Math.max(socialTotal, 1)) * 100) : 0
          
          // 情绪识别：emotion类别的完成率
          const emotionTotal = categories.emotion || 0
          const emotionCompleted = Math.round((emotionTotal / Math.max(total, 1)) * completed)
          const emotionRecognition = total > 0 ? Math.round((emotionCompleted / Math.max(emotionTotal, 1)) * 100) : 0
          
          // 沟通能力：general类别的完成率
          const communicationTotal = categories.general || 0
          const communicationCompleted = Math.round((communicationTotal / Math.max(total, 1)) * completed)
          const communication = total > 0 ? Math.round((communicationCompleted / Math.max(communicationTotal, 1)) * 100) : 0
          
          setWeeklyStats({
            socialSkills: Math.min(socialSkills, 100),
            emotionRecognition: Math.min(emotionRecognition, 100),
            communication: Math.min(communication, 100),
          })
        }
      } catch (error) {
        console.error("加载康复监测数据失败:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadRecoveryData()
  }, [userId])

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
      happy: { emoji: "😊", message: "看到你的进步，星星很开心！" },
      okay: { emoji: "😐", message: "继续努力，每天都有新进步～" },
      sad: { emoji: "😢", message: "星星陪着你一起成长！" },
    }
    setStarEmotion(responses[emotion as keyof typeof responses])
    setTimeout(() => setStarEmotion(null), 4000)
  }

  const handleViewChange = async (view: ViewMode) => {
    setCurrentView(view)
    setDetailLoading(true)
    
    try {
      switch (view) {
        case "statistics":
          const statsResponse = await apiClient.getRecoveryStatistics(userId, rangeDays)
          if (statsResponse.data) {
            setStatisticsData(statsResponse.data)
          }
          break
        case "growth":
          const growthResponse = await apiClient.getGrowthCurve(userId, rangeDays, "completion")
          if (growthResponse.data) {
            setGrowthCurveData(growthResponse.data)
          }
          break
        case "activities":
          const activitiesResponse = await apiClient.getActivityRecords(userId, 50)
          if (activitiesResponse.data) {
            setActivitiesData(activitiesResponse.data)
          }
          break
        case "achievements":
          const achievementsResponse = await apiClient.getAchievements(userId)
          if (achievementsResponse.data) {
            setAchievementsData(achievementsResponse.data)
          }
          break
      }
    } catch (error) {
      console.error(`加载${view}数据失败:`, error)
    } finally {
      setDetailLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className={timeOfDay === "night" ? "fixed inset-0 -z-10 bg-gradient-to-b from-gray-900 to-gray-700" : "fixed inset-0 -z-10 bg-gradient-to-b from-blue-50 to-teal-50"} />

      {/* 顶部导航栏 */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={goBack} className="p-2 rounded hover:bg-gray-100" aria-label="返回">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-lg font-bold text-gray-800">康复监测</h1>
          </div>
          <button onClick={() => handleNightModeToggle(!(timeOfDay === "night"))} className="px-3 py-1.5 rounded bg-gray-100 text-sm">
            {timeOfDay === "night" ? "☀" : "☾"}
          </button>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto pt-16 pb-20">
        <div className="mx-auto max-w-md px-6 py-8">
          <div className="mb-6 flex items-center justify-center gap-2">
            <button onClick={() => handleModeToggle(true)} className={isChildMode ? "px-3 py-1.5 rounded-full bg-blue-500 text-white text-xs" : "px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-xs"}>儿童模式</button>
            <button onClick={() => handleModeToggle(false)} className={!isChildMode ? "px-3 py-1.5 rounded-full bg-blue-500 text-white text-xs" : "px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-xs"}>家长模式</button>
          </div>

          {!isChildMode && (
            <div className="mb-6 rounded-2xl border bg-white/70 p-4 text-sm">
              提示：家长可以在设置页面调整学习时长与难度。
            </div>
          )}

          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl">🌟</span>
            </div>
            <p className="text-balance text-sm text-muted-foreground mt-2">记录成长，见证进步</p>
          </div>

          <div className="mb-10 flex justify-center">
            <div className={timeOfDay === "night" ? "w-24 h-24 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center" : "w-24 h-24 rounded-full bg-white/70 flex items-center justify-center"}>
              <span className="text-3xl">{starEmotion?.emoji || (timeOfDay === "night" ? "🌙" : "😊")}</span>
            </div>
          </div>

          <div className="mb-8 text-center">
            <h2 className="text-lg font-medium text-foreground mb-1">康复进度监测</h2>
            <p className="text-sm text-muted-foreground">跟踪学习进度，记录成长轨迹</p>
          </div>

          {/* 全局筛选：用户 + 时间范围 */}
          <Card className="mb-6 bg-white/80 backdrop-blur-sm border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-gray-800">筛选视角</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {/* 用户选择 */}
                <div className="space-y-1">
                  <span className="text-xs text-gray-600">查看对象</span>
                  <Select
                    value={userId}
                    onValueChange={(value) => {
                      setUserId(value)
                      // 概览和详细视图会通过 effect / handleViewChange 自动刷新
                    }}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="选择孩子" />
                    </SelectTrigger>
                    <SelectContent>
                      {userOptions.map((u) => (
                        <SelectItem key={u.id} value={u.id} className="text-xs">
                          {u.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 时间范围 */}
                <div className="space-y-1">
                  <span className="text-xs text-gray-600">时间范围</span>
                  <Select
                    value={String(rangeDays)}
                    onValueChange={(value) => {
                      const days = parseInt(value, 10) || 30
                      setRangeDays(days)
                      // 若当前在统计/曲线视图，自动刷新一次
                      if (currentView === "statistics" || currentView === "growth") {
                        void handleViewChange(currentView)
                      }
                    }}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="最近 30 天" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7" className="text-xs">
                        最近 7 天
                      </SelectItem>
                      <SelectItem value="30" className="text-xs">
                        最近 30 天
                      </SelectItem>
                      <SelectItem value="60" className="text-xs">
                        最近 60 天
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mb-8">
            <h2 className="mb-4 text-sm font-medium text-muted-foreground">监测功能</h2>
            <div className="grid grid-cols-2 gap-4">
              <button 
                type="button" 
                onClick={() => handleViewChange("statistics")}
                className="flex flex-col items-center justify-center gap-2 rounded-2xl border bg-white/80 p-4 hover:bg-white transition-colors"
              >
                <BarChart3 className="h-6 w-6" />
                <span className="text-sm">进度统计</span>
              </button>
              <button 
                type="button" 
                onClick={() => handleViewChange("growth")}
                className="flex flex-col items-center justify-center gap-2 rounded-2xl border bg-white/80 p-4 hover:bg-white transition-colors"
              >
                <TrendingUp className="h-6 w-6" />
                <span className="text-sm">成长曲线</span>
              </button>
              <button 
                type="button" 
                onClick={() => handleViewChange("activities")}
                className="flex flex-col items-center justify-center gap-2 rounded-2xl border bg-white/80 p-4 hover:bg-white transition-colors"
              >
                <Calendar className="h-6 w-6" />
                <span className="text-sm">活动记录</span>
              </button>
              <button 
                type="button" 
                onClick={() => handleViewChange("achievements")}
                className="flex flex-col items-center justify-center gap-2 rounded-2xl border bg-white/80 p-4 hover:bg-white transition-colors"
              >
                <Award className="h-6 w-6" />
                <span className="text-sm">成就徽章</span>
              </button>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="mb-4 text-sm font-medium text-muted-foreground">本周概览</h2>
            {isLoading ? (
              <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-8 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">社交技能</span>
                  <span className="text-sm font-medium">{weeklyStats.socialSkills}%</span>
                </div>
                <Progress value={weeklyStats.socialSkills} className="h-2" />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">情绪识别</span>
                  <span className="text-sm font-medium">{weeklyStats.emotionRecognition}%</span>
                </div>
                <Progress value={weeklyStats.emotionRecognition} className="h-2" />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">沟通能力</span>
                  <span className="text-sm font-medium">{weeklyStats.communication}%</span>
                </div>
                <Progress value={weeklyStats.communication} className="h-2" />
                
                {progressSummary && progressSummary.total_entries === 0 && (
                  <p className="text-xs text-gray-400 text-center mt-2">暂无数据，开始记录你的进步吧！</p>
                )}
              </div>
            )}
          </div>

          {/* 详细视图 */}
          {currentView !== "overview" && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">
                  {currentView === "statistics" && "进度统计"}
                  {currentView === "growth" && "成长曲线"}
                  {currentView === "activities" && "活动记录"}
                  {currentView === "achievements" && "成就徽章"}
                </h2>
                <button
                  onClick={() => setCurrentView("overview")}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {detailLoading ? (
                <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-8 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                </div>
              ) : (
                <>
                  {currentView === "statistics" && <StatisticsView data={statisticsData} />}
                  {currentView === "growth" && <GrowthCurveView data={growthCurveData} />}
                  {currentView === "activities" && <ActivitiesView data={activitiesData} />}
                  {currentView === "achievements" && <AchievementsView data={achievementsData} />}
                </>
              )}
            </div>
          )}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-gray-200">
        <div className="grid grid-cols-4 h-16">
          <div className="flex flex-col items-center justify-center text-xs text-gray-700">💬<span>成长陪伴</span></div>
          <div className="flex flex-col items-center justify-center text-xs text-gray-700">👥<span>社交解码</span></div>
          <div className="flex flex-col items-center justify-center text-xs text-blue-600">📊<span>康复监测</span></div>
          <div className="flex flex-col items-center justify-center text-xs text-gray-700">👤<span>我的</span></div>
        </div>
      </div>
    </div>
  )
}

// 进度统计视图组件
function StatisticsView({ data }: { data: any }) {
  if (!data) {
    return (
      <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 text-center text-gray-500">
        暂无数据
      </div>
    )
  }

  const categories = data.progress?.categories || {}
  const radarData = Object.entries(categories).map(([key, stats]: [string, any]) => ({
    category: key,
    score: stats.completion_rate || 0,
  }))

  const radarConfig: ChartConfig = {
    score: {
      label: "完成率",
      color: "hsl(221.2 83.2% 53.3%)",
    },
  }

  return (
    <div className="space-y-4">
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-base">总体进度</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">总任务数</span>
            <span className="text-lg font-bold">{data.progress?.total_entries || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">已完成</span>
            <span className="text-lg font-bold text-green-600">{data.progress?.completed_entries || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">完成率</span>
            <span className="text-lg font-bold text-blue-600">{data.progress?.completion_rate?.toFixed(1) || 0}%</span>
          </div>
          <Progress value={data.progress?.completion_rate || 0} className="h-3" />
        </CardContent>
      </Card>

      <Card className="bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-base">分类统计</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.progress?.categories && Object.entries(data.progress.categories).map(([category, stats]: [string, any]) => (
            <div key={category} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium capitalize">{category}</span>
                <span className="text-sm text-gray-600">{stats.completed}/{stats.total}</span>
              </div>
              <Progress value={stats.completion_rate || 0} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-base">情绪统计</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">情绪记录数</span>
            <span className="text-sm font-medium">{data.emotion?.total_records || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">平均情绪</span>
            <Badge variant="secondary">{data.emotion?.average_emotion || "平静"}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">趋势</span>
            <Badge variant={data.emotion?.trend === "improving" ? "default" : "secondary"}>
              {data.emotion?.trend === "improving" ? "上升" : data.emotion?.trend === "declining" ? "下降" : "稳定"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-base">社交统计</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">社交互动数</span>
            <span className="text-sm font-medium">{data.social?.total_interactions || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">最常见场景</span>
            <Badge variant="secondary">{data.social?.most_common_scene || "未知"}</Badge>
          </div>
        </CardContent>
      </Card>

      {radarData.length > 0 && (
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base">能力雷达图</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={radarConfig}
              className="h-56"
            >
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="category" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar
                  name="完成率"
                  dataKey="score"
                  stroke="var(--color-score)"
                  fill="var(--color-score)"
                  fillOpacity={0.4}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
              </RadarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// 成长曲线视图组件
function GrowthCurveView({ data }: { data: any }) {
  if (!data || !data.data || data.data.length === 0) {
    return (
      <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 text-center text-gray-500">
        暂无数据
      </div>
    )
  }

  const chartData = data.data.map((d: any) => ({
    date: d.date,
    completion: d.completion_rate ?? 0,
    positive: (d.positive_ratio ?? 0) * 100,
  }))

  const growthChartConfig: ChartConfig = {
    completion: {
      label: "完成率",
      color: "hsl(221.2 83.2% 53.3%)",
    },
    positive: {
      label: "积极情绪",
      color: "hsl(142.1 70.6% 45.3%)",
    },
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-base">完成率趋势 ({data.period_days}天)</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={growthChartConfig}
          className="mb-4 h-56"
        >
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Line
              type="monotone"
              dataKey="completion"
              stroke="var(--color-completion)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="positive"
              stroke="var(--color-positive)"
              strokeWidth={2}
              strokeDasharray="4 2"
              dot={false}
              activeDot={{ r: 3 }}
            />
          </LineChart>
        </ChartContainer>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">
              {data.data.reduce((sum: number, d: any) => sum + d.tasks_completed, 0)}
            </div>
            <div className="text-xs text-gray-600">完成任务</div>
          </div>
          <div className="p-2 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-600">
              {data.data.reduce((sum: number, d: any) => sum + d.emotion_records, 0)}
            </div>
            <div className="text-xs text-gray-600">情绪记录</div>
          </div>
          <div className="p-2 bg-purple-50 rounded-lg">
            <div className="text-lg font-bold text-purple-600">
              {data.data.reduce((sum: number, d: any) => sum + d.social_interactions, 0)}
            </div>
            <div className="text-xs text-gray-600">社交互动</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// 活动记录视图组件
function ActivitiesView({ data }: { data: any }) {
  if (!data || !data.activities || data.activities.length === 0) {
    return (
      <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 text-center text-gray-500">
        暂无活动记录
      </div>
    )
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "progress": return "📝"
      case "emotion": return "😊"
      case "social": return "👥"
      default: return "📌"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "progress": return "bg-blue-100 text-blue-700"
      case "emotion": return "bg-pink-100 text-pink-700"
      case "social": return "bg-green-100 text-green-700"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ""
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="space-y-3">
      {data.activities.map((activity: any, index: number) => (
        <Card key={index} className="bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">{getTypeIcon(activity.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{activity.title}</span>
                  <Badge className={getTypeColor(activity.type)} variant="secondary">
                    {activity.category}
                  </Badge>
                </div>
                {activity.type === "progress" && activity.mood && (
                  <div className="text-xs text-gray-500 mb-1">心情: {activity.mood}</div>
                )}
                {activity.type === "emotion" && (
                  <div className="text-xs text-gray-500 mb-1">
                    情绪: {activity.emotion} | 强度: {(activity.intensity * 100).toFixed(0)}%
                  </div>
                )}
                {activity.type === "social" && activity.scene && (
                  <div className="text-xs text-gray-500 mb-1">场景: {activity.scene}</div>
                )}
                <div className="text-xs text-gray-400">{formatDate(activity.timestamp)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// 成就徽章视图组件
function AchievementsView({ data }: { data: any }) {
  if (!data || !data.achievements || data.achievements.length === 0) {
    return (
      <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 text-center text-gray-500">
        暂无成就数据
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="text-center space-y-2">
            <div className="text-3xl font-bold text-blue-600">
              {data.unlocked_count}/{data.total_achievements}
            </div>
            <div className="text-sm text-gray-600">已解锁成就</div>
            <Progress value={data.progress || 0} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        {data.achievements.map((achievement: any) => (
          <Card
            key={achievement.id}
            className={`bg-white/80 backdrop-blur-sm transition-all ${
              achievement.unlocked ? "border-2 border-yellow-400" : "opacity-60"
            }`}
          >
            <CardContent className="p-4 text-center">
              <div className="text-4xl mb-2">{achievement.icon}</div>
              <div className="font-medium text-sm mb-1">{achievement.title}</div>
              <div className="text-xs text-gray-500 mb-2">{achievement.description}</div>
              {achievement.unlocked ? (
                <Badge className="bg-yellow-100 text-yellow-700">已获得</Badge>
              ) : (
                <Badge variant="secondary">未解锁</Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
