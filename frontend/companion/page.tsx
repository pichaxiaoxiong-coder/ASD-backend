"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ProtectedRoute } from "@/components/protected-route"
import {
  ArrowLeft,
  Send,
  Bot,
  User,
  Mic,
  MicOff,
  Image,
  Phone,
  PhoneOff,
  Volume2,
  VolumeX,
  Camera,
  FileText,
  Smile,
  MoreHorizontal,
  Pause,
  Play,
  Square,
  Lock
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { apiClient } from "@/src/lib/api-client"

interface Message {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
  isTyping?: boolean
  mediaType?: 'text' | 'image' | 'voice'
  mediaUrl?: string
  duration?: number
}

function CompanionPageContent() {
  const router = useRouter()
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: '你好！我是启明星🌟 你的成长陪伴小助手，今天想聊什么呢？',
      timestamp: new Date(),
      mediaType: 'text'
    }
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isCalling, setIsCalling] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [showMoreOptions, setShowMoreOptions] = useState(false)
  const [showVoiceInput, setShowVoiceInput] = useState(false)
  const [isPressing, setIsPressing] = useState(false)
  const [recordingVolume, setRecordingVolume] = useState(0)
  const [isCanceling, setIsCanceling] = useState(false)
  const [startY, setStartY] = useState(0)
  const [currentY, setCurrentY] = useState(0)
  const [userId, setUserId] = useState<string>("u1")
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // 获取用户ID
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId") || sessionStorage.getItem("userId") || user?.id || "u1"
    setUserId(storedUserId)
  }, [user])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 添加全局触摸事件监听
  useEffect(() => {
    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (isPressing && showVoiceInput) {
        const touch = e.touches[0]
        const deltaY = startY - touch.clientY
        const shouldCancel = deltaY > 50
        
        if (shouldCancel !== isCanceling) {
          setIsCanceling(shouldCancel)
        }
      }
    }

    if (isPressing && showVoiceInput) {
      document.addEventListener('touchmove', handleGlobalTouchMove, { passive: true })
    }

    return () => {
      document.removeEventListener('touchmove', handleGlobalTouchMove)
    }
  }, [isPressing, showVoiceInput, startY, isCanceling])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && !selectedImage) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage || (selectedImage ? '[图片]' : ''),
      timestamp: new Date(),
      mediaType: selectedImage ? 'image' : 'text',
      mediaUrl: selectedImage || undefined
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage("")
    setSelectedImage(null)
    setIsTyping(true)

    // 获取AI回复
    setTimeout(async () => {
      try {
        const aiResponse = await generateAIResponse(inputMessage, selectedImage)
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: aiResponse,
          timestamp: new Date(),
          mediaType: 'text'
        }
        setMessages(prev => [...prev, aiMessage])
      } catch (error) {
        console.error('AI响应生成失败:', error)
        const fallbackMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: "启明星暂时无法回应，但我会一直陪着你！",
          timestamp: new Date(),
          mediaType: 'text'
        }
        setMessages(prev => [...prev, fallbackMessage])
      } finally {
        setIsTyping(false)
      }
    }, 1000 + Math.random() * 2000) // 1-3秒随机延迟
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      // 创建音频上下文用于音量检测
      const audioContext = new AudioContext()
      const analyser = audioContext.createAnalyser()
      const microphone = audioContext.createMediaStreamSource(stream)
      microphone.connect(analyser)
      analyser.fftSize = 256

      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      
      const updateVolume = () => {
        if (isRecording) {
          analyser.getByteFrequencyData(dataArray)
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length
          setRecordingVolume(average)
          requestAnimationFrame(updateVolume)
        }
      }

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        const audioUrl = URL.createObjectURL(audioBlob)
        
        const voiceMessage: Message = {
          id: Date.now().toString(),
          type: 'user',
          content: '[语音消息]',
          timestamp: new Date(),
          mediaType: 'voice',
          mediaUrl: audioUrl,
          duration: recordingTime
        }
        
        setMessages(prev => [...prev, voiceMessage])
        setRecordingTime(0)
        setRecordingVolume(0)
        
          // 获取AI语音回复
          setTimeout(async () => {
            try {
              const aiResponse = await generateAIResponse('语音消息')
              const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                type: 'ai',
                content: aiResponse,
                timestamp: new Date(),
                mediaType: 'text'
              }
              setMessages(prev => [...prev, aiMessage])
            } catch (error) {
              console.error('AI语音响应生成失败:', error)
              const fallbackMessage: Message = {
                id: (Date.now() + 1).toString(),
                type: 'ai',
                content: "启明星听到了你的语音，你的声音很清晰！",
                timestamp: new Date(),
                mediaType: 'text'
              }
              setMessages(prev => [...prev, fallbackMessage])
            }
          }, 2000)

        // 关闭音频上下文
        audioContext.close()
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      updateVolume()
      
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (error) {
      console.error('无法访问麦克风:', error)
      alert('无法访问麦克风，请检查权限设置')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
    }
  }

  const handleVoicePressStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsPressing(true)
    setShowVoiceInput(true)
    setIsCanceling(false)
    setStartY(e.type === 'touchstart' ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY)
    setCurrentY(e.type === 'touchstart' ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY)
    startRecording()
  }

  const handleVoicePressEnd = () => {
    if (!isCanceling) {
      // 正常发送
      stopRecording()
    } else {
      // 取消发送
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop()
        setIsRecording(false)
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current)
        }
        setRecordingTime(0)
        setRecordingVolume(0)
      }
    }
    setIsPressing(false)
    setShowVoiceInput(false)
    setIsCanceling(false)
  }

  const handleVoiceMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isPressing) return
    
    const clientY = e.type === 'touchmove' ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY
    setCurrentY(clientY)
    
    const deltaY = startY - clientY
    const shouldCancel = deltaY > 50 // 上划超过50px触发取消
    
    if (shouldCancel !== isCanceling) {
      setIsCanceling(shouldCancel)
    }
  }

  const handleVoiceLeave = () => {
    if (isPressing) {
      handleVoicePressEnd()
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleVoiceCall = () => {
    if (isCalling) {
      setIsCalling(false)
      // 这里可以添加结束通话的逻辑
    } else {
      setIsCalling(true)
      // 这里可以添加开始通话的逻辑
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const generateAIResponse = async (userInput: string, hasImage?: string | null): Promise<string> => {
    try {
      // 调用后端AI API
      const response = await apiClient.chatCompanion(
        userInput,
        userId,
        {
          hasImage: !!hasImage,
          timestamp: new Date().toISOString()
        }
      )

      if (response.error) {
        console.error('AI API调用失败:', response.error)
        throw new Error(response.error)
      }

      if (response.data) {
        // 后端可能返回 reply、response 或 message 字段
        return response.data.reply || response.data.response || response.data.message || ""
      }
    } catch (error) {
      console.error('AI API调用失败:', error)
    }

    // 回退到本地响应（当API失败时）
    const responses = [
      "启明星理解你的感受，这确实是一个很好的问题！让我们一起来思考一下...",
      "哇，你提到的这个想法很有趣！启明星觉得你可以尝试...",
      "启明星为你感到骄傲！你正在学习如何更好地表达自己。",
      "这听起来像是一个挑战，但启明星相信你有能力克服它。",
      "你的想法很有创意！让我们继续探索这个方向...",
      "启明星注意到你在努力思考，这很棒！",
      "每个人都有自己的节奏，你做得很好！",
      "你的问题让启明星想到了一个有趣的故事...",
      "启明星感受到你的真诚，这让我很感动。",
      "让我们一起找到解决问题的方法，好吗？"
    ]
    
    // 根据关键词选择更相关的回复
    if (userInput.includes('开心') || userInput.includes('高兴')) {
      return "看到你这么开心，启明星也很开心！🌟 能告诉我是什么让你这么高兴吗？"
    }
    if (userInput.includes('难过') || userInput.includes('伤心')) {
      return "启明星感受到你有些难过，这很正常。我在这里陪着你，想聊聊发生了什么吗？"
    }
    if (userInput.includes('朋友') || userInput.includes('社交')) {
      return "交朋友是一件很棒的事情！启明星想了解一些交朋友的技巧吗？"
    }
    if (userInput.includes('学习') || userInput.includes('练习')) {
      return "学习新东西需要勇气和耐心，启明星已经迈出了第一步！"
    }
    if (hasImage) {
      return "启明星看到你分享了一张图片！这张图片很有趣，能告诉我你想表达什么吗？"
    }
    if (userInput === '语音消息') {
      return "启明星听到了你的语音消息！你的声音很清晰，想继续用语音聊天吗？"
    }
    
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const quickReplies = [
    "今天心情怎么样？",
    "我想交朋友",
    "帮我练习对话",
    "讲个故事给我听",
    "我有点紧张",
    "今天学到了什么？"
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100 flex flex-col">
      {/* 页面头部 */}
      <div className="flex items-center gap-4 p-4 bg-white/80 backdrop-blur-sm border-b">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.back()}
          className="p-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <img 
              src="/star-character.svg" 
              alt="启明星" 
              className="w-full h-full object-cover"
              onError={(e) => {
                // 如果图片加载失败，显示默认头像
                e.currentTarget.style.display = 'none'
                e.currentTarget.nextElementSibling?.classList.remove('hidden')
              }}
            />
            <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center hidden">
              <Bot className="h-6 w-6 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800">启明星</h1>
            <p className="text-sm text-gray-600">成长陪伴AI助手</p>
          </div>
        </div>
        <div className="ml-auto flex gap-2">
          <Button
            variant={isCalling ? "destructive" : "outline"}
            size="sm"
            onClick={handleVoiceCall}
            className="rounded-full"
          >
            {isCalling ? <PhoneOff className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
          </Button>
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            在线
          </Badge>
        </div>
      </div>

      {/* 聊天区域 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.type === 'ai' && (
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarImage src="/star-character.svg" alt="启明星" />
                <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            )}
            
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.type === 'user'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : 'bg-white/80 backdrop-blur-sm text-gray-800 shadow-sm'
              }`}
            >
              {/* 图片消息 */}
              {message.mediaType === 'image' && message.mediaUrl && (
                <div className="mb-2">
                  <img 
                    src={message.mediaUrl} 
                    alt="用户上传的图片" 
                    className="max-w-full h-auto rounded-lg"
                  />
                </div>
              )}
              
              {/* 语音消息 */}
              {message.mediaType === 'voice' && message.mediaUrl && (
                <div className="flex items-center gap-2 mb-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2"
                    onClick={() => {
                      const audio = new Audio(message.mediaUrl!)
                      audio.play()
                    }}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                  <div className="flex-1 bg-black/10 rounded-full h-2">
                    <div className="bg-current h-2 rounded-full w-1/3"></div>
                  </div>
                  <span className="text-xs">{formatTime(message.duration || 0)}</span>
                </div>
              )}
              
              <p className="text-sm leading-relaxed">{message.content}</p>
              <div className={`text-xs mt-1 ${
                message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {message.timestamp.toLocaleTimeString('zh-CN', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>

            {message.type === 'user' && (
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarImage src="/placeholder-user.jpg" alt="用户" />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}

        {/* 正在输入指示器 */}
        {isTyping && (
          <div className="flex gap-3 justify-start">
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarImage src="/star-character.svg" alt="启明星" />
              <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white">
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 语音通话界面 */}
      {isCalling && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="w-80 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4">
                <img 
                  src="/star-character.svg" 
                  alt="启明星" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    e.currentTarget.nextElementSibling?.classList.remove('hidden')
                  }}
                />
                <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center hidden">
                  <Bot className="h-10 w-10 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-bold mb-2">正在与启明星通话</h3>
              <p className="text-gray-600 mb-4">通话时间: {formatTime(recordingTime)}</p>
              <div className="flex gap-4 justify-center">
                <Button
                  variant="outline"
                  onClick={() => setIsMuted(!isMuted)}
                  className="rounded-full"
                >
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleVoiceCall}
                  className="rounded-full"
                >
                  <PhoneOff className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 快速回复 */}
      <div className="p-4 bg-white/80 backdrop-blur-sm border-t">
        <div className="flex flex-wrap gap-2 mb-3">
          {quickReplies.map((reply, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => setInputMessage(reply)}
              className="text-xs bg-white/50 hover:bg-white/80"
            >
              {reply}
            </Button>
          ))}
        </div>

        {/* 选中的图片预览 */}
        {selectedImage && (
          <div className="mb-3 p-3 bg-white/50 rounded-lg">
            <div className="flex items-center gap-3">
              <img 
                src={selectedImage} 
                alt="预览" 
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div className="flex-1">
                <p className="text-sm text-gray-600">已选择图片</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedImage(null)}
                  className="text-red-500 hover:text-red-700"
                >
                  移除
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 输入模式切换 */}
        <div className="flex justify-center mb-2">
          <div className="bg-gray-100 rounded-full p-1 flex">
            <Button
              variant={!showVoiceInput ? "default" : "ghost"}
              size="sm"
              onClick={() => setShowVoiceInput(false)}
              className="rounded-full px-4"
            >
              <FileText className="h-4 w-4 mr-1" />
              文字
            </Button>
            <Button
              variant={showVoiceInput ? "default" : "ghost"}
              size="sm"
              onClick={() => setShowVoiceInput(true)}
              className="rounded-full px-4"
            >
              <Mic className="h-4 w-4 mr-1" />
              语音
            </Button>
          </div>
        </div>

        {/* 输入区域 */}
        <div className="flex gap-2">
          {/* 更多选项按钮 */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMoreOptions(!showMoreOptions)}
              className="rounded-full w-12 h-12 p-0"
            >
              <MoreHorizontal className="h-5 w-5" />
            </Button>
            
            {/* 更多选项菜单 */}
            {showMoreOptions && (
              <div className="absolute bottom-14 left-0 bg-white rounded-lg shadow-lg border p-2 space-y-1 z-10">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    fileInputRef.current?.click()
                    setShowMoreOptions(false)
                  }}
                  className="w-full justify-start"
                >
                  <Image className="h-4 w-4 mr-2" />
                  图片
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    // 打开相机
                    setShowMoreOptions(false)
                  }}
                  className="w-full justify-start"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  拍照
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    // 文件上传
                    setShowMoreOptions(false)
                  }}
                  className="w-full justify-start"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  文件
                </Button>
              </div>
            )}
          </div>

          {/* 语音录音按钮 */}
          {showVoiceInput ? (
            <Button
              variant="outline"
              size="sm"
              onMouseDown={handleVoicePressStart}
              onMouseUp={handleVoicePressEnd}
              onMouseMove={handleVoiceMove}
              onMouseLeave={handleVoiceLeave}
              onTouchStart={handleVoicePressStart}
              onTouchEnd={handleVoicePressEnd}
              onTouchMove={handleVoiceMove}
              className="flex-1 h-12 rounded-full relative overflow-hidden"
            >
              <Mic className="h-5 w-5 mr-2" />
              <span className="text-sm">按住说话</span>
              {isPressing && (
                <div className={`absolute inset-0 rounded-full animate-pulse ${
                  isCanceling ? 'bg-orange-500' : 'bg-red-500'
                }`}></div>
              )}
            </Button>
          ) : (
            <>
              {/* 文本输入 */}
              <div className="flex-1 relative">
                <Textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="输入消息..."
                  className="min-h-[48px] max-h-32 resize-none rounded-full border-0 bg-white/50 focus:bg-white/80 pr-12"
                  rows={1}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1"
                >
                  <Smile className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}

          {/* 发送按钮 */}
          <Button
            onClick={handleSendMessage}
            disabled={(!inputMessage.trim() && !selectedImage) || isTyping}
            className="rounded-full w-12 h-12 p-0 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>

        {/* 微信风格语音输入界面 */}
        {showVoiceInput && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className={`bg-white rounded-2xl p-8 mx-4 max-w-sm w-full transition-all duration-300 ${
              isCanceling ? 'transform -translate-y-4' : ''
            }`}>
              <div className="text-center">
                {/* 录音动画 */}
                <div className="relative w-32 h-32 mx-auto mb-6">
                  <div className={`absolute inset-0 rounded-full border-4 animate-pulse ${
                    isCanceling ? 'border-orange-500' : 'border-red-500'
                  }`}></div>
                  <div 
                    className={`absolute inset-0 rounded-full flex items-center justify-center ${
                      isCanceling ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{
                      transform: `scale(${1 + recordingVolume / 100})`,
                      transition: 'transform 0.1s ease-out'
                    }}
                  >
                    {isCanceling ? (
                      <Square className="h-12 w-12 text-white" />
                    ) : (
                      <Mic className="h-12 w-12 text-white" />
                    )}
                  </div>
                  
                  {/* 音量波纹效果 */}
                  {isRecording && !isCanceling && (
                    <>
                      <div className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping"></div>
                      <div className="absolute inset-0 rounded-full border-2 border-red-300 animate-ping" style={{ animationDelay: '0.5s' }}></div>
                      <div className="absolute inset-0 rounded-full border-2 border-red-200 animate-ping" style={{ animationDelay: '1s' }}></div>
                    </>
                  )}
                </div>

                {/* 录音提示文字 */}
                <h3 className={`text-lg font-bold mb-2 ${
                  isCanceling ? 'text-orange-600' : 'text-gray-800'
                }`}>
                  {isCanceling ? '松开取消发送' : isRecording ? '录音中...' : '按住说话'}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {isRecording ? formatTime(recordingTime) : '松开结束录音'}
                </p>

                {/* 音量指示器 */}
                {isRecording && !isCanceling && (
                  <div className="flex justify-center gap-1 mb-4">
                    {Array.from({ length: 8 }, (_, i) => (
                      <div
                        key={i}
                        className={`w-1 rounded-full transition-all duration-100 ${
                          recordingVolume > i * 12.5 ? 'bg-red-500' : 'bg-gray-300'
                        }`}
                        style={{ height: `${(i + 1) * 4 + 8}px` }}
                      ></div>
                    ))}
                  </div>
                )}

                {/* 上划取消提示 */}
                {isRecording && (
                  <div className="mb-4">
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                        <ArrowLeft className="h-3 w-3 text-gray-600" style={{ transform: 'rotate(-90deg)' }} />
                      </div>
                      <span className="text-gray-500">上划取消</span>
                    </div>
                  </div>
                )}

                {/* 录音提示 */}
                <div className="text-xs text-gray-500">
                  {isCanceling ? '上划取消发送' : isRecording ? '松开手指发送语音' : '按住麦克风开始录音'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 录音状态显示 */}
        {isRecording && !showVoiceInput && (
          <div className="mt-2 flex items-center gap-2 text-red-500">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm">录音中... {formatTime(recordingTime)}</span>
          </div>
        )}

        {/* 隐藏的文件输入 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>
    </div>
  )
}

export default function CompanionPage() {
  return <CompanionPageContent />
}
