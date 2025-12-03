// 重新导出统一的API客户端
export { apiClient, apiClient as default } from './api-client'

// 保留向后兼容的接口
export const apiClientLegacy = {
  async analyzeFace(dataUrl: string): Promise<{ error?: string; data?: { has_face: boolean } }> {
    const { apiClient } = await import('./api-client')
    return apiClient.analyzeFace(dataUrl)
  },
  async analyzeMicroExpression(dataUrl: string, expected: string): Promise<{ error?: string; data?: { matched_expected: boolean } }> {
    const { apiClient } = await import('./api-client')
    return apiClient.analyzeMicroExpression(dataUrl, expected)
  }
}
