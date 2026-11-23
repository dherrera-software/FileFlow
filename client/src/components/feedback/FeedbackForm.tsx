import { useState, useId, type FormEvent } from 'react'
import { AlertCircle, Check, LogOut, Send, ShieldCheck, Star } from 'lucide-react'
import { useTranslation } from '../../i18n/context'
import { cn } from '../../utils/cn'
import type { CommunityUser, FeedbackCategory } from '../../types/feedback'
import { GoogleLogo } from './GoogleLogo'

interface FeedbackFormProps {
  user: CommunityUser | null
  isAdmin: boolean
  onSignOut: () => void
  onOpenAuth: () => void
  onSubmitComment: (category: FeedbackCategory, rating: number, text: string) => void
}

export function FeedbackForm({
  user,
  isAdmin,
  onSignOut,
  onOpenAuth,
  onSubmitComment,
}: FeedbackFormProps) {
  const { t } = useTranslation()
  const formId = useId()
  const [category, setCategory] = useState<FeedbackCategory>('general')
  const [rating, setRating] = useState<number>(5)
  const [commentText, setCommentText] = useState('')
  const [formError, setFormError] = useState('')

  const categoryLabels: Record<FeedbackCategory, string> = {
    suggestion: t('feedback.filterSuggestions') || 'Sugerencia',
    general: t('feedback.filterGeneral') || 'General',
    desktop: t('feedback.filterDesktop') || 'Desktop',
    bug: t('feedback.filterBugs') || 'Problema',
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (!user) {
      onOpenAuth()
      return
    }

    const trimmedText = commentText.trim()
    if (trimmedText.length < 10) {
      setFormError(t('feedback.errorInvalidComment') || 'Por favor ingresa un comentario de al menos 10 caracteres.')
      return
    }

    onSubmitComment(category, rating, trimmedText)
    setCommentText('')
    setRating(5)
  }

  return (
    <div className="rounded-2xl border border-line bg-surface-raised p-6 shadow-sm lg:col-span-5">
      {/* Auth status header */}
      {user ? (
        <div className="flex flex-col gap-3 border-b border-line pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'relative flex size-10 shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white',
                  user.avatarColor,
                )}
              >
                {user.name.charAt(0).toUpperCase()}
                <span
                  className="absolute -bottom-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full border border-surface bg-surface"
                  title="Gmail Verificado"
                >
                  <GoogleLogo className="size-2.5" />
                </span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-[13px] font-semibold text-ink">{user.name}</p>
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[9.5px] font-medium text-emerald-600 dark:text-emerald-400">
                    <Check className="size-2.5" /> Gmail
                  </span>
                </div>
                <p className="truncate font-mono text-[11px] text-ink-subtle">@{user.username}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onSignOut}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1 text-[11.5px] text-ink-subtle transition-colors hover:border-line-strong hover:text-ink"
              title={t('feedback.signOut') || 'Cerrar sesión'}
            >
              <LogOut className="size-3" aria-hidden="true" />
              <span>{t('feedback.signOut') || 'Salir'}</span>
            </button>
          </div>

          {/* Admin badge */}
          {isAdmin && (
            <div className="flex items-center gap-2 rounded-lg border border-accent-line/50 bg-accent-soft/40 px-3 py-1.5 text-[11.5px] text-accent">
              <ShieldCheck className="size-4 shrink-0" />
              <span>
                Modo Administrador activo: Tienes permisos para marcar sugerencias y problemas como solucionados.
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-accent-line bg-accent-soft p-4">
          <div className="flex items-start gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface shadow-sm">
              <GoogleLogo className="size-4" />
            </span>
            <div>
              <h3 className="text-[13px] font-medium text-ink">
                {t('feedback.connectPromptTitle') || 'Conexión requerida para comentar'}
              </h3>
              <p className="mt-1 text-[12px] leading-[1.6] text-ink-muted">
                {t('feedback.connectPromptBody') ||
                  'Para validar tu conexión y proteger la comunidad, conéctate con Gmail y crea tu usuario.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenAuth}
            className="mt-3.5 flex w-full items-center justify-center gap-2 rounded-full border border-line bg-surface px-4 py-2.5 text-[12.5px] font-medium text-ink shadow-sm transition-[transform,background-color] hover:bg-surface-sunken active:scale-[0.98]"
          >
            <GoogleLogo className="size-4 shrink-0" />
            <span>{t('feedback.connectGoogle') || 'Conectar con Google / Gmail'}</span>
          </button>
        </div>
      )}

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        {/* Category picker */}
        <div>
          <label
            htmlFor={`${formId}-category`}
            className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.1em] text-ink-subtle"
          >
            {t('feedback.categoryLabel') || 'Categoría'}
          </label>
          <div className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(['general', 'suggestion', 'desktop', 'bug'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={cn(
                  'rounded-lg border px-2 py-1.5 text-center text-[11.5px] font-medium transition-colors',
                  category === cat
                    ? 'border-accent-line bg-accent-soft text-accent'
                    : 'border-line bg-surface text-ink-subtle hover:border-line-strong hover:text-ink',
                )}
              >
                {categoryLabels[cat]}
              </button>
            ))}
          </div>
        </div>

        {/* Rating picker */}
        <div>
          <div className="flex items-center justify-between">
            <label className="font-mono text-[10.5px] font-medium uppercase tracking-[0.1em] text-ink-subtle">
              {t('feedback.ratingLabel') || 'Calificación'}
            </label>
            <span className="font-mono text-[11px] text-ink-subtle">{rating} de 5 estrellas</span>
          </div>
          <div className="mt-1.5 flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                aria-label={`${star} estrellas`}
                className="rounded p-1 transition-transform hover:scale-110 focus:outline-none"
              >
                <Star
                  className={cn(
                    'size-5 transition-colors',
                    star <= rating
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-line-strong hover:text-amber-300',
                  )}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Textarea */}
        <div>
          <textarea
            id={`${formId}-comment`}
            rows={4}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={
              t('feedback.commentPlaceholder') ||
              'Escribe tu opinión, sugerencia o experiencia con FileFlow (web o Desktop)...'
            }
            className="w-full rounded-xl border border-line bg-surface p-3 text-[13px] text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
          <div className="mt-1 flex items-center justify-between text-[11px] text-ink-subtle">
            <span>{t('feedback.charLimit') || 'mínimo 10 caracteres'}</span>
            <span>{commentText.length} / 500 caracteres</span>
          </div>
        </div>

        {formError && (
          <div className="flex items-center gap-2 text-[12px] text-danger">
            <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
            <span>{formError}</span>
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-full border border-accent-line bg-accent-fill py-2.5 text-[13px] font-medium text-accent-on shadow-primary transition-all hover:brightness-110 active:scale-[0.98]"
        >
          <Send className="size-3.5" aria-hidden="true" />
          <span>{t('feedback.submitBtn') || 'Publicar comentario'}</span>
        </button>
      </form>
    </div>
  )
}
