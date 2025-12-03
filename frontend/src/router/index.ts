import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/Login.vue'
import CompanionPage from '@/views/CompanionPage.vue'
import CompanionHome from '@/views/CompanionHome.vue'
import SocialDecoder from '@/views/SocialDecoder.vue'
import EmotionRecognition from '@/views/EmotionRecognition.vue'
import SocialActivities from '@/views/SocialActivities.vue'
import RecoveryMonitoring from '@/views/RecoveryMonitoring.vue'
import Profile from '@/views/Profile.vue'
import Settings from '@/views/Settings.vue'
import ProfileEdit from '@/views/ProfileEdit.vue'
import ProfileNotifications from '@/views/ProfileNotifications.vue'
import HelpCenter from '@/views/HelpCenter.vue'
import PrivacySecurity from '@/views/PrivacySecurity.vue'
import VideoCall from '@/views/VideoCall.vue'
import ParentDashboard from '@/views/ParentDashboard.vue'
import RecoveryProgress from '@/views/RecoveryProgress.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/dashboard/:mode?',
    name: 'Dashboard',
    component: CompanionHome,
    meta: { requiresAuth: true }
  },
  {
    path: '/companion',
    name: 'Companion',
    component: CompanionPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/social-decoder/:mode?',
    name: 'SocialDecoder',
    component: SocialDecoder,
    meta: { requiresAuth: true }
  },
  {
    path: '/emotion-game',
    name: 'EmotionRecognition',
    component: EmotionRecognition,
    meta: { requiresAuth: true }
  },
  {
    path: '/social-game/activities',
    name: 'SocialActivities',
    component: SocialActivities,
    meta: { requiresAuth: true }
  },
  {
    path: '/recovery-monitoring',
    name: 'RecoveryMonitoring',
    component: RecoveryMonitoring,
    meta: { requiresAuth: true }
  },
  {
    path: '/recovery-progress',
    name: 'RecoveryProgress',
    component: RecoveryProgress,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile/edit',
    name: 'ProfileEdit',
    component: ProfileEdit,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile/notifications',
    name: 'ProfileNotifications',
    component: ProfileNotifications,
    meta: { requiresAuth: true }
  }
  ,{
    path: '/help',
    name: 'HelpCenter',
    component: HelpCenter,
    meta: { requiresAuth: true }
  }
  ,{
    path: '/privacy-security',
    name: 'PrivacySecurity',
    component: PrivacySecurity,
    meta: { requiresAuth: true }
  }
  ,{
    path: '/video-call',
    name: 'VideoCall',
    component: VideoCall,
    meta: { requiresAuth: true }
  }
  ,{
    path: '/new-video-call',
    name: 'NewVideoCall',
    component: () => import('@/views/NewVideoCall.vue'),
    meta: { title: '视频通话' }
  }
  ,{
    path: '/parent-dashboard',
    name: 'ParentDashboard',
    component: ParentDashboard,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 统一前端路由权限控制
router.beforeEach((to, from, next) => {
  void from
  const requiresAuth = to.matched.some(r => (r.meta as any)?.requiresAuth)
  const loggedIn = !!localStorage.getItem('token') || !!sessionStorage.getItem('启明星-user')
  if (requiresAuth && !loggedIn) {
    next({ path: '/login', query: { redirect: to.fullPath } })
    return
  }
  next()
})

export default router
