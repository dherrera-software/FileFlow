/**
 * Single source of truth for every file-format rule in FileFlow.
 *
 * Supports Documents, Images, Spreadsheets & Data, Presentations, Audio, and Video.
 */

export const SUPPORTED_FORMATS = [
  // Documentos
  'DOCX', 'DOC', 'PDF', 'TXT', 'RTF', 'HTML', 'ODT', 'EPUB', 'MD', 'PDF/A',
  // Imágenes
  'JPG', 'JPEG', 'PNG', 'WEBP', 'HEIC', 'GIF', 'BMP', 'TIFF', 'SVG',
  // Hojas de cálculo y datos
  'XLSX', 'XLS', 'CSV', 'TSV', 'ODS', 'JSON', 'XML',
  // Presentaciones
  'PPTX', 'PPT', 'ODP',
  // Audio
  'WAV', 'MP3', 'FLAC', 'M4A', 'AAC', 'OGG', 'OPUS',
  // Video
  'MP4', 'MOV', 'AVI', 'MKV', 'WEBM',
] as const

export type FileFormat = (typeof SUPPORTED_FORMATS)[number]

export const MAX_FILE_SIZE_MB = 50
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

export type FormatCategory =
  | 'Documentos'
  | 'Imágenes'
  | 'Hojas de cálculo'
  | 'Presentaciones'
  | 'Audio'
  | 'Video'

export const FORMAT_CATEGORY_MAP: Record<FileFormat, FormatCategory> = {
  DOCX: 'Documentos',
  DOC: 'Documentos',
  PDF: 'Documentos',
  TXT: 'Documentos',
  RTF: 'Documentos',
  HTML: 'Documentos',
  ODT: 'Documentos',
  EPUB: 'Documentos',
  MD: 'Documentos',
  'PDF/A': 'Documentos',

  JPG: 'Imágenes',
  JPEG: 'Imágenes',
  PNG: 'Imágenes',
  WEBP: 'Imágenes',
  HEIC: 'Imágenes',
  GIF: 'Imágenes',
  BMP: 'Imágenes',
  TIFF: 'Imágenes',
  SVG: 'Imágenes',

  XLSX: 'Hojas de cálculo',
  XLS: 'Hojas de cálculo',
  CSV: 'Hojas de cálculo',
  TSV: 'Hojas de cálculo',
  ODS: 'Hojas de cálculo',
  JSON: 'Hojas de cálculo',
  XML: 'Hojas de cálculo',

  PPTX: 'Presentaciones',
  PPT: 'Presentaciones',
  ODP: 'Presentaciones',

  WAV: 'Audio',
  MP3: 'Audio',
  FLAC: 'Audio',
  M4A: 'Audio',
  AAC: 'Audio',
  OGG: 'Audio',
  OPUS: 'Audio',

  MP4: 'Video',
  MOV: 'Video',
  AVI: 'Video',
  MKV: 'Video',
  WEBM: 'Video',
}

/** Human descriptions used next to the detected file type. */
export const FORMAT_DESCRIPTIONS: Record<FileFormat, string> = {
  DOCX: 'Documento Word',
  DOC: 'Documento Word (Legado)',
  PDF: 'Documento PDF',
  TXT: 'Texto plano',
  RTF: 'Texto enriquecido RTF',
  HTML: 'Página web HTML',
  ODT: 'Documento OpenDocument',
  EPUB: 'Libro digital EPUB',
  MD: 'Documento Markdown',
  'PDF/A': 'PDF estándar de archivado',

  JPG: 'Imagen JPG',
  JPEG: 'Imagen JPEG',
  PNG: 'Imagen PNG',
  WEBP: 'Imagen moderna WebP',
  HEIC: 'Fotografía Apple HEIC',
  GIF: 'Animación / Imagen GIF',
  BMP: 'Mapa de bits BMP',
  TIFF: 'Imagen TIFF de alta resolución',
  SVG: 'Gráfico vectorial SVG',

  XLSX: 'Libro de Excel',
  XLS: 'Libro de Excel (Legado)',
  CSV: 'Hoja de cálculo CSV',
  TSV: 'Datos tabulados TSV',
  ODS: 'Hoja OpenDocument',
  JSON: 'Estructura de datos JSON',
  XML: 'Documento estructurado XML',

  PPTX: 'Presentación PowerPoint',
  PPT: 'Presentación PowerPoint (Legado)',
  ODP: 'Presentación OpenDocument',

  WAV: 'Audio sin compresión WAV',
  MP3: 'Audio MP3',
  FLAC: 'Audio Lossless FLAC',
  M4A: 'Audio MPEG-4 AAC',
  AAC: 'Audio AAC',
  OGG: 'Audio Ogg Vorbis',
  OPUS: 'Audio Opus de alta eficiencia',

  MP4: 'Video MP4',
  MOV: 'Video Apple QuickTime',
  AVI: 'Video AVI',
  MKV: 'Video Matroska MKV',
  WEBM: 'Video WebM',
}

