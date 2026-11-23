import { Check, Star, Trash2 } from 'lucide-react'
import { useTranslation } from '../../i18n/context'
import { cn } from '../../utils/cn'
import type { CommunityComment, CommunityUser, FeedbackCategory } from '../../types/feedback'
import { timeAgo } from '../../types/feedback'
import { GoogleLogo } from './GoogleLogo'

interface CommentCardProps {
  comment: CommunityComment
  user: CommunityUser | null
  isAdmin: boolean
  isDeleting: boolean
  onDelete: (id: string) => void
}

export function CommentCard({
  comment,
  user,
  isAdmin,
  isDeleting,
  onDelete,
}: CommentCardProps) {
  const { t } = useTranslation()
  const isAuthor = Boolean(user && user.email.toLowerCase() === comment.author.email.toLowerCase())
  const canDelete = isAdmin || isAuthor

  const categoryLabels: Record<FeedbackCategory, string> = {
    suggestion: t('feedback.filterSuggestions') || 'Sugerencia',
    general: t('feedback.filterGeneral') || 'General',
    desktop: t('feedback.filterDesktop') || 'Desktop',
    bug: t('feedback.filterBugs') || 'Problema',
  }

  return (
    <article
      className={cn(
        'rounded-xl border p-4 transition-colors',
        isAuthor
          ? 'border-accent-line/60 bg-accent-soft/30'
          : 'border-line bg-surface-raised hover:border-line-strong',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {/* Avatar */}
          <div
            className={cn(
              'relative flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white',
              comment.author.avatarColor || 'bg-accent',
            )}
          >
            {comment.author.name.charAt(0).toUpperCase()}
            {comment.isVerifiedGmail && (
              <span
                className="absolute -bottom-0.5 -right-0.5 flex size-3.5 items-center justify-center rounded-full border border-surface bg-surface"
                title="Gmail verificado"
              >
                <GoogleLogo className="size-2" />
              </span>
            )}
          </div>

          {/* Author info */}
          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[12.5px] font-semibold text-ink">
                {comment.author.name}
              </span>
              <span className="font-mono text-[11px] text-ink-subtle">
                @{comment.author.username}
              </span>
              {comment.isVerifiedGmail && (
                <span
                  className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[9px] text-emerald-600 dark:text-emerald-400"
                  title="Verificado vía conexión con Gmail"
                >
                  <Check className="size-2" /> Gmail
                </span>
              )}
              {isAuthor && (
                <span className="rounded-full bg-accent-fill px-1.5 py-0.5 font-mono text-[9px] text-accent-on">
                  {t('feedback.youBadge') || 'Tú'}
                </span>
              )}
            </div>
            <span className="font-mono text-[10px] text-ink-faint">
              {timeAgo(comment.createdAt)}
            </span>
          </div>
        </div>

        {/* Category & stars */}
        <div className="flex flex-col items-end gap-1">
          <span className="rounded-md border border-line bg-surface px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.08em] text-ink-subtle">
            {categoryLabels[comment.category]}
          </span>
          <div className="flex items-center gap-0.5" aria-label={`${comment.rating} estrellas`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'size-3',
                  i < comment.rating
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-line-strong',
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Comment text */}
      <p className="mt-3 text-[12.5px] leading-[1.65] text-ink-muted">
        {comment.text}
      </p>

      {/* Admin / Author Action Bar */}
      {canDelete && (
        <div className="mt-3.5 flex items-center justify-end border-t border-line/60 pt-2.5">
          <button
            type="button"
            onClick={() => onDelete(comment.id)}
            disabled={isDeleting}
            className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 py-1 text-[11px] font-medium text-ink-subtle transition-colors hover:border-danger/40 hover:bg-danger/10 hover:text-danger active:scale-95 disabled:opacity-50"
            title={
              isAdmin
                ? 'Marcar problema/sugerencia como resuelto y eliminar de Cloudflare D1'
                : 'Eliminar mi comentario'
            }
          >
            <Trash2 className="size-3" aria-hidden="true" />
            <span>
              {isDeleting
                ? 'Eliminando...'
                : isAdmin
                  ? 'Marcar solucionado / Eliminar'
                  : 'Eliminar'}
            </span>
          </button>
        </div>
      )}
    </article>
  )
}
