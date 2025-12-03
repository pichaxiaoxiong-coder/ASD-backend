"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Bell, Clock, Calendar, Award, MessageSquare } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function NotificationsPage() {
  const router = useRouter()
  const [notificationSettings, setNotificationSettings] = useState({
    allNotifications: true,
    learningReminders: true,
    achievementAlerts: true,
    socialInteractions: true,
    dailyTasks: true,
    weeklyReports: true,
    systemUpdates: false,
    marketingMessages: false,
    reminderTime: "09:00",
    quietHours: true,
    quietStart: "22:00",
    quietEnd: "08:00",
    soundEnabled: true,
    vibrationEnabled: true
  })

  const handleSettingChange = (key: string, value: any) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* 页面头部 */}
        <div className="flex items-center gap-4 pt-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.back()}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-gray-800">通知设置</h1>
        </div>

        {/* 总开关 */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="all-notifications" className="text-lg font-medium">所有通知</Label>
                <p className="text-sm text-gray-600">开启或关闭所有通知</p>
              </div>
              <Switch
                id="all-notifications"
                checked={notificationSettings.allNotifications}
                onCheckedChange={(checked) => handleSettingChange("allNotifications", checked)}
                className="scale-125"
              />
            </div>
          </CardContent>
        </Card>

        {/* 学习相关通知 */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              学习通知
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="learning-reminders">学习提醒</Label>
                <p className="text-sm text-gray-600">每日学习时间提醒</p>
              </div>
              <Switch
                id="learning-reminders"
                checked={notificationSettings.learningReminders}
                onCheckedChange={(checked) => handleSettingChange("learningReminders", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="daily-tasks">每日任务</Label>
                <p className="text-sm text-gray-600">新任务和任务完成提醒</p>
              </div>
              <Switch
                id="daily-tasks"
                checked={notificationSettings.dailyTasks}
                onCheckedChange={(checked) => handleSettingChange("dailyTasks", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="weekly-reports">周报总结</Label>
                <p className="text-sm text-gray-600">每周学习进度报告</p>
              </div>
              <Switch
                id="weekly-reports"
                checked={notificationSettings.weeklyReports}
                onCheckedChange={(checked) => handleSettingChange("weeklyReports", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* 成就和社交通知 */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-600" />
              成就和社交
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="achievement-alerts">成就提醒</Label>
                <p className="text-sm text-gray-600">获得新成就时通知</p>
              </div>
              <Switch
                id="achievement-alerts"
                checked={notificationSettings.achievementAlerts}
                onCheckedChange={(checked) => handleSettingChange("achievementAlerts", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="social-interactions">社交互动</Label>
                <p className="text-sm text-gray-600">社交练习和互动提醒</p>
              </div>
              <Switch
                id="social-interactions"
                checked={notificationSettings.socialInteractions}
                onCheckedChange={(checked) => handleSettingChange("socialInteractions", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* 系统通知 */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-green-600" />
              系统通知
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="system-updates">系统更新</Label>
                <p className="text-sm text-gray-600">应用更新和功能通知</p>
              </div>
              <Switch
                id="system-updates"
                checked={notificationSettings.systemUpdates}
                onCheckedChange={(checked) => handleSettingChange("systemUpdates", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="marketing-messages">营销消息</Label>
                <p className="text-sm text-gray-600">产品推荐和活动通知</p>
              </div>
              <Switch
                id="marketing-messages"
                checked={notificationSettings.marketingMessages}
                onCheckedChange={(checked) => handleSettingChange("marketingMessages", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* 提醒时间设置 */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-600" />
              提醒时间
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reminder-time">每日提醒时间</Label>
              <Input
                id="reminder-time"
                type="time"
                value={notificationSettings.reminderTime}
                onChange={(e) => handleSettingChange("reminderTime", e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="quiet-hours">免打扰时间</Label>
                <p className="text-sm text-gray-600">在指定时间内不发送通知</p>
              </div>
              <Switch
                id="quiet-hours"
                checked={notificationSettings.quietHours}
                onCheckedChange={(checked) => handleSettingChange("quietHours", checked)}
              />
            </div>

            {notificationSettings.quietHours && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quiet-start">开始时间</Label>
                  <Input
                    id="quiet-start"
                    type="time"
                    value={notificationSettings.quietStart}
                    onChange={(e) => handleSettingChange("quietStart", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quiet-end">结束时间</Label>
                  <Input
                    id="quiet-end"
                    type="time"
                    value={notificationSettings.quietEnd}
                    onChange={(e) => handleSettingChange("quietEnd", e.target.value)}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 通知方式 */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-red-600" />
              通知方式
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sound-enabled">声音提醒</Label>
                <p className="text-sm text-gray-600">播放通知声音</p>
              </div>
              <Switch
                id="sound-enabled"
                checked={notificationSettings.soundEnabled}
                onCheckedChange={(checked) => handleSettingChange("soundEnabled", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="vibration-enabled">振动提醒</Label>
                <p className="text-sm text-gray-600">设备振动提醒</p>
              </div>
              <Switch
                id="vibration-enabled"
                checked={notificationSettings.vibrationEnabled}
                onCheckedChange={(checked) => handleSettingChange("vibrationEnabled", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* 测试通知 */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4">
            <Button className="w-full">
              发送测试通知
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

