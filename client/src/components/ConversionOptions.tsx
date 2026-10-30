import { Loader2 } from 'lucide-react'
import { cn } from '../utils/cn'
import type { ConverterController } from '../hooks/useConverter'
import { Button } from './ui/Button'

/**
 * Returns a human-readable label for each conversion phase based on progress percentage.
 */
function getProgressLabel(progress: number): string {
  if (progress <= 0) return 'Iniciando...'
  if (progress < 50) return `Subiendo... ${progress}%`
  if (progress === 50) return 'Procesando... 50%'
  if (progress < 100) return `Descargando... ${progress}%`
  return 'Completado 100%'
}

/**
 * Aparece una vez que el archivo ha sido aceptado. Las opciones de destino provienen
 * de las reglas compartidas, por lo que nunca se ofrecerá una opción incompatible.
 */
export function ConversionOptions({ controller }: { controller: ConverterController }) {
  const { format, target, targetOptions, canConvert, isConverting, conversionProgress, actions } = controller

  if (!format) return null

  return (
    <fieldset className="border-t border-line px-4 pb-4 pt-3.5 text-left sm:px-5 dark:border-zinc-800">
      <legend className="sr-only">Elige un formato de destino para {format}</legend>

      <div className="flex items-baseline justify-between gap-3">
        <p aria-hidden="true" className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-subtle">
          Convertir a
        </p>
        <p className="text-[10.5px] text-ink-faint">detectado {format}</p>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {targetOptions.map((option) => (
          <label
            key={option}
            className={cn(
              'cursor-pointer rounded-full border border-line px-3.5 py-1.5 text-[12px] font-medium text-ink-muted transition-colors dark:border-zinc-700 dark:text-zinc-300',
              isConverting && 'pointer-events-none opacity-60',
              'hover:border-accent hover:text-accent-ink',
              'has-[:checked]:border-accent has-[:checked]:bg-accent-soft has-[:checked]:text-accent-ink dark:has-[:checked]:border-accent dark:has-[:checked]:text-accent-ink',
              'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent',
            )}
          >
            <input
              type="radio"
              name="target-format"
              value={option}
              checked={target === option}
              disabled={isConverting}
              onChange={() => actions.setTarget(option)}
              className="sr-only"
            />
            {option}
          </label>
        ))}
      </div>

      {isConverting && (
        <div className="mt-3 space-y-1.5">
          {/* Progress bar */}
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className="h-full rounded-full bg-accent transition-all duration-300 ease-out"
              style={{ width: `${Math.max(conversionProgress, 2)}%` }}
              role="progressbar"
              aria-valuenow={conversionProgress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Progreso de conversión"
            />
          </div>
          <p className="text-center text-[11px] font-medium text-ink-subtle">
            {getProgressLabel(conversionProgress)}
          </p>
        </div>
      )}

      <Button
        className={cn('w-full', isConverting ? 'mt-2' : 'mt-3')}
        onClick={actions.convert}
        disabled={!canConvert || isConverting}
      >
        {isConverting ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            {conversionProgress}% completado
          </>
        ) : (
          'Convertir archivo'
        )}
      </Button>
    </fieldset>
  )
}
