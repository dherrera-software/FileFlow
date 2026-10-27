import { useCallback, useRef, useState } from 'react'
import type { ChangeEvent, DragEvent } from 'react'
import type { ConversionPair, FileFormat } from '../utils/formats'
import { getTargetsForFormat, validateFile } from '../utils/formats'
import { convertAndDownload } from '../services/conversionApi'

export type FileError = {
  fileName: string
  message: string
}

/**
 * Owns every piece of conversion state that exists today.
 *
 * The conversion step intentionally does no work: there is no engine behind
 * this UI, so pressing Convert raises an honest notice instead of simulating
 * progress or a download. Swap `convert` for an API call when the engine
 * exists — nothing else in the page needs to change.
 */
export function useConverter() {
  const [file, setFile] = useState<File | null>(null)
  const [format, setFormat] = useState<FileFormat | null>(null)
  const [target, setTarget] = useState<string | null>(null)
  const [error, setError] = useState<FileError | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [notice, setNotice] = useState(false)
  const [isConverting, setIsConverting] = useState(false)
  const [conversionError, setConversionError] = useState<string | null>(null)
  const [pendingPair, setPendingPair] = useState<ConversionPair | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)
  const pendingPairRef = useRef<ConversionPair | null>(null)
  const dragDepth = useRef(0)

  const rememberPendingPair = useCallback((pair: ConversionPair | null) => {
    pendingPairRef.current = pair
    setPendingPair(pair)
  }, [])

  const openFilePicker = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const scrollToUpload = useCallback(() => {
    const section = document.getElementById('convert')
    if (!section) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    section.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' })
  }, [])

  const acceptFile = useCallback(
    (incoming: File) => {
      const validation = validateFile(incoming)

      if (!validation.ok) {
        setFile(null)
        setFormat(null)
        setTarget(null)
        setNotice(false)
        const message =
          'message' in validation && typeof validation.message === 'string'
            ? validation.message
            : 'Ese archivo no se puede convertir.'
        setError({ fileName: incoming.name, message })
        setConversionError(null)
        return
      }

      const targets = getTargetsForFormat(validation.format)
      const requested = pendingPairRef.current
      const requestedTarget =
        requested && requested.source === validation.format && targets.includes(requested.target)
          ? requested.target
          : null

      pendingPairRef.current = null
      setPendingPair(null)
      setFile(incoming)
      setFormat(validation.format)
      setTarget(requestedTarget ?? targets[0] ?? null)
      setError(null)
      setConversionError(null)
      setNotice(false)
    },
    [],
  )

  const onFileInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const picked = event.target.files?.[0]
      if (picked) acceptFile(picked)
      // Allow picking the same file again after removing it.
      event.target.value = ''
    },
    [acceptFile],
  )

  const onDragEnter = useCallback((event: DragEvent<HTMLElement>) => {
    if (!event.dataTransfer.types.includes('Files')) return
    event.preventDefault()
    dragDepth.current += 1
    setIsDragging(true)
  }, [])

  const onDragOver = useCallback((event: DragEvent<HTMLElement>) => {
    if (!event.dataTransfer.types.includes('Files')) return
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
  }, [])

  const onDragLeave = useCallback((event: DragEvent<HTMLElement>) => {
    event.preventDefault()
    dragDepth.current = Math.max(0, dragDepth.current - 1)
    if (dragDepth.current === 0) setIsDragging(false)
  }, [])

  const onDrop = useCallback(
    (event: DragEvent<HTMLElement>) => {
      event.preventDefault()
      dragDepth.current = 0
      setIsDragging(false)

      const dropped = event.dataTransfer.files?.[0]
      if (!dropped) return
      acceptFile(dropped)
    },
    [acceptFile],
  )

  const removeFile = useCallback(() => {
    setFile(null)
    setFormat(null)
    setTarget(null)
    setError(null)
    setNotice(false)
    setConversionError(null)
    pendingPairRef.current = null
    setPendingPair(null)
  }, [])

  const dismissError = useCallback(() => setError(null), [])

  const dismissNotice = useCallback(() => setNotice(false), [])

  const dismissConversionError = useCallback(() => setConversionError(null), [])

  const convert = useCallback(async () => {
    if (!file || !format || !target || isConverting) return

    setIsConverting(true)
    setConversionError(null)
    setNotice(false)

    try {
      await convertAndDownload(file, target)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ocurrió un error inesperado durante la conversión.'
      setConversionError(message)
    } finally {
      setIsConverting(false)
    }
  }, [file, format, target, isConverting])

  /**
   * Called when a popular-conversion card is picked. Applies the target
   * straight away when a compatible file is already loaded, otherwise it is
   * remembered for the next file the user selects.
   */
  const requestConversion = useCallback(
    (pair: ConversionPair) => {
      const targets = format ? getTargetsForFormat(format) : []
      const canApplyNow = Boolean(file && format && pair.source === format && targets.includes(pair.target))

      if (canApplyNow) {
        rememberPendingPair(null)
        setTarget(pair.target)
        setNotice(false)
      } else {
        rememberPendingPair(pair)
      }

      scrollToUpload()
    },
    [file, format, rememberPendingPair, scrollToUpload],
  )

  const targetOptions: readonly string[] = format ? getTargetsForFormat(format) : []

  return {
    file,
    format,
    target,
    targetOptions,
    error,
    isDragging,
    notice,
    isConverting,
    conversionError,
    pendingPair,
    canConvert: Boolean(file && format && target && !isConverting),
    inputRef,
    actions: {
      openFilePicker,
      onFileInputChange,
      onDragEnter,
      onDragOver,
      onDragLeave,
      onDrop,
      acceptFile,
      removeFile,
      dismissError,
      dismissNotice,
      dismissConversionError,
      convert,
      requestConversion,
      setTarget,
    },
  }
}

export type ConverterController = ReturnType<typeof useConverter>
