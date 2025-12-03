"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Progress } from "../components/ui/progress"
import { Badge } from "../components/ui/badge"
import { Calendar, Target, TrendingUp, Award, Loader2 } from "lucide-react"
import { apiClient, type ProgressEntry, type ProgressSummary } from "../src/lib/api-client"

export default function ProgressPage() {
  const [userId, setUserId] = useState<string>("u1")
  const [isLoading, setIsLoading] = useState(true)
  const [progressEntries, setProgressEntries] = useState<ProgressEntry[]>([])
  const [progressSummary, setProgressSummary] = useState<ProgressSummary | null>(null)
  const [weeklyProgress, setWeeklyProgress] = useState([
    { day: "周一", completed: 0, total: 0, percentage: 0 },
    { day: "周二", completed: 0, total: 0, percentage: 0 },
    { day: "周三", completed: 0, total: 0, percentage: 0 },
    { day: "周四", completed: 0, total: 0, percentage: 0 },
    { day: "周五", completed: 0, total: 0, percentage: 0 },
    { day: "周六", completed: 0, total: 0, percentage: 0 },
    { day: "周日", completed: 0, total: 0, percentage: 0 },
  ])

  const achievements = [
    { title: "连续学习", description: "连续学习7天", icon: Award, color: "bg-yellow-500" },
    { title: "社交进步", description: "完成10次社交练习", icon: Target, color: "bg-green-500" },
    { title: "情绪管理", description: "情绪识别准确率90%", icon: TrendingUp, color: "bg-blue-500" },
  ]

  // 获取用户ID
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId") || sessionStorage.getItem("userId") || "u1"
    setUserId(storedUserId)
  }, [])

  // 加载进度数据
  useEffect(() => {
    const loadProgressData = async () => {
      if (!userId) return

      setIsLoading(true)
      try {
        // 并行加载进度列表和摘要
        const [logsResponse, summaryResponse] = await Promise.all([
          apiClient.getProgressLogs(userId, 100),
          apiClient.getProgressSummary(userId, 30),
        ])

        if (logsResponse.data) {
          setProgressEntries(logsResponse.data)
        }

        if (summaryResponse.data) {
          setProgressSummary(summaryResponse.data)
        }

        // 计算周进度
        if (logsResponse.data) {
          const now = new Date()
          const weekStart = new Date(now)
          weekStart.setDate(now.getDate() - now.getDay() + 1) // 周一开始
          weekStart.setHours(0, 0, 0, 0)

          const dayNames = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]
          const weeklyData = dayNames.map((dayName, index) => {
            const dayStart = new Date(weekStart)
            dayStart.setDate(weekStart.getDate() + index)
            const dayEnd = new Date(dayStart)
            dayEnd.setDate(dayStart.getDate() + 1)

            const dayEntries = (logsResponse.data ?? []).filter((entry: ProgressEntry) => {
              const entryDate = new Date(entry.timestamp)
              return entryDate >= dayStart && entryDate < dayEnd
            })

            const completed = dayEntries.filter(
              (e: ProgressEntry) => e.status === "closed" || e.status === "completed"
            ).length
            const total = dayEntries.length

            return {
              day: dayName,
              completed,
              total: Math.max(total, 5), // 至少显示5个任务
              percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
            }
          })

          setWeeklyProgress(weeklyData)
        }
      } catch (error) {
        console.error("加载进度数据失败:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProgressData()
  }, [userId])

  // 计算月度统计数据
  const monthlyStats = progressSummary
    ? {
        totalTasks: progressSummary.total_entries || 0,
        completedTasks: progressSummary.completed_entries || 0,
        socialInteractions: progressSummary.categories?.social || 0,
        emotionAccuracy: progressSummary.completed_entries && progressSummary.total_entries
          ? Math.round((progressSummary.completed_entries / progressSummary.total_entries) * 100)
          : 0,
      }
    : {
        totalTasks: 0,
        completedTasks: 0,
        socialInteractions: 0,
        emotionAccuracy: 0,
      }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 pb-20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 pb-20">
      <div className="max-w-md mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="text-center pt-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">学习进度</h1>
          <p className="text-gray-600">查看你的成长轨迹</p>
        </div>

        {/* 总体进度卡片 */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              本月总体进度
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {Math.round((monthlyStats.completedTasks / monthlyStats.totalTasks) * 100)}%
              </div>
              <Progress 
                value={(monthlyStats.completedTasks / monthlyStats.totalTasks) * 100} 
                className="h-3"
              />
              <p className="text-sm text-gray-600 mt-2">
                已完成 {monthlyStats.completedTasks} / {monthlyStats.totalTasks} 个任务
                {monthlyStats.totalTasks === 0 && (
                  <span className="block text-xs text-gray-400 mt-1">暂无数据</span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 周进度 */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              本周进度
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {weeklyProgress.map((day, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 w-12">{day.day}</span>
                  <div className="flex-1 mx-3">
                    <Progress value={day.percentage} className="h-2" />
                  </div>
                  <div className="text-xs text-gray-600 w-16 text-right">
                    {day.completed}/{day.total > 0 ? day.total : "-"}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 成就徽章 */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-600" />
              成就徽章
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              {achievements.map((achievement, index) => {
                const Icon = achievement.icon
                return (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                    <div className={`p-2 rounded-full ${achievement.color} text-white`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{achievement.title}</h4>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      已获得
                    </Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* 统计数据 */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle>学习统计</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{monthlyStats.socialInteractions}</div>
                <div className="text-sm text-gray-600">社交互动</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{monthlyStats.emotionAccuracy}%</div>
                <div className="text-sm text-gray-600">情绪识别准确率</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

