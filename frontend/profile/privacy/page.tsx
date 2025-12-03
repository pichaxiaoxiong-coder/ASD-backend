"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Shield, Eye, EyeOff, Lock, Download, Trash2, Key } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function PrivacyPage() {
  const router = useRouter()
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "private", // public, friends, private
    dataCollection: true,
    analytics: false,
    locationTracking: false,
    cameraAccess: true,
    microphoneAccess: false,
    contactsAccess: false,
    calendarAccess: false,
    twoFactorAuth: false,
    biometricAuth: true,
    autoLock: true,
    lockTimeout: 5, // minutes
    dataRetention: 365, // days
    exportData: true,
    deleteAccount: false
  })

  const handleSettingChange = (key: string, value: any) => {
    setPrivacySettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleExportData = () => {
    // 导出用户数据
    console.log("导出用户数据")
    alert("数据导出功能正在开发中...")
  }

  const handleDeleteAccount = () => {
    if (confirm("确定要删除账户吗？此操作不可撤销！")) {
      console.log("删除账户")
      alert("账户删除功能正在开发中...")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 p-4">
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
          <h1 className="text-xl font-bold text-gray-800">隐私和安全</h1>
        </div>

        {/* 账户安全 */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              账户安全
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="two-factor">双重验证</Label>
                <p className="text-sm text-gray-600">为账户添加额外安全保护</p>
              </div>
              <Switch
                id="two-factor"
                checked={privacySettings.twoFactorAuth}
                onCheckedChange={(checked) => handleSettingChange("twoFactorAuth", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="biometric">生物识别</Label>
                <p className="text-sm text-gray-600">使用指纹或面部识别登录</p>
              </div>
              <Switch
                id="biometric"
                checked={privacySettings.biometricAuth}
                onCheckedChange={(checked) => handleSettingChange("biometricAuth", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-lock">自动锁定</Label>
                <p className="text-sm text-gray-600">应用闲置时自动锁定</p>
              </div>
              <Switch
                id="auto-lock"
                checked={privacySettings.autoLock}
                onCheckedChange={(checked) => handleSettingChange("autoLock", checked)}
              />
            </div>

            {privacySettings.autoLock && (
              <div className="space-y-2">
                <Label htmlFor="lock-timeout">锁定时间</Label>
                <select 
                  id="lock-timeout"
                  value={privacySettings.lockTimeout}
                  onChange={(e) => handleSettingChange("lockTimeout", parseInt(e.target.value))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value={1}>1分钟</option>
                  <option value={5}>5分钟</option>
                  <option value={15}>15分钟</option>
                  <option value={30}>30分钟</option>
                </select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 隐私控制 */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-purple-600" />
              隐私控制
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile-visibility">个人资料可见性</Label>
              <select 
                id="profile-visibility"
                value={privacySettings.profileVisibility}
                onChange={(e) => handleSettingChange("profileVisibility", e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="public">公开</option>
                <option value="friends">仅好友</option>
                <option value="private">私密</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="data-collection">数据收集</Label>
                <p className="text-sm text-gray-600">允许收集学习数据用于改进</p>
              </div>
              <Switch
                id="data-collection"
                checked={privacySettings.dataCollection}
                onCheckedChange={(checked) => handleSettingChange("dataCollection", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="analytics">使用分析</Label>
                <p className="text-sm text-gray-600">收集使用数据用于产品优化</p>
              </div>
              <Switch
                id="analytics"
                checked={privacySettings.analytics}
                onCheckedChange={(checked) => handleSettingChange("analytics", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="location-tracking">位置跟踪</Label>
                <p className="text-sm text-gray-600">用于个性化推荐</p>
              </div>
              <Switch
                id="location-tracking"
                checked={privacySettings.locationTracking}
                onCheckedChange={(checked) => handleSettingChange("locationTracking", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* 权限管理 */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-orange-600" />
              权限管理
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="camera">相机访问</Label>
                <p className="text-sm text-gray-600">用于拍照和视频功能</p>
              </div>
              <Switch
                id="camera"
                checked={privacySettings.cameraAccess}
                onCheckedChange={(checked) => handleSettingChange("cameraAccess", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="microphone">麦克风访问</Label>
                <p className="text-sm text-gray-600">用于语音识别功能</p>
              </div>
              <Switch
                id="microphone"
                checked={privacySettings.microphoneAccess}
                onCheckedChange={(checked) => handleSettingChange("microphoneAccess", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="contacts">通讯录访问</Label>
                <p className="text-sm text-gray-600">用于邀请好友功能</p>
              </div>
              <Switch
                id="contacts"
                checked={privacySettings.contactsAccess}
                onCheckedChange={(checked) => handleSettingChange("contactsAccess", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="calendar">日历访问</Label>
                <p className="text-sm text-gray-600">用于学习计划安排</p>
              </div>
              <Switch
                id="calendar"
                checked={privacySettings.calendarAccess}
                onCheckedChange={(checked) => handleSettingChange("calendarAccess", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* 数据管理 */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-green-600" />
              数据管理
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="data-retention">数据保留期限</Label>
              <select 
                id="data-retention"
                value={privacySettings.dataRetention}
                onChange={(e) => handleSettingChange("dataRetention", parseInt(e.target.value))}
                className="w-full p-2 border rounded-md"
              >
                <option value={30}>30天</option>
                <option value={90}>90天</option>
                <option value={365}>1年</option>
                <option value={0}>永久保留</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="export-data">允许数据导出</Label>
                <p className="text-sm text-gray-600">可以导出个人数据</p>
              </div>
              <Switch
                id="export-data"
                checked={privacySettings.exportData}
                onCheckedChange={(checked) => handleSettingChange("exportData", checked)}
              />
            </div>

            {privacySettings.exportData && (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleExportData}
              >
                <Download className="h-4 w-4 mr-2" />
                导出我的数据
              </Button>
            )}
          </CardContent>
        </Card>

        {/* 危险操作 */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              危险操作
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-red-50 rounded-lg">
              <h4 className="font-medium text-red-800 mb-2">删除账户</h4>
              <p className="text-sm text-red-600 mb-3">
                删除账户将永久删除所有数据，包括学习记录、成就和设置。此操作不可撤销。
              </p>
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={handleDeleteAccount}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                删除我的账户
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 隐私政策 */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                我们重视您的隐私，所有数据都经过加密保护
              </p>
              <div className="flex gap-4 justify-center">
                <Button variant="link" size="sm">
                  隐私政策
                </Button>
                <Button variant="link" size="sm">
                  服务条款
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

