"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Moon, Sun, Volume2, VolumeX, Wifi, WifiOff } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function SettingsPage() {
  const router = useRouter()
  const [settings, setSettings] = useState({
    nightMode: false,
    soundEnabled: true,
    vibrationEnabled: true,
    autoUpdate: true,
    dataUsage: "wifi", // wifi, mobile, always
    language: "zh-CN",
    fontSize: "medium",
    notifications: true,
    locationServices: false
  })

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
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
          <h1 className="text-xl font-bold text-gray-800">设置</h1>
        </div>

        {/* 外观设置 */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="h-5 w-5 text-purple-600" />
              外观设置
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="night-mode">夜间模式</Label>
                <p className="text-sm text-gray-600">自动切换深色主题</p>
              </div>
              <Switch
                id="night-mode"
                checked={settings.nightMode}
                onCheckedChange={(checked) => handleSettingChange("nightMode", checked)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="font-size">字体大小</Label>
              <Select 
                value={settings.fontSize} 
                onValueChange={(value) => handleSettingChange("fontSize", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择字体大小" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">小</SelectItem>
                  <SelectItem value="medium">中</SelectItem>
                  <SelectItem value="large">大</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 声音和振动 */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5 text-blue-600" />
              声音和振动
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sound">声音效果</Label>
                <p className="text-sm text-gray-600">启用按钮点击音效</p>
              </div>
              <Switch
                id="sound"
                checked={settings.soundEnabled}
                onCheckedChange={(checked) => handleSettingChange("soundEnabled", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="vibration">振动反馈</Label>
                <p className="text-sm text-gray-600">触摸时提供振动反馈</p>
              </div>
              <Switch
                id="vibration"
                checked={settings.vibrationEnabled}
                onCheckedChange={(checked) => handleSettingChange("vibrationEnabled", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* 网络和数据 */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="h-5 w-5 text-green-600" />
              网络和数据
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="data-usage">数据使用</Label>
              <Select 
                value={settings.dataUsage} 
                onValueChange={(value) => handleSettingChange("dataUsage", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择数据使用模式" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wifi">仅WiFi</SelectItem>
                  <SelectItem value="mobile">移动数据</SelectItem>
                  <SelectItem value="always">始终允许</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-update">自动更新</Label>
                <p className="text-sm text-gray-600">自动下载应用更新</p>
              </div>
              <Switch
                id="auto-update"
                checked={settings.autoUpdate}
                onCheckedChange={(checked) => handleSettingChange("autoUpdate", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* 语言设置 */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle>语言设置</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="language">界面语言</Label>
              <Select 
                value={settings.language} 
                onValueChange={(value) => handleSettingChange("language", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择语言" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zh-CN">简体中文</SelectItem>
                  <SelectItem value="en-US">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 隐私设置 */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle>隐私设置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications">推送通知</Label>
                <p className="text-sm text-gray-600">接收学习提醒和成就通知</p>
              </div>
              <Switch
                id="notifications"
                checked={settings.notifications}
                onCheckedChange={(checked) => handleSettingChange("notifications", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="location">位置服务</Label>
                <p className="text-sm text-gray-600">用于个性化推荐</p>
              </div>
              <Switch
                id="location"
                checked={settings.locationServices}
                onCheckedChange={(checked) => handleSettingChange("locationServices", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* 重置设置 */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4">
            <Button 
              variant="outline" 
              className="w-full text-red-600 border-red-200 hover:bg-red-50"
            >
              重置所有设置
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

