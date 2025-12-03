export type SocialOption = {
  id: string
  text: string
  correct: boolean
  explanation: string
}

export type IconResource = {
  name: string
  svg: string
}

export type Rating = {
  stars: number // 0–5，允许半星，如 4.5
  votes: number
}

export type AnimationConfig = {
  enterDuration: number // ms
  enterEasing: string // CSS easing
  highlightDuration: number // ms
  highlightEasing: string
  trigger: 'onOptionSelect' | 'onSubmit' | 'onResult'
}

export type SocialScenario = {
  id: string
  title: string
  description: string
  categories: string[] // 多层级分类
  difficulty: '简单' | '中等' | '困难'
  ageRange: '3-6' | '7-10' | '11-14'
  icon: IconResource
  rating: Rating
  animationConfig: AnimationConfig
  options: SocialOption[]
}

// 高质量简洁 SVG 图标资源（优化为小体积、可着色）
const ICONS = {
  playground: {
    name: 'playground',
    svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 17h18" stroke="#4f46e5" stroke-width="2" stroke-linecap="round"/><path d="M7 17V8l5-3 5 3v9" stroke="#4f46e5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
  },
  classroom: {
    name: 'classroom',
    svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="5" width="18" height="12" rx="2" stroke="#10b981" stroke-width="2"/><path d="M7 9h10" stroke="#10b981" stroke-width="2" stroke-linecap="round"/></svg>`
  },
  handshake: {
    name: 'handshake',
    svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 12l3 3 5-5" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 12l6-6 4 4 4-4 6 6" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/></svg>`
  },
  emotion: {
    name: 'emotion',
    svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" stroke="#ef4444" stroke-width="2"/><circle cx="9" cy="10" r="1" fill="#ef4444"/><circle cx="15" cy="10" r="1" fill="#ef4444"/><path d="M8 15c1.5-1 2.5-1 4 0 1.5 1 2.5 1 4 0" stroke="#ef4444" stroke-width="2" stroke-linecap="round"/></svg>`
  },
  conflict: {
    name: 'conflict',
    svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2l2.5 5 5 2.5-5 2.5-2.5 5-2.5-5-5-2.5 5-2.5L12 2z" stroke="#3b82f6" stroke-width="2"/></svg>`
  },
  family: {
    name: 'family',
    svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="3" stroke="#8b5cf6" stroke-width="2"/><circle cx="16" cy="8" r="3" stroke="#8b5cf6" stroke-width="2"/><path d="M3 20c1.5-4 6-6 9-6s7.5 2 9 6" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round"/></svg>`
  },
  etiquette: {
    name: 'etiquette',
    svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 6h16v12H4z" stroke="#22c55e" stroke-width="2"/><path d="M6 9h12" stroke="#22c55e" stroke-width="2" stroke-linecap="round"/></svg>`
  }
} as const

