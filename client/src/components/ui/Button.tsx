import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'dark' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-[color,background-color,border-color,box-shadow,transform] duration-150 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]'

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'border border-accent-fill bg-accent-fill text-accent-on shadow-primary hover:brightness-105',
  secondary:
    'border border-line bg-surface-raised text-ink hover:border-line-strong hover:bg-surface-sunken',
  dark: 'border border-ink bg-ink text-canvas hover:opacity-90',
  ghost: 'text-ink-subtle hover:bg-surface-sunken hover:text-ink',
}

const SIZES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-[12px]',
  md: 'px-4 py-2 text-[12.5px]',
  lg: 'px-5 py-2.5 text-[13px]',
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
}

export function Button({ variant = 'primary', size = 'md', className, type = 'button', ...rest }: ButtonProps) {
  return <button type={type} className={cn(BASE, VARIANTS[variant], SIZES[size], className)} {...rest} />
}
