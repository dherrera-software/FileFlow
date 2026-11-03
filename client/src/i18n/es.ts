/**
 * Spanish dictionary - Source of truth for FileFlow i18n.
 * All component texts should be extracted from hardcoded strings and placed here.
 */

export const es = {
  common: {
    convert: 'Convertir',
    converting: 'Convirtiendo...',
    download: 'Descargar',
    error: 'Error',
    success: '¡Éxito!',
    fileSizeLimit: 'hasta {maxMB} MB',
    convertFile: 'Convertir un archivo',
    selectFile: 'Seleccionar archivo',
    chooseAnotherFile: 'Elegir otro archivo',
    dismiss: 'Descartar',
    retry: 'Reintentar',
    loading: 'Cargando',
  },
  navbar: {
    freeTag: 'Gratis, sin cuenta',
    startConverting: 'Comenzar a convertir',
    toggleThemeDark: 'Cambiar a modo oscuro',
    toggleThemeLight: 'Cambiar a modo claro',
  },
  dropzone: {
    dropHere: 'Arrastra un archivo aquí',
    dragDrop: 'Suelta el archivo para seleccionarlo',
    dropToCheck: 'Suelta para verificar el formato y ver las opciones de conversión.',
    dropSupports: 'o elígelo desde tu dispositivo — soporta {formats}.',
    selectFile: 'Elige un archivo para convertir',
    removeFile: 'Eliminar {fileName}',
    dropzoneLabel: 'Zona para arrastrar y soltar archivos',
    formatCategories: 'Categorías de formato',
    accepts: 'Acepta',
    maxSize: 'hasta {maxMB} MB',
    titleIdle: 'Arrastra un archivo aquí',
    titleDragging: 'Suelta el archivo para seleccionarlo',
    subtitleIdle: 'o elígelo desde tu dispositivo — soporta documentos de texto, imágenes y hojas de cálculo/datos.',
    subtitleDragging: 'Suelta para verificar el formato y ver las opciones de conversión.',
    selectButton: 'Seleccionar archivo',
    chooseAnother: 'Elegir otro archivo',
    acceptsPrefix: 'Acepta',
  },
  options: {
    convertTo: 'Convertir a',
    detectedFormat: 'detectado {format}',
    progressStage: {
      uploading: 'Subiendo archivo...',
      queued: 'En cola de espera...',
      processing: 'Procesando conversión en segundo plano...',
      optimizing: 'Optimizando archivo final...',
      completed: '¡Completado!',
    },
  },
  errors: {
    unsupportedFormat: 'Este formato no es compatible.',
    fileTooLarge: 'El archivo pesa {size}. El límite es de {maxMB} MB.',
    fileEmpty: 'Este archivo está vacío; no hay nada para convertir.',
    networkError: 'No se pudo conectar con el servidor backend.',
    conversionFailed: 'La conversión falló en el servidor.',
    fileConversionFailed: 'No se puede convertir este archivo',
  },
  footer: {
    tagline: 'Conversor de archivos seguro, rápido y privado.',
    activeEngine: 'Motor de conversión activo',
    copyright: '© {year} {name} · Conversor de archivos seguro',
  },
} as const;
