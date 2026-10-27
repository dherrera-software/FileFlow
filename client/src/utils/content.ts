import type { FileFormat } from './formats'

export const BRAND = {
  name: 'FileFlow',
  tagline: 'Tus archivos, en el formato correcto.',
} as const

export const NAV_LINKS = [
  { label: 'Inicio', href: '#top', isActive: true },
  { label: 'Conversiones', href: '#converters', isActive: false },
  { label: 'Cómo funciona', href: '#how-it-works', isActive: false },
] as const

export const HERO = {
  eyebrow: 'Conversor universal de alta fidelidad',
  title: 'Tus archivos, en el formato correcto.',
  description:
    'Documentos, imágenes, hojas de cálculo, presentaciones, audio y video. Más de 35 formatos compatibles con conversiones rápidas, seguras y sin pérdida de calidad.',
} as const

export const HOW_IT_WORKS_STEPS = [
  {
    title: '1. Arrastra tu archivo',
    body: 'Sube documentos, imágenes, tablas, presentaciones o multimedia de hasta 50 MB. El sistema detecta el tipo al instante.',
  },
  {
    title: '2. Elige el formato destino',
    body: 'Solo se presentan opciones compatibles con el archivo seleccionado; nunca verás una combinación que falle.',
  },
  {
    title: '3. Convierte y descarga',
    body: 'El motor especializado procesa la conversión en segundos y la descarga inicia de inmediato en tu navegador.',
  },
] as const

export type ConversionRule = {
  label: string
  sources: readonly FileFormat[]
  targets: readonly string[]
}

export const CONVERSION_RULES: readonly ConversionRule[] = [
  { label: 'Documentos', sources: ['DOCX', 'DOC', 'PDF', 'TXT', 'RTF', 'HTML', 'ODT', 'EPUB', 'MD', 'PDF/A'], targets: ['PDF', 'DOCX', 'TXT', 'HTML', 'RTF', 'ODT', 'EPUB', 'MD', 'PDF/A'] },
  { label: 'Imágenes', sources: ['JPG', 'JPEG', 'PNG', 'WEBP', 'HEIC', 'GIF', 'BMP', 'TIFF', 'SVG'], targets: ['PNG', 'JPG', 'WEBP', 'PDF', 'MP4'] },
  { label: 'Hojas de cálculo y datos', sources: ['XLSX', 'XLS', 'CSV', 'TSV', 'ODS', 'JSON', 'XML'], targets: ['CSV', 'XLSX', 'PDF', 'JSON', 'XML', 'TSV'] },
  { label: 'Presentaciones', sources: ['PPTX', 'PPT', 'ODP'], targets: ['PDF', 'PPTX', 'JPG', 'PNG', 'MP4'] },
  { label: 'Audio', sources: ['WAV', 'MP3', 'FLAC', 'M4A', 'AAC', 'OGG', 'OPUS'], targets: ['MP3', 'WAV', 'FLAC', 'OGG', 'M4A', 'AAC'] },
  { label: 'Video', sources: ['MP4', 'MOV', 'AVI', 'MKV', 'WEBM'], targets: ['MP3', 'WAV', 'GIF', 'MOV', 'WEBM', 'MP4', 'JPG', 'PNG'] },
]

export const PRIVACY = {
  heading: 'Privacidad y seguridad de tus archivos',
  body: 'La validación se realiza de forma directa y segura. Los archivos viajan únicamente para efectuar la conversión solicitada y se descartan automáticamente tras finalizar el proceso. No se almacenan copias ni se comparten datos con terceros.',
} as const

export const FAQ_ITEMS = [
  {
    question: '¿Se guardan mis archivos en el servidor?',
    answer:
      'No. Los archivos únicamente se reciben temporalmente para realizar la transformación solicitada y se eliminan inmediatamente tras la conversión.',
  },
  {
    question: '¿Qué formatos y categorías puedo convertir?',
    answer:
      'Documentos (DOCX, PDF, TXT, RTF, HTML, ODT, EPUB, MD, PDF/A), imágenes (JPG, PNG, WEBP, HEIC, GIF, BMP, TIFF, SVG), hojas de cálculo (XLSX, CSV, TSV, ODS, JSON, XML), presentaciones (PPTX, PPT, ODP), audio (WAV, MP3, FLAC, M4A, OGG) y video (MP4, MOV, AVI, MKV, WEBM).',
  },
  {
    question: '¿Puedo convertir video MP4 a GIF o extraer audio?',
    answer:
      'Sí. Puedes transformar videos MP4 a GIF con paleta de alta calidad, convertir GIFs animados a video MP4, o extraer la pista de audio a MP3 o WAV.',
  },
  {
    question: '¿Puedo convertir texto a audio (voz)?',
    answer:
      'Sí. Puedes subir un archivo de texto .TXT y convertirlo a un archivo de audio MP3 narrado con síntesis de voz.',
  },
  {
    question: '¿Puedo convertir fotos HEIC de iPhone a JPG o PNG?',
    answer:
      'Sí. FileFlow procesa imágenes HEIC directamente y te permite descargarlas en JPG, PNG o PDF.',
  },
  {
    question: '¿Es necesario registrarse o pagar?',
    answer:
      'No requiere registro ni suscripción. Todas las funciones de conversión son gratuitas.',
  },
] as const

export const CONVERSION_NOTICE = {
  title: 'Conversión procesada',
  body: 'El archivo ha sido procesado por el motor de conversión y tu descarga debería haber iniciado.',
} as const

export const FOOTER_COLUMNS = [
  {
    heading: 'Producto',
    links: [
      { label: 'Convertir un archivo', href: '#convert' },
      { label: 'Conversiones populares', href: '#converters' },
      { label: 'Cómo funciona', href: '#how-it-works' },
    ],
  },
  {
    heading: 'Legal y Contacto',
    links: [
      { label: 'Política de privacidad', href: '#privacy' },
      { label: 'Términos de servicio', href: '#terms' },
      { label: 'hola@fileflow.app', href: 'mailto:hola@fileflow.app' },
    ],
  },
] as const
