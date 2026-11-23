import { useState, type FormEvent } from 'react'
import { AlertCircle, Check, Sparkles, UserCheck, X } from 'lucide-react'
import { useTranslation } from '../../i18n/context'
import type { CommunityUser } from '../../types/feedback'
import { AVATAR_COLORS } from '../../types/feedback'
import { GoogleLogo } from './GoogleLogo'

interface FeedbackAuthModalProps {
  isOpen: boolean
  onClose: () => void
  user: CommunityUser | null
  onUserCreated: (user: CommunityUser) => void
}

export function FeedbackAuthModal({
  isOpen,
  onClose,
  user,
  onUserCreated,
}: FeedbackAuthModalProps) {
  const { t } = useTranslation()
  const [modalStep, setModalStep] = useState<1 | 2>(1)
  const [authEmail, setAuthEmail] = useState(user?.email || '')
  const [authName, setAuthName] = useState(user?.name || '')
  const [authUsername, setAuthUsername] = useState(user?.username || '')
  const [authError, setAuthError] = useState('')

  if (!isOpen) return null

  const handleQuickDemo = (email: string, name: string, username: string) => {
    setAuthEmail(email)
    setAuthName(name)
    setAuthUsername(username)
    setModalStep(2)
    setAuthError('')
  }

  const handleStep1Submit = (e: FormEvent) => {
    e.preventDefault()
    setAuthError('')
    const trimmedEmail = authEmail.trim().toLowerCase()
    const trimmedName = authName.trim()

    if (!trimmedEmail) {
      setAuthError(t('feedback.errorInvalidEmail') || 'Ingresa un correo de Gmail válido.')
      return
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|googlemail\.com)$/i
    if (!emailRegex.test(trimmedEmail)) {
      setAuthError(
        t('feedback.errorInvalidEmail') ||
          'El correo debe ser de Gmail (@gmail.com o @googlemail.com) para verificar tu cuenta.',
      )
      return
    }

    if (!trimmedName) {
      setAuthName(trimmedEmail.split('@')[0])
    }

    if (!authUsername) {
      const suggested = trimmedEmail
        .split('@')[0]
        .replace(/[^a-zA-Z0-9_]/g, '_')
        .slice(0, 16)
      setAuthUsername(suggested)
    }

    setModalStep(2)
  }

  const handleStep2Submit = (e: FormEvent) => {
    e.preventDefault()
    setAuthError('')

    const cleanUsername = authUsername.trim().toLowerCase().replace(/^@/, '')
    const usernameRegex = /^[a-z0-9_]{3,20}$/

    if (!usernameRegex.test(cleanUsername)) {
      setAuthError(
        t('feedback.errorInvalidUsername') ||
          'El nombre de usuario debe tener entre 3 y 20 caracteres (solo letras, números y guiones bajos).',
      )
      return
    }

    const randomColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
    const finalUser: CommunityUser = {
      email: authEmail.trim().toLowerCase(),
      name: authName.trim() || cleanUsername,
      username: cleanUsername,
      avatarColor: user?.avatarColor || randomColor,
      connectedAt: Date.now(),
    }

    onUserCreated(finalUser)
    onClose()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/60"
    >
      <div className="w-full max-w-[440px] rounded-2xl border border-line bg-surface p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl border border-line bg-surface-raised shadow-sm">
              <GoogleLogo className="size-5" />
            </span>
            <div>
              <h3 id="auth-modal-title" className="text-[15px] font-medium text-ink">
                {t('feedback.modalTitle') || 'Conectar con Gmail y crear usuario'}
              </h3>
              <p className="text-[11.5px] text-ink-subtle">
                {modalStep === 1
                  ? t('feedback.step1Title') || '1. Tu cuenta de Gmail'
                  : t('feedback.step2Title') || '2. Crea tu nombre de usuario'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-ink-subtle hover:bg-surface-sunken hover:text-ink"
            aria-label="Cerrar modal"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Error message */}
        {authError && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-[12px] text-danger">
            <AlertCircle className="size-3.5 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        {/* STEP 1: Email & Name */}
        {modalStep === 1 && (
          <form onSubmit={handleStep1Submit} className="mt-5 space-y-4">
            <div>
              <label className="block text-[12px] font-medium text-ink">
                {t('feedback.emailLabel') || 'Correo de Gmail'}
              </label>
              <input
                type="email"
                required
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder={t('feedback.emailPlaceholder') || 'ejemplo@gmail.com'}
                className="mt-1.5 w-full rounded-xl border border-line bg-surface-raised px-3.5 py-2.5 text-[13px] text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
              />
              <p className="mt-1 text-[11px] text-ink-subtle">
                Debe ser una dirección válida terminada en @gmail.com
              </p>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-ink">
                {t('feedback.nameLabel') || 'Nombre para mostrar'}
              </label>
              <input
                type="text"
                value={authName}
                onChange={(e) => setAuthName(e.target.value)}
                placeholder={t('feedback.namePlaceholder') || 'Tu nombre o apodo'}
                className="mt-1.5 w-full rounded-xl border border-line bg-surface-raised px-3.5 py-2.5 text-[13px] text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
              />
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-full border border-accent-line bg-accent-fill py-2.5 text-[13px] font-medium text-accent-on shadow-primary hover:brightness-110"
              >
                <span>{t('feedback.nextBtn') || 'Continuar a crear usuario →'}</span>
              </button>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('usuario.demo@gmail.com', 'Usuario Demo', 'usuario_demo')}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-line bg-surface-raised py-2 text-[11.5px] font-medium text-ink-muted hover:border-line-strong hover:text-ink"
                >
                  <Sparkles className="size-3.5 text-accent" />
                  <span>Probar con cuenta de demostración</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* STEP 2: Create Username */}
        {modalStep === 2 && (
          <form onSubmit={handleStep2Submit} className="mt-5 space-y-4">
            <div className="rounded-xl border border-line bg-surface-raised p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-subtle">
                Cuenta de Google validada
              </p>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-[12.5px] font-semibold text-ink">{authEmail}</span>
                <span className="inline-flex items-center gap-1 font-mono text-[9.5px] text-emerald-600 dark:text-emerald-400">
                  <Check className="size-3" /> Verificado
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-ink">
                {t('feedback.usernameLabel') || 'Nombre de usuario (@usuario)'}
              </label>
              <div className="relative mt-1.5">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 font-mono text-[13px] text-ink-subtle">
                  @
                </span>
                <input
                  type="text"
                  required
                  value={authUsername}
                  onChange={(e) => setAuthUsername(e.target.value.toLowerCase())}
                  placeholder={t('feedback.usernamePlaceholder') || 'alex_dev'}
                  className="w-full rounded-xl border border-line bg-surface-raised pl-8 pr-3.5 py-2.5 font-mono text-[13px] text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
                />
              </div>
              <p className="mt-1 text-[11px] text-ink-subtle">
                {t('feedback.usernameHelp') ||
                  'De 3 a 20 caracteres: solo letras minúsculas, números y guiones bajos.'}
              </p>
            </div>

            {/* Profile card preview */}
            <div className="rounded-xl border border-dashed border-line bg-surface-sunken/40 p-3">
              <p className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink-subtle">
                Vista previa de tu perfil
              </p>
              <div className="mt-2 flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-full bg-accent text-[12px] font-bold text-accent-on">
                  {(authName || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-ink">{authName || 'Tu nombre'}</p>
                  <p className="font-mono text-[10.5px] text-ink-subtle">
                    @{authUsername || 'usuario'}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setModalStep(1)}
                className="rounded-full border border-line bg-surface-raised px-4 py-2 text-[12.5px] font-medium text-ink-subtle hover:text-ink"
              >
                {t('feedback.backBtn') || '← Volver'}
              </button>

              <button
                type="submit"
                className="flex flex-1 items-center justify-center gap-2 rounded-full border border-accent-line bg-accent-fill py-2 text-[12.5px] font-medium text-accent-on shadow-primary hover:brightness-110"
              >
                <UserCheck className="size-3.5" />
                <span>{t('feedback.confirmBtn') || 'Validar y empezar a comentar'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
