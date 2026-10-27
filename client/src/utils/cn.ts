export type ClassValue = string | false | null | undefined

/**
 * Joins class names, dropping anything falsy.
 * Deliberately tiny so the project stays dependency free.
 */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(' ')
}