export const socialScenarios: SocialScenario[] = [
  {
    id: 's1',
    title: '在操场上交朋友',
    description: '有小朋友在玩球，你可以怎么做？',
    categories: ['社交入门','友谊建立'],
    difficulty: '简单',
    ageRange: '3-6',
    icon: ICONS.playground,
    rating: { stars: 4.6, votes: 128 },
    animationConfig: { enterDuration: 300, enterEasing: 'cubic-bezier(0.4,0,0.2,1)', highlightDuration: 250, highlightEasing: 'ease-out', trigger: 'onOptionSelect' },
    options: [
      { id: 'a1', text: '走过去说：我们一起玩好吗？', correct: true, explanation: '主动友好邀请能够建立联系' },
      { id: 'a2', text: '站在远处一直看着他们', correct: false, explanation: '需要表达自己的想法才能参与' },
      { id: 'a3', text: '抢走他们的球', correct: false, explanation: '不礼貌的行为会让别人不愿意合作' }
    ]
  },
  {
    id: 's2',
    title: '课堂发言',
    description: '老师提问时你想发言，该怎么做？',
    categories: ['课堂礼仪','规则意识'],
    difficulty: '中等',
    ageRange: '7-10',
    icon: ICONS.classroom,
    rating: { stars: 4.2, votes: 96 },
    animationConfig: { enterDuration: 300, enterEasing: 'ease', highlightDuration: 200, highlightEasing: 'ease-in-out', trigger: 'onSubmit' },
    options: [
      { id: 'b1', text: '举手等待老师点名后发言', correct: true, explanation: '遵守课堂规则是良好社交的表现' },
      { id: 'b2', text: '直接大声说出答案', correct: false, explanation: '需要尊重他人的发言秩序' },
      { id: 'b3', text: '不说话', correct: false, explanation: '试着表达你的想法，更容易被理解' }
    ]
  },
  {
    id: 's3',
    title: '合作完成任务',
    description: '小组活动中同伴意见不同，怎么办？',
    categories: ['合作与沟通','团队协作'],
    difficulty: '困难',
    ageRange: '11-14',
    icon: ICONS.handshake,
    rating: { stars: 4.8, votes: 211 },
    animationConfig: { enterDuration: 320, enterEasing: 'ease-out', highlightDuration: 280, highlightEasing: 'ease-in', trigger: 'onResult' },
    options: [
      { id: 'c1', text: '倾听并提出折中方案', correct: true, explanation: '合作需要倾听与协调，寻找共同点' },
      { id: 'c2', text: '坚持己见不改变', correct: false, explanation: '过于固执会影响团队完成任务' },
      { id: 'c3', text: '退出小组活动', correct: false, explanation: '可以尝试沟通再做决定' }
    ]
  },
  {
    id: 's4',
    title: '表达情绪',
    description: '当你难过时，如何向朋友表达？',
    categories: ['情绪表达','同理心'],
    difficulty: '中等',
    ageRange: '7-10',
    icon: ICONS.emotion,
    rating: { stars: 4.5, votes: 167 },
    animationConfig: { enterDuration: 280, enterEasing: 'ease-in-out', highlightDuration: 300, highlightEasing: 'cubic-bezier(0.42,0,0.58,1)', trigger: 'onSubmit' },
    options: [
      { id: 'd1', text: '告诉朋友你的感受并寻求安慰', correct: true, explanation: '表达并寻求支持能加强关系' },
      { id: 'd2', text: '独自躲起来不说话', correct: false, explanation: '适当表达能获得帮助与理解' },
      { id: 'd3', text: '对朋友发脾气', correct: false, explanation: '发脾气会伤害彼此的感情' }
    ]
  },
  {
    id: 's5',
    title: '解决冲突',
    description: '和同学意见不合时如何处理？',
    categories: ['冲突解决','沟通技巧'],
    difficulty: '困难',
    ageRange: '11-14',
    icon: ICONS.conflict,
    rating: { stars: 4.1, votes: 89 },
    animationConfig: { enterDuration: 260, enterEasing: 'ease', highlightDuration: 260, highlightEasing: 'ease', trigger: 'onResult' },
    options: [
      { id: 'e1', text: '冷静讨论并找到共同点', correct: true, explanation: '理性沟通能快速达成一致' },
      { id: 'e2', text: '忽略对方并离开', correct: false, explanation: '忽略不利于解决问题' },
      { id: 'e3', text: '坚持自己观点不让步', correct: false, explanation: '适当让步是达成共识的关键' }
    ]
  },
  {
    id: 's6',
    title: '家庭合作',
    description: '和家人一起做家务，如何分工？',
    categories: ['家庭互动','责任意识'],
    difficulty: '简单',
    ageRange: '3-6',
    icon: ICONS.family,
    rating: { stars: 4.7, votes: 142 },
    animationConfig: { enterDuration: 240, enterEasing: 'ease-out', highlightDuration: 220, highlightEasing: 'ease-in', trigger: 'onOptionSelect' },
    options: [
      { id: 'f1', text: '和家人商量分工并互相配合', correct: true, explanation: '沟通协作能快速完成任务' },
      { id: 'f2', text: '只做自己想做的部分', correct: false, explanation: '家务需要合作与承担' },
      { id: 'f3', text: '不参与家务', correct: false, explanation: '参与家务能培养责任心' }
    ]
  },
  {
    id: 's7',
    title: '公共场所礼仪',
    description: '在图书馆如何与朋友交流？',
    categories: ['公共场所礼仪','规则意识'],
    difficulty: '中等',
    ageRange: '7-10',
    icon: ICONS.etiquette,
    rating: { stars: 4.3, votes: 101 },
    animationConfig: { enterDuration: 300, enterEasing: 'ease', highlightDuration: 220, highlightEasing: 'ease', trigger: 'onSubmit' },
    options: [
      { id: 'g1', text: '用轻声或在馆外交流', correct: true, explanation: '尊重公共环境规则是良好礼仪' },
      { id: 'g2', text: '在馆内大声说话', correct: false, explanation: '会影响他人学习与阅读' },
      { id: 'g3', text: '和朋友一起玩耍', correct: false, explanation: '图书馆不适合玩耍' }
    ]
  }
]

export function getScenariosByAge(age: SocialScenario['ageRange'] | '全部'): SocialScenario[] {
  if (age === '全部') return socialScenarios
  return socialScenarios.filter(s => s.ageRange === age)
}

export function getScenariosByDifficulty(diff: SocialScenario['difficulty'] | '全部'): SocialScenario[] {
  if (diff === '全部') return socialScenarios
  return socialScenarios.filter(s => s.difficulty === diff)
}

export function updateRating(current: Rating, newStars: number): Rating {
  const total = current.stars * current.votes + newStars
  const votes = current.votes + 1
  return { stars: parseFloat((total / votes).toFixed(2)), votes }
}