/**
 * Semantic badge styles. Pastel fill, rich text, one coordinated hue per format family.
 */
export const FORMAT_BADGE_STYLES: Record<FileFormat, string> = {
  // Documentos
  DOCX: 'bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300',
  DOC: 'bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300',
  PDF: 'bg-red-50 text-red-700 dark:bg-red-950/70 dark:text-red-300',
  TXT: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  RTF: 'bg-sky-50 text-sky-700 dark:bg-sky-950/70 dark:text-sky-300',
  HTML: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300',
  ODT: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/70 dark:text-cyan-300',
  EPUB: 'bg-purple-50 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300',
  MD: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200',
  'PDF/A': 'bg-rose-50 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300',

  // Imágenes
  JPG: 'bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300',
  JPEG: 'bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300',
  PNG: 'bg-teal-50 text-teal-700 dark:bg-teal-950/70 dark:text-teal-300',
  WEBP: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300',
  HEIC: 'bg-sky-50 text-sky-700 dark:bg-sky-950/70 dark:text-sky-300',
  GIF: 'bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-950/70 dark:text-fuchsia-300',
  BMP: 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300',
  TIFF: 'bg-cyan-50 text-cyan-800 dark:bg-cyan-950/70 dark:text-cyan-300',
  SVG: 'bg-violet-50 text-violet-700 dark:bg-violet-950/70 dark:text-violet-300',

  // Hojas de cálculo y datos
  XLSX: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300',
  XLS: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300',
  CSV: 'bg-lime-50 text-lime-700 dark:bg-lime-950/70 dark:text-lime-300',
  TSV: 'bg-lime-50 text-lime-700 dark:bg-lime-950/70 dark:text-lime-300',
  ODS: 'bg-green-50 text-green-700 dark:bg-green-950/70 dark:text-green-300',
  JSON: 'bg-yellow-50 text-yellow-800 dark:bg-yellow-950/70 dark:text-yellow-300',
  XML: 'bg-orange-50 text-orange-800 dark:bg-orange-950/70 dark:text-orange-300',

  // Presentaciones
  PPTX: 'bg-orange-50 text-orange-700 dark:bg-orange-950/70 dark:text-orange-300',
  PPT: 'bg-orange-50 text-orange-700 dark:bg-orange-950/70 dark:text-orange-300',
  ODP: 'bg-amber-50 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300',

  // Audio
  WAV: 'bg-violet-50 text-violet-700 dark:bg-violet-950/70 dark:text-violet-300',
  MP3: 'bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-950/70 dark:text-fuchsia-300',
  FLAC: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300',
  M4A: 'bg-pink-50 text-pink-700 dark:bg-pink-950/70 dark:text-pink-300',
  AAC: 'bg-pink-50 text-pink-700 dark:bg-pink-950/70 dark:text-pink-300',
  OGG: 'bg-teal-50 text-teal-800 dark:bg-teal-950/70 dark:text-teal-300',
  OPUS: 'bg-cyan-50 text-cyan-800 dark:bg-cyan-950/70 dark:text-cyan-300',

  // Video
  MP4: 'bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300',
  MOV: 'bg-blue-50 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300',
  AVI: 'bg-red-50 text-red-800 dark:bg-red-950/70 dark:text-red-300',
  MKV: 'bg-purple-50 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300',
  WEBM: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300',
}

