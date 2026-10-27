import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'dark' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-45'

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'border border-accent bg-accent text-white shadow-primary hover:border-accent-strong hover:bg-accent-strong',
  secondary:
    'border border-line bg-white text-ink hover:border-accent hover:text-accent-ink dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:border-accent dark:hover:text-accent-ink',
  dark:
    'border border-ink bg-ink text-white hover:border-[#27272a] hover:bg-[#27272a] dark:border-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white',
  ghost: 'text-ink-subtle hover:text-accent-ink dark:text-zinc-400 dark:hover:text-accent-ink',
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
