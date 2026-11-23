import { useState, useEffect } from 'react'
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronDown,
  MessageSquare,
  Star,
} from 'lucide-react'
import { useTranslation } from '../i18n/context'
import { cn } from '../utils/cn'
import {
  getCommunityComments,
  postCommunityComment,
  deleteCommunityComment,
  checkIsAdmin,
} from '../services/feedbackApi'
import type {
  CommunityUser,
  CommunityComment,
  FeedbackCategory,
} from '../types/feedback'
import {
  STORAGE_USER_KEY,
  STORAGE_COMMENTS_KEY,
} from '../types/feedback'
import { FeedbackAuthModal } from './feedback/FeedbackAuthModal'
import { FeedbackForm } from './feedback/FeedbackForm'
import { CommentCard } from './feedback/CommentCard'
import { CommentFeedHeader } from './feedback/CommentFeedHeader'

export type { CommunityUser, CommunityComment }

export function FeedbackSection({
  isStandalone = false,
  onBack,
}: {
  isStandalone?: boolean
  onBack?: () => void
} = {}) {
  const { t } = useTranslation()

  // User state
  const [user, setUser] = useState<CommunityUser | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_USER_KEY)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  // Comments state (inicialmente vacío, sin datos semilla)
  const [comments, setComments] = useState<CommunityComment[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_COMMENTS_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        return Array.isArray(parsed)
          ? parsed.filter((c: CommunityComment) => !c.id.startsWith('seed-'))
          : []
      }
      return []
    } catch {
      return []
    }
  })

  // Modal & Auth flow
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Filter & Feed state
  const [selectedFilter, setSelectedFilter] = useState<'all' | FeedbackCategory>('all')
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [visibleLimit, setVisibleLimit] = useState<number>(10)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [alertNotice, setAlertNotice] = useState<{ type: 'success' | 'info'; message: string } | null>(null)
  const [isAdmin, setIsAdmin] = useState<boolean>(false)

  // Consultar rol de administrador al backend de forma segura
  useEffect(() => {
    let mounted = true
    if (user?.email) {
      checkIsAdmin(user.email).then((status) => {
        if (mounted) setIsAdmin(status)
      })
    } else {
      setIsAdmin(false)
    }
    return () => {
      mounted = false
    }
  }, [user?.email])

  // Cargar comentarios reales desde Cloudflare D1
  useEffect(() => {
    let mounted = true
    getCommunityComments('all', 50).then((remoteComments) => {
      if (mounted) {
        const clean = (remoteComments || []).filter((c) => !c.id.startsWith('seed-'))
        setComments(clean)
        try {
          localStorage.setItem(STORAGE_COMMENTS_KEY, JSON.stringify(clean))
        } catch {
          // ignore
        }
      }
    })
    return () => {
      mounted = false
    }
  }, [])

  // Persistir usuario
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user))
      } else {
        localStorage.removeItem(STORAGE_USER_KEY)
      }
    } catch {
      // storage unavailable
    }
  }, [user])

  // Handle Comment Submission
  const handleCommentSubmit = (
    category: FeedbackCategory,
    rating: number,
    text: string,
  ) => {
    if (!user) {
      setIsModalOpen(true)
      return
    }

    const newComment: CommunityComment = {
      id: 'cmt-' + Date.now(),
      author: {
        name: user.name,
        username: user.username,
        email: user.email,
        avatarColor: user.avatarColor,
      },
      category,
      rating,
      text,
      createdAt: Date.now(),
      isVerifiedGmail: true,
    }

    setComments((prev) => [newComment, ...prev])
    setShowSuccessToast(true)
    setTimeout(() => setShowSuccessToast(false), 4000)

    postCommunityComment(newComment).catch(() => {})
  }

  // Eliminar comentario resuelto/atendido
  const handleDeleteComment = async (commentId: string) => {
    if (!user) return
    const confirmed = window.confirm(
      isAdmin
        ? '¿Marcar este problema/sugerencia como resuelto y eliminar el comentario de la base de datos?'
        : '¿Deseas eliminar tu comentario?',
    )
    if (!confirmed) return

    setDeletingId(commentId)
    const success = await deleteCommunityComment(commentId, user.email)
    setDeletingId(null)

    if (success) {
      setComments((prev) => prev.filter((c) => c.id !== commentId))
      setAlertNotice({
        type: 'success',
        message: isAdmin
          ? 'Comentario resuelto y eliminado de Cloudflare D1 con éxito.'
          : 'Comentario eliminado.',
      })
      setTimeout(() => setAlertNotice(null), 4000)
    } else {
      setAlertNotice({
        type: 'info',
        message: 'No se pudo eliminar el comentario. Revisa los permisos o la conexión.',
      })
      setTimeout(() => setAlertNotice(null), 4000)
    }
  }

  const filteredComments =
    selectedFilter === 'all' ? comments : comments.filter((c) => c.category === selectedFilter)

  const visibleComments = filteredComments.slice(0, visibleLimit)

  const avgRating =
    comments.length > 0
      ? (comments.reduce((acc, curr) => acc + curr.rating, 0) / comments.length).toFixed(1)
      : '5.0'

  return (
    <section
      id="feedback"
      aria-labelledby="feedback-heading"
      className={cn(
        'scroll-mt-24 border-y border-line bg-surface',
        isStandalone && 'min-h-[calc(100vh-140px)] border-y-0',
      )}
    >
      <div className="mx-auto max-w-[1180px] px-5 py-12 sm:px-8">
        {isStandalone && (
          <div className="mb-8 flex items-center justify-between">
            <button
              type="button"
              onClick={onBack || (() => { window.location.hash = '#/' })}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-surface-raised px-4 py-2 text-[12.5px] font-medium text-ink-muted transition-colors hover:border-line-strong hover:text-ink active:scale-[0.98]"
            >
              <ArrowLeft className="size-4 text-accent" />
              <span>{t('feedback.backToConverter') || 'Volver al conversor principal'}</span>
            </button>

            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-subtle">
              FileFlow Community · Cloudflare D1
            </span>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="eyebrow inline-flex items-center gap-2">
              <MessageSquare className="size-3.5 text-accent" aria-hidden="true" />
              {t('feedback.eyebrow') || 'Comunidad y opiniones'}
            </p>
            <h2
              id="feedback-heading"
              className="mt-3 text-[28px] font-medium tracking-[-0.03em] text-ink sm:text-[34px]"
            >
              {t('feedback.title') || '¿Qué te parece FileFlow? Déjanos tus comentarios'}
            </h2>
            <p className="mt-3 max-w-[62ch] text-[14px] leading-[1.65] text-ink-muted">
              {t('feedback.description') ||
                'Conéctate con tu cuenta de Gmail, crea tu usuario y comparte tu opinión o sugerencias para seguir mejorando la herramienta.'}
            </p>
          </div>

          {/* Stats pills */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-line bg-surface-raised px-4 py-2.5">
              <span className="flex size-7 items-center justify-center rounded-lg bg-accent-soft text-accent">
                <Star className="size-4 fill-accent" aria-hidden="true" />
              </span>
              <div>
                <p className="font-mono text-[13px] font-semibold text-ink">
                  {comments.length > 0 ? avgRating : '—'} / 5
                </p>
                <p className="text-[10px] uppercase tracking-[0.1em] text-ink-subtle">
                  {t('feedback.statsRating') || 'Valoración'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-line bg-surface-raised px-4 py-2.5">
              <span className="flex size-7 items-center justify-center rounded-lg bg-surface text-ink">
                <MessageSquare className="size-4" aria-hidden="true" />
              </span>
              <div>
                <p className="font-mono text-[13px] font-semibold text-ink">{comments.length}</p>
                <p className="text-[10px] uppercase tracking-[0.1em] text-ink-subtle">
                  {t('feedback.statsComments') || 'Comentarios'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications banner */}
        {showSuccessToast && (
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-[13px] text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-500" aria-hidden="true" />
            <span>{t('feedback.commentSuccess') || '¡Tu comentario ha sido guardado en la base de datos con éxito!'}</span>
          </div>
        )}

        {alertNotice && (
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-accent-line bg-accent-soft px-4 py-3 text-[13px] text-ink">
            <Check className="size-4 shrink-0 text-accent" aria-hidden="true" />
            <span>{alertNotice.message}</span>
          </div>
        )}

        {/* Main Grid: Form on Left, Feed on Right */}
        <div className="mt-10 grid gap-8 lg:grid-cols-12 lg:items-start">
          <FeedbackForm
            user={user}
            isAdmin={isAdmin}
            onSignOut={() => setUser(null)}
            onOpenAuth={() => setIsModalOpen(true)}
            onSubmitComment={handleCommentSubmit}
          />

          {/* RIGHT: Comments Feed (7 cols) */}
          <div className="space-y-4 lg:col-span-7">
            <CommentFeedHeader
              comments={comments}
              selectedFilter={selectedFilter}
              onSelectFilter={setSelectedFilter}
              visibleLimit={visibleLimit}
              onSelectLimit={setVisibleLimit}
            />

            {filteredComments.length === 0 ? (
              <div className="rounded-2xl border border-line bg-surface-raised p-10 text-center">
                <MessageSquare className="mx-auto size-9 text-ink-faint" aria-hidden="true" />
                <p className="mt-3 text-[14px] font-medium text-ink">
                  Aún no hay comentarios publicados
                </p>
                <p className="mt-1.5 text-[12.5px] text-ink-subtle">
                  Sé el primero en compartir tu opinión o sugerencia sobre la app.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {visibleComments.map((comment) => (
                  <CommentCard
                    key={comment.id}
                    comment={comment}
                    user={user}
                    isAdmin={isAdmin}
                    isDeleting={deletingId === comment.id}
                    onDelete={handleDeleteComment}
                  />
                ))}

                {/* Footer del feed: contador y botón para cargar más */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 text-[12px] text-ink-subtle">
                  <span>
                    Mostrando {Math.min(visibleLimit, filteredComments.length)} de{' '}
                    {filteredComments.length} comentarios
                  </span>
                  {filteredComments.length > visibleLimit && (
                    <button
                      type="button"
                      onClick={() => setVisibleLimit((prev) => prev + 10)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-raised px-3.5 py-1.5 font-medium text-ink hover:border-line-strong"
                    >
                      <span>Cargar más comentarios (+10)</span>
                      <ChevronDown className="size-3.5 text-accent" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <FeedbackAuthModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={user}
        onUserCreated={setUser}
      />
    </section>
  )
}
