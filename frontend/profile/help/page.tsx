"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ArrowLeft, Search, HelpCircle, MessageCircle, Phone, Mail, BookOpen, Video, FileText } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function HelpPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  const faqData = [
    {
      category: "基础使用",
      questions: [
        {
          question: "如何开始第一次学习？",
          answer: "点击首页的'开始学习'按钮，选择适合的学习模式，系统会根据您的需求推荐相应的练习内容。"
        },
        {
          question: "如何查看学习进度？",
          answer: "在底部导航栏点击'进度'标签，您可以查看每日、每周和每月的学习统计，以及获得的成就徽章。"
        },
        {
          question: "如何设置学习提醒？",
          answer: "进入'我的'页面，点击'通知'设置，可以开启学习提醒并设置提醒时间。"
        }
      ]
    },
    {
      category: "功能说明",
      questions: [
        {
          question: "社交解码功能如何使用？",
          answer: "社交解码帮助您理解和练习社交场景。选择场景后，系统会提供详细的社交技巧和练习建议。"
        },
        {
          question: "情绪识别如何工作？",
          answer: "通过面部表情识别和情境分析，系统会帮助您识别和理解不同的情绪状态，并提供相应的应对策略。"
        },
        {
          question: "康复监测有什么作用？",
          answer: "康复监测会记录您的学习进展，分析能力提升情况，并生成个性化的康复报告。"
        }
      ]
    },
    {
      category: "账户管理",
      questions: [
        {
          question: "如何修改个人信息？",
          answer: "在'我的'页面点击'编辑资料'，可以修改姓名、头像、联系方式等个人信息。"
        },
        {
          question: "如何导出学习数据？",
          answer: "在隐私设置中开启数据导出功能，然后点击'导出我的数据'按钮即可下载您的学习记录。"
        },
        {
          question: "如何重置密码？",
          answer: "在登录页面点击'忘记密码'，按照提示输入邮箱地址，系统会发送重置链接到您的邮箱。"
        }
      ]
    },
    {
      category: "技术问题",
      questions: [
        {
          question: "应用运行缓慢怎么办？",
          answer: "请检查网络连接，关闭其他应用释放内存，或重启应用。如果问题持续，请联系技术支持。"
        },
        {
          question: "无法接收通知怎么办？",
          answer: "检查设备的通知权限设置，确保应用有发送通知的权限，并在应用内检查通知设置。"
        },
        {
          question: "数据同步失败怎么办？",
          answer: "检查网络连接，尝试重新登录，或清除应用缓存后重新启动。"
        }
      ]
    }
  ]

  const contactMethods = [
    {
      icon: MessageCircle,
      title: "在线客服",
      description: "7x24小时在线支持",
      action: "立即咨询",
      color: "text-blue-600"
    },
    {
      icon: Phone,
      title: "电话支持",
      description: "400-123-4567",
      action: "拨打电话",
      color: "text-green-600"
    },
    {
      icon: Mail,
      title: "邮件支持",
      description: "support@asd-app.com",
      action: "发送邮件",
      color: "text-purple-600"
    }
  ]

  const resources = [
    {
      icon: BookOpen,
      title: "用户手册",
      description: "详细的功能使用指南",
      action: "查看手册"
    },
    {
      icon: Video,
      title: "视频教程",
      description: "观看操作演示视频",
      action: "观看视频"
    },
    {
      icon: FileText,
      title: "常见问题",
      description: "快速找到问题答案",
      action: "查看FAQ"
    }
  ]

  const filteredFaq = faqData.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-4">
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
          <h1 className="text-xl font-bold text-gray-800">帮助中心</h1>
        </div>

        {/* 搜索框 */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="搜索问题或关键词..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* 快速联系 */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-blue-600" />
              快速联系
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              {contactMethods.map((method, index) => {
                const Icon = method.icon
                return (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className={`p-2 rounded-full bg-gray-100 ${method.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{method.title}</h4>
                      <p className="text-sm text-gray-600">{method.description}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      {method.action}
                    </Button>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* 帮助资源 */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle>帮助资源</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              {resources.map((resource, index) => {
                const Icon = resource.icon
                return (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="p-2 rounded-full bg-gray-100 text-gray-600">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{resource.title}</h4>
                      <p className="text-sm text-gray-600">{resource.description}</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      {resource.action}
                    </Button>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* 常见问题 */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle>常见问题</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {filteredFaq.map((category, categoryIndex) => (
                <div key={categoryIndex} className="mb-4">
                  <h3 className="font-medium text-gray-800 mb-2">{category.category}</h3>
                  {category.questions.map((faq, faqIndex) => (
                    <AccordionItem key={faqIndex} value={`${categoryIndex}-${faqIndex}`}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-600">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </div>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* 反馈建议 */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="text-center space-y-3">
              <h3 className="font-medium text-gray-800">没有找到答案？</h3>
              <p className="text-sm text-gray-600">
                我们很乐意为您提供帮助，请通过以下方式联系我们
              </p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" size="sm">
                  提交反馈
                </Button>
                <Button size="sm">
                  联系客服
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

