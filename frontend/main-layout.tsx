"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import SimpleLogin from "@/components/SimpleLogin"
import { BottomNav } from "@/components/bottom-nav"
import { CompanionPage } from "@/app/companion/page"
import { SocialGamePage } from "@/app/social-game/page"
import { RecoveryMonitoringPage } from "@/app/recovery-monitoring/page"
import { ProfilePage } from "@/app/profile/page"
import { AnimatedBackground } from "@/components/animated-background"
import { Loader2 } from "lucide-react"

type TabType = 'companion' | 'social' | 'recovery' | 'profile'

export default function MainLayout() {
  const { user, isAuthenticated, isLoading, login, register } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('companion')

  // 如果正在加载，显示加载界面
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">正在加载...</p>
        </div>
      </div>
    )
  }

  // 如果未登录，重定向到登录页面
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center p-4">
        <AnimatedBackground timeOfDay="day" />
        <div className="w-full max-w-md bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 relative z-10">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <span className="text-3xl">🌟</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">欢迎使用启明星</h1>
            <p className="text-gray-600">您的自闭症康复陪伴助手</p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
            >
              登录 / 注册
            </button>
            
            <div className="text-center">
              <p className="text-sm text-gray-500">
                登录后即可使用所有功能
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 已登录，显示主界面
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'companion':
        return <CompanionPage />
      case 'social':
        return <SocialGamePage />
      case 'recovery':
        return <RecoveryMonitoringPage />
      case 'profile':
        return <ProfilePage />
      default:
        return <CompanionPage />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AnimatedBackground timeOfDay="day" />
      
      {/* 主内容区域 */}
      <main className="flex-1 overflow-hidden">
        {renderActiveTab()}
      </main>
      
      {/* 底部导航栏 */}
      <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200">
        <div className="grid grid-cols-4 h-16">
          <button
            onClick={() => setActiveTab('companion')}
            className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
              activeTab === 'companion'
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <div className="w-6 h-6">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <span className="text-xs font-medium">成长陪伴</span>
          </button>
          
          <button
            onClick={() => setActiveTab('social')}
            className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
              activeTab === 'social'
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <div className="w-6 h-6">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H16c-.8 0-1.54.37-2.01.99L12 11l-1.99-2.01A2.5 2.5 0 0 0 8 8H5.46c-.8 0-1.54.37-2.01.99L1 14.37V22h2v-6h2.5l2.5 7.5h2L8.5 16H11v6h2v-6h2.5l2.5 7.5h2L15.5 16H18v6h2z"/>
              </svg>
            </div>
            <span className="text-xs font-medium">社交解码</span>
          </button>
          
          <button
            onClick={() => setActiveTab('recovery')}
            className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
              activeTab === 'recovery'
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <div className="w-6 h-6">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
              </svg>
            </div>
            <span className="text-xs font-medium">康复监测</span>
          </button>
          
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
              activeTab === 'profile'
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <div className="w-6 h-6">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            <span className="text-xs font-medium">我的</span>
          </button>
        </div>
      </div>
    </div>
  )
}




