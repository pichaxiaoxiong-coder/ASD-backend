/**
 * 统一API客户端
 * 封装所有后端API调用，提供统一的错误处理和类型定义
 */

// API基础URL配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// 类型定义
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

export interface EmotionDetectionResult {
  emotion: string
  sentiment: 'positive' | 'negative' | 'neutral'
  confidence: number
  intensity: number
  positive_score: number
  negative_score: number
  keywords: string[]
}

export interface EmotionRecord {
  user_id: string
  text: string
  emotion: string
  sentiment: string
  intensity: number
  timestamp: string
  keywords: string[]
}

export interface EmotionHistoryResponse {
  count: number
  records: EmotionRecord[]
}

export interface EmotionDiaryEntry {
  user_id: string
  text: string
  emotion: string
  emotion_data: EmotionDetectionResult
  tags: string[]
  context?: string
  timestamp: string
}

export interface EmotionDiaryResponse {
  count?: number
  entries?: EmotionDiaryEntry[]
  records?: EmotionDiaryEntry[]
}

export interface ProgressLog {
  user_id: string
  note: string
  category?: string
  status?: string
  mood?: string
  tags?: string[]
}

export interface ProgressEntry {
  user_id: string
  note: string
  category: string
  status: string
  mood?: string
  tags?: string[]
  timestamp: string
  type?: string
}

export interface ProgressSummary {
  total_entries: number
  completed_entries: number
  categories: Record<string, number>
  recent_entries: ProgressEntry[]
}

export interface InterventionPlan {
  plan_id: string
  user_id: string
  goal: string
  focus_scene: string
  duration_days: number
  created_at: string
  status: string
  steps: Array<{
    title: string
    type: string
    action?: string[]
    actions?: string[]
    scripts?: any[]
    notes: string
  }>
  emotion_trend?: any
  profile_baseline?: string
  profile_sensitivity?: number
  profile_trigger_words?: string[]
  intervention_template?: string
  intervention_template_name?: string
  risk_level?: string
}

export interface CompanionChatRequest {
  user_id?: string
  message: string
  context?: {
    hasImage?: boolean
    timestamp?: string
  }
}

export interface CompanionChatResponse {
  reply?: string
  response?: string
  message?: string
}

// 统一请求函数
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken')
    
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = `请求失败: ${response.status} ${response.statusText}`
      
      try {
        const errorData = JSON.parse(errorText)
        errorMessage = errorData.detail || errorData.message || errorMessage
      } catch {
        errorMessage = errorText || errorMessage
      }

      // 401/403 处理
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token')
        localStorage.removeItem('authToken')
        // 可以在这里触发登录跳转
      }

      return { error: errorMessage }
    }

    const data = await response.json()
    return { data: data as T }
  } catch (error: any) {
    console.error('API请求错误:', error)
    return {
      error: error.message || '网络请求失败，请检查网络连接',
    }
  }
}

