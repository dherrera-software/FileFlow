export interface CommunityUser {
  email: string
  name: string
  username: string
  avatarColor: string
  connectedAt: number
}

export type FeedbackCategory = 'suggestion' | 'general' | 'desktop' | 'bug'

export interface CommunityComment {
  id: string
  author: {
    name: string
    username: string
    email: string
    avatarColor: string
  }
  category: FeedbackCategory
  rating: number
  text: string
  createdAt: number
  isVerifiedGmail: boolean
}

export const STORAGE_USER_KEY = 'fileflow_community_user'
export const STORAGE_COMMENTS_KEY = 'fileflow_community_comments'

export const AVATAR_COLORS = [
  'bg-emerald-600',
  'bg-sky-600',
  'bg-indigo-600',
  'bg-amber-600',
  'bg-rose-600',
  'bg-cyan-600',
  'bg-violet-600',
]

export function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 60) return 'Hace un momento'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `Hace ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Hace ${hours} h`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Ayer'
  if (days < 30) return `Hace ${days} d`
  return new Date(timestamp).toLocaleDateString()
}
