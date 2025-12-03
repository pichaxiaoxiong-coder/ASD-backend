"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Star, Heart, Users, Award, Shield, Globe, Mail, Github, Twitter } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AboutPage() {
  const router = useRouter()

  const appInfo = {
    name: "启明星 ASD 康复助手",
    version: "1.0.0",
    build: "2024.01.15",
    description: "专为自闭症儿童设计的智能康复训练应用",
    features: [
      "个性化学习计划",
      "AI 智能分析",
      "社交技能训练",
      "情绪识别练习",
      "康复进度监测",
      "家长指导支持"
    ]
  }

  const teamMembers = [
    {
      name: "张医生",
      role: "首席医学顾问",
      specialty: "儿童发育行为学",
      avatar: "👨‍⚕️"
    },
    {
      name: "李老师",
      role: "特教专家",
      specialty: "自闭症康复训练",
      avatar: "👩‍🏫"
    },
    {
      name: "王工程师",
      role: "技术总监",
      specialty: "AI 技术应用",
      avatar: "👨‍💻"
    }
  ]

  const statistics = [
    { label: "服务用户", value: "10,000+", icon: Users, color: "text-blue-600" },
    { label: "康复案例", value: "5,000+", icon: Heart, color: "text-red-600" },
    { label: "用户评分", value: "4.8/5", icon: Star, color: "text-yellow-600" },
    { label: "成功案例", value: "85%", icon: Award, color: "text-green-600" }
  ]

  const achievements = [
    {
      title: "国家卫健委认证",
      description: "通过国家卫生健康委员会认证的康复训练应用",
      icon: Shield,
      color: "bg-blue-100 text-blue-800"
    },
    {
      title: "国际特教协会推荐",
      description: "获得国际特殊教育协会官方推荐",
      icon: Globe,
      color: "bg-green-100 text-green-800"
    },
    {
      title: "用户满意度第一",
      description: "在同类应用中用户满意度排名第一",
      icon: Star,
      color: "bg-yellow-100 text-yellow-800"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100 p-4">
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
          <h1 className="text-xl font-bold text-gray-800">关于应用</h1>
        </div>

        {/* 应用信息 */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{appInfo.name}</h2>
            <p className="text-gray-600 mb-4">{appInfo.description}</p>
            <div className="flex justify-center gap-2 mb-4">
              <Badge variant="secondary">版本 {appInfo.version}</Badge>
              <Badge variant="outline">构建 {appInfo.build}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* 核心功能 */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle>核心功能</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {appInfo.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 统计数据 */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle>应用数据</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {statistics.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                    <Icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
                    <div className="text-xl font-bold text-gray-800">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* 团队介绍 */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle>专业团队</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamMembers.map((member, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <div className="text-2xl">{member.avatar}</div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">{member.name}</h4>
                    <p className="text-sm text-gray-600">{member.role}</p>
                    <p className="text-xs text-gray-500">{member.specialty}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 荣誉成就 */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle>荣誉成就</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {achievements.map((achievement, index) => {
                const Icon = achievement.icon
                return (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                    <div className={`p-2 rounded-full ${achievement.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{achievement.title}</h4>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* 联系我们 */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle>联系我们</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-800">邮箱</p>
                  <p className="text-sm text-gray-600">contact@asd-app.com</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Github className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-800">GitHub</p>
                  <p className="text-sm text-gray-600">github.com/asd-app</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Twitter className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-800">Twitter</p>
                  <p className="text-sm text-gray-600">@asd_app</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 法律信息 */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                © 2024 启明星 ASD 康复助手. 保留所有权利.
              </p>
              <div className="flex gap-4 justify-center">
                <Button variant="link" size="sm">
                  隐私政策
                </Button>
                <Button variant="link" size="sm">
                  服务条款
                </Button>
                <Button variant="link" size="sm">
                  开源许可
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 更新日志 */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle>更新日志</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="border-l-2 border-blue-500 pl-4">
                <h4 className="font-medium text-gray-800">v1.0.0 (2024-01-15)</h4>
                <ul className="text-sm text-gray-600 space-y-1 mt-1">
                  <li>• 首次发布</li>
                  <li>• 基础学习功能</li>
                  <li>• 社交技能训练</li>
                  <li>• 情绪识别练习</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