/** Complete conversion matrix as requested */
export const CONVERSION_TARGETS: Record<FileFormat, readonly string[]> = {
  // Documentos
  DOCX: ['PDF', 'TXT', 'HTML', 'RTF', 'ODT', 'EPUB', 'MD'],
  DOC: ['DOCX', 'PDF', 'TXT', 'HTML', 'RTF', 'ODT'],
  PDF: ['DOCX', 'JPG', 'PNG', 'TXT', 'XLSX', 'CSV', 'PDF/A'],
  TXT: ['PDF', 'DOCX', 'HTML', 'MD', 'MP3'],
  RTF: ['PDF', 'DOCX', 'TXT'],
  HTML: ['PDF', 'DOCX', 'TXT', 'MD'],
  ODT: ['PDF', 'DOCX', 'RTF'],
  EPUB: ['PDF', 'DOCX'],
  MD: ['PDF', 'DOCX', 'HTML'],
  'PDF/A': ['PDF', 'DOCX', 'TXT'],

  // Imágenes
  JPG: ['PNG', 'PDF', 'WEBP'],
  JPEG: ['PNG', 'PDF', 'WEBP'],
  PNG: ['JPG', 'PDF', 'WEBP'],
  WEBP: ['JPG', 'PNG', 'PDF'],
  HEIC: ['JPG', 'PNG', 'PDF'],
  GIF: ['JPG', 'PNG', 'MP4'],
  BMP: ['JPG', 'PNG', 'PDF'],
  TIFF: ['JPG', 'PNG', 'PDF'],
  SVG: ['PNG', 'PDF', 'JPG'],

  // Hojas de cálculo y datos
  XLSX: ['CSV', 'PDF', 'JSON', 'XML', 'TSV'],
  CSV: ['XLSX', 'PDF', 'JSON', 'XML'],
  TSV: ['CSV', 'XLSX'],
  ODS: ['XLSX', 'CSV', 'PDF'],
  XLS: ['XLSX', 'CSV', 'PDF'],
  JSON: ['CSV', 'XLSX'],
  XML: ['CSV', 'XLSX'],

  // Presentaciones
  PPTX: ['PDF', 'JPG', 'PNG', 'MP4'],
  PPT: ['PPTX', 'PDF', 'JPG', 'PNG'],
  ODP: ['PPTX', 'PDF', 'JPG', 'PNG'],

  // Audio
  WAV: ['MP3', 'FLAC', 'OGG', 'M4A', 'AAC'],
  MP3: ['WAV', 'M4A', 'AAC', 'OGG'],
  FLAC: ['MP3', 'WAV'],
  M4A: ['MP3', 'WAV'],
  AAC: ['MP3', 'WAV'],
  OGG: ['MP3', 'WAV'],
  OPUS: ['MP3', 'WAV'],

  // Video
  MP4: ['MP3', 'WAV', 'GIF', 'MOV', 'WEBM'],
  MOV: ['MP4', 'MP3', 'WAV', 'JPG', 'PNG'],
  AVI: ['MP4', 'MP3', 'WAV', 'JPG', 'PNG'],
  MKV: ['MP4', 'MP3', 'WAV', 'JPG', 'PNG'],
  WEBM: ['MP4', 'MP3', 'WAV', 'JPG', 'PNG'],
}

export const EXTENSION_TO_FORMAT: Record<string, FileFormat> = {
  // Documentos
  docx: 'DOCX',
  doc: 'DOC',
  pdf: 'PDF',
  txt: 'TXT',
  rtf: 'RTF',
  html: 'HTML',
  htm: 'HTML',
  odt: 'ODT',
  epub: 'EPUB',
  md: 'MD',
  markdown: 'MD',
  pdfa: 'PDF/A',

  // Imágenes
  jpg: 'JPG',
  jpeg: 'JPEG',
  png: 'PNG',
  webp: 'WEBP',
  heic: 'HEIC',
  gif: 'GIF',
  bmp: 'BMP',
  tiff: 'TIFF',
  tif: 'TIFF',
  svg: 'SVG',

  // Hojas de cálculo y datos
  xlsx: 'XLSX',
  xls: 'XLS',
  csv: 'CSV',
  tsv: 'TSV',
  ods: 'ODS',
  json: 'JSON',
  xml: 'XML',

  // Presentaciones
  pptx: 'PPTX',
  ppt: 'PPT',
  odp: 'ODP',

  // Audio
  wav: 'WAV',
  mp3: 'MP3',
  flac: 'FLAC',
  m4a: 'M4A',
  aac: 'AAC',
  ogg: 'OGG',
  opus: 'OPUS',

  // Video
  mp4: 'MP4',
  mov: 'MOV',
  avi: 'AVI',
  mkv: 'MKV',
  webm: 'WEBM',
}