// API客户端
export const apiClient = {
  // ========== 情绪相关 API ==========
  
  /**
   * 检测用户情绪
   */
  async detectEmotion(text: string, user_id?: string): Promise<ApiResponse<EmotionDetectionResult>> {
    return request<EmotionDetectionResult>('/emotion/detect', {
      method: 'POST',
      body: JSON.stringify({ text, user_id }),
    })
  },

  /**
   * 获取情绪历史记录
   */
  async getEmotionHistory(
    user_id: string,
    days: number = 7,
    limit: number = 100
  ): Promise<ApiResponse<EmotionHistoryResponse>> {
    return request<EmotionHistoryResponse>(
      `/emotion/history?user_id=${user_id}&days=${days}&limit=${limit}`
    )
  },

  /**
   * 创建情绪日记
   */
  async createEmotionDiary(
    user_id: string,
    text: string,
    emotion?: string,
    tags?: string[],
    context?: string
  ): Promise<ApiResponse<EmotionDiaryEntry>> {
    const params = new URLSearchParams({
      user_id,
      text,
    })
    if (emotion) params.append('emotion', emotion)
    if (tags) params.append('tags', tags.join(','))
    if (context) params.append('context', context)

    return request<EmotionDiaryEntry>(`/emotion/diary?${params.toString()}`, {
      method: 'POST',
    })
  },

  /**
   * 获取情绪日记
   */
  async getEmotionDiary(
    user_id: string,
    emotion?: string,
    limit: number = 50
  ): Promise<ApiResponse<EmotionDiaryResponse>> {
    const params = new URLSearchParams({
      user_id,
      limit: limit.toString(),
    })
    if (emotion) params.append('emotion', emotion)

    return request<EmotionDiaryResponse>(`/emotion/diary?${params.toString()}`)
  },

  /**
   * 获取情绪Profile
   */
  async getEmotionProfile(
    user_id: string,
    force_refresh: boolean = false
  ): Promise<ApiResponse<any>> {
    return request(`/emotion/profile?user_id=${user_id}&force_refresh=${force_refresh}`)
  },

  /**
   * 获取情绪趋势
   */
  async getEmotionTrend(
    user_id: string,
    days: number = 7
  ): Promise<ApiResponse<any>> {
    return request(`/emotion/trend?user_id=${user_id}&days=${days}`)
  },

  /**
   * 获取情绪摘要
   */
  async getEmotionSummary(
    user_id: string,
    days: number = 1
  ): Promise<ApiResponse<any>> {
    return request(`/emotion/summary?user_id=${user_id}&days=${days}`)
  },

  // ========== 进度相关 API ==========

  /**
   * 记录进度
   */
  async logProgress(payload: ProgressLog): Promise<ApiResponse<ProgressEntry>> {
    return request<ProgressEntry>('/progress/log', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  /**
   * 获取进度列表
   */
  async getProgressLogs(
    user_id: string,
    page: number = 1,
    pageSize: number = 20,
    dateRange?: { start?: string; end?: string },
    tag?: string
  ): Promise<ApiResponse<ProgressEntry[]>> {
    const params = new URLSearchParams({
      user_id,
      page: String(page),
      limit: String(pageSize),
    })

    if (dateRange?.start) params.append('start_date', dateRange.start)
    if (dateRange?.end) params.append('end_date', dateRange.end)
    if (tag) params.append('tags', tag)

    return request<ProgressEntry[]>(`/progress/logs?${params.toString()}`)
  },

  /**
   * 获取进度摘要
   */
  async getProgressSummary(
    user_id: string,
    days: number = 14
  ): Promise<ApiResponse<ProgressSummary>> {
    return request<ProgressSummary>(`/progress/summary?user_id=${user_id}&days=${days}`)
  },

  /**
   * 更新进度
   */
  async updateProgress(
    entry_id: string,
    status: string,
    note?: string
  ): Promise<ApiResponse<ProgressEntry>> {
    return request<ProgressEntry>('/progress/update', {
      method: 'POST',
      body: JSON.stringify({ entry_id, status, note }),
    })
  },

  // ========== 干预计划相关 API ==========

  /**
   * 生成干预计划
   */
  async generateInterventionPlan(
    user_id: string,
    goal: string,
    focus_scene?: string,
    duration_days: number = 7,
    auto_match_template: boolean = true
  ): Promise<ApiResponse<InterventionPlan>> {
    return request<InterventionPlan>('/intervention/plan', {
      method: 'POST',
      body: JSON.stringify({
        user_id,
        goal,
        focus_scene,
        duration_days,
        auto_match_template,
      }),
    })
  },

  /**
   * 获取干预计划列表
   */
  async getInterventionPlans(
    user_id: string,
    limit: number = 10
  ): Promise<ApiResponse<InterventionPlan[]>> {
    return request<InterventionPlan[]>(`/intervention/plans?user_id=${user_id}&limit=${limit}`)
  },

  /**
   * 更新干预计划进度
   */
  async updateInterventionProgress(
    plan_id: string,
    status: string,
    note?: string
  ): Promise<ApiResponse<any>> {
    return request('/intervention/plan/progress', {
      method: 'POST',
      body: JSON.stringify({ plan_id, status, note }),
    })
  },

  // ========== 陪伴对话相关 API ==========

  /**
   * AI对话
   */
  async chatCompanion(
    message: string,
    user_id?: string,
    context?: { hasImage?: boolean; timestamp?: string }
  ): Promise<ApiResponse<CompanionChatResponse>> {
    return request<CompanionChatResponse>('/companion/chat', {
      method: 'POST',
      body: JSON.stringify({
        user_id,
        message,
        context,
      }),
    })
  },

  // ========== 社交解码相关 API ==========

  /**
   * 解码社交信号
   */
  async decodeSocialSignal(
    text: string,
    user_id?: string,
    use_ai: boolean = false,
    save_log: boolean = false
  ): Promise<ApiResponse<any>> {
    return request('/decoder/decode', {
      method: 'POST',
      body: JSON.stringify({
        text,
        user_id,
        use_ai,
        save_log,
      }),
    })
  },

  // ========== 实时情绪相关 API ==========

  /**
   * 分析实时情绪
   */
  async analyzeRealtimeEmotion(
    payload: {
      user_id?: string
      text?: string
      voice_features?: any
      face_features?: any
    },
    fusion_strategy?: string,
    fusion_weights?: Record<string, number>
  ): Promise<ApiResponse<any>> {
    const params = new URLSearchParams()
    if (fusion_strategy) params.append('fusion_strategy', fusion_strategy)
    if (fusion_weights) params.append('fusion_weights', JSON.stringify(fusion_weights))

    const queryString = params.toString()
    const url = `/realtime/analyze${queryString ? `?${queryString}` : ''}`

    return request(url, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  // ========== 人脸识别相关 API（保留原有接口）==========

  /**
   * 分析人脸
   */
  async analyzeFace(dataUrl: string): Promise<ApiResponse<{ has_face: boolean }>> {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken')
      if (!token) return { error: '401' }
      // Placeholder face detection: treat any non-empty dataURL as having a face
      const has_face = !!dataUrl && dataUrl.length > 100
      return { data: { has_face } }
    } catch (e: any) {
      return { error: e?.message || 'face_error' }
    }
  },

  /**
   * 分析微表情
   */
  async analyzeMicroExpression(
    dataUrl: string,
    expected: string
  ): Promise<ApiResponse<{ matched_expected: boolean }>> {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken')
      if (!token) return { error: '401' }
      // Placeholder micro expression recognition: pseudo-random but deterministic on expected
      const seed = (expected || '').length + (dataUrl?.length || 0)
      const matched_expected = seed % 2 === 0
      return { data: { matched_expected } }
    } catch (e: any) {
      return { error: e?.message || 'micro_error' }
    }
  },

  // ========== 康复监测相关 API ==========

  /**
   * 获取详细的进度统计数据
   */
  async getRecoveryStatistics(
    user_id: string,
    days: number = 30
  ): Promise<ApiResponse<any>> {
    return request(`/recovery/statistics?user_id=${user_id}&days=${days}`)
  },

  /**
   * 获取成长曲线数据
   */
  async getGrowthCurve(
    user_id: string,
    days: number = 30,
    metric: string = 'completion'
  ): Promise<ApiResponse<any>> {
    return request(`/recovery/growth-curve?user_id=${user_id}&days=${days}&metric=${metric}`)
  },

  /**
   * 获取活动记录
   */
  async getActivityRecords(
    user_id: string,
    limit: number = 50,
    category?: string
  ): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({
      user_id,
      limit: limit.toString(),
    })
    if (category) params.append('category', category)

    return request(`/recovery/activities?${params.toString()}`)
  },

  /**
   * 获取成就徽章
   */
  async getAchievements(user_id: string): Promise<ApiResponse<any>> {
    return request(`/recovery/achievements?user_id=${user_id}`)
  },
}

export default apiClient