export const ACCEPTED_EXTENSIONS: readonly string[] = Object.keys(EXTENSION_TO_FORMAT).map(
  (extension) => `.${extension}`,
)

export type ConversionPair = {
  source: FileFormat
  target: string
}

export const POPULAR_CONVERSIONS: readonly ConversionPair[] = [
  // Documentos
  { source: 'DOCX', target: 'PDF' },
  { source: 'PDF', target: 'DOCX' },
  { source: 'PDF', target: 'JPG' },
  { source: 'TXT', target: 'PDF' },
  { source: 'TXT', target: 'MP3' },
  { source: 'MD', target: 'PDF' },
  { source: 'EPUB', target: 'PDF' },
  { source: 'PDF', target: 'PDF/A' },

  // Imágenes
  { source: 'JPG', target: 'PNG' },
  { source: 'PNG', target: 'WEBP' },
  { source: 'WEBP', target: 'JPG' },
  { source: 'HEIC', target: 'JPG' },
  { source: 'SVG', target: 'PNG' },
  { source: 'GIF', target: 'MP4' },

  // Hojas de cálculo y datos
  { source: 'XLSX', target: 'CSV' },
  { source: 'CSV', target: 'XLSX' },
  { source: 'XLSX', target: 'PDF' },
  { source: 'JSON', target: 'XLSX' },
  { source: 'XML', target: 'CSV' },

  // Presentaciones
  { source: 'PPTX', target: 'PDF' },
  { source: 'PPTX', target: 'MP4' },

  // Audio
  { source: 'WAV', target: 'MP3' },
  { source: 'MP3', target: 'WAV' },
  { source: 'FLAC', target: 'MP3' },

  // Video
  { source: 'MP4', target: 'GIF' },
  { source: 'MP4', target: 'MP3' },
  { source: 'MOV', target: 'MP4' },
  { source: 'WEBM', target: 'MP4' },
]

export function getFileExtension(fileName: string): string {
  const dotIndex = fileName.lastIndexOf('.')
  if (dotIndex === -1 || dotIndex === fileName.length - 1) return ''
  return fileName.slice(dotIndex + 1).toLowerCase()
}

export function getFormatFromFileName(fileName: string): FileFormat | null {
  const extension = getFileExtension(fileName)
  return EXTENSION_TO_FORMAT[extension] ?? null
}

export function getTargetsForFormat(format: FileFormat): readonly string[] {
  return CONVERSION_TARGETS[format] || []
}

export function isConversionSupported(pair: ConversionPair): boolean {
  const targets = CONVERSION_TARGETS[pair.source] || []
  return targets.includes(pair.target)
}

/** Formats bytes into B / KB / MB with a sensible number of decimals. */
export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 KB'

  const units = ['B', 'KB', 'MB', 'GB'] as const
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / 1024 ** exponent
  const decimals = exponent === 0 || value >= 10 ? 0 : 1

  return `${value.toFixed(decimals)} ${units[exponent]}`
}

export type FileValidation =
  | { ok: true; format: FileFormat; message?: never }
  | { ok: false; reason: 'unsupported-format' | 'too-large' | 'empty'; message: string }

/**
 * Validates extension, file size, and non-empty content.
 */
export function validateFile(file: File): FileValidation {
  const format = getFormatFromFileName(file.name)

  if (!format) {
    const extension = getFileExtension(file.name)
    const named = extension ? `.${extension}` : 'Este tipo de archivo'
    return {
      ok: false,
      reason: 'unsupported-format',
      message: `${named} no es un formato compatible. FileFlow admite documentos (DOCX, PDF, TXT, RTF, HTML, ODT, EPUB, MD), imágenes (JPG, PNG, WEBP, HEIC, GIF, BMP, TIFF, SVG), hojas de cálculo (XLSX, CSV, TSV, JSON, XML), presentaciones (PPTX, PPT, ODP), audio (WAV, MP3, FLAC, M4A, OGG) y video (MP4, MOV, AVI, MKV, WEBM).`,
    }
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      ok: false,
      reason: 'too-large',
      message: `Este archivo pesa ${formatFileSize(file.size)}. El límite es de ${MAX_FILE_SIZE_MB} MB por archivo.`,
    }
  }

  if (file.size === 0) {
    return {
      ok: false,
      reason: 'empty',
      message: 'Este archivo está vacío; no hay nada para convertir.',
    }
  }

  return { ok: true, format }
}
