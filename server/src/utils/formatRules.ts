export const SUPPORTED_SOURCE_FORMATS = [
  // Documentos
  'docx',
  'doc',
  'pdf',
  'txt',
  'rtf',
  'html',
  'htm',
  'odt',
  'epub',
  'md',
  'pdfa',
  // Imágenes
  'jpg',
  'jpeg',
  'png',
  'webp',
  'heic',
  'gif',
  'bmp',
  'tiff',
  'tif',
  'svg',
  // Hojas de cálculo y datos
  'xlsx',
  'xls',
  'csv',
  'tsv',
  'ods',
  'json',
  'xml',
  // Presentaciones
  'pptx',
  'ppt',
  'odp',
  // Audio
  'wav',
  'mp3',
  'flac',
  'm4a',
  'aac',
  'ogg',
  'opus',
  // Video
  'mp4',
  'mov',
  'avi',
  'mkv',
  'webm',
] as const;

export type SupportedSourceFormat = (typeof SUPPORTED_SOURCE_FORMATS)[number];

export const CONVERSION_MATRIX: Record<SupportedSourceFormat, readonly string[]> = {
  // Documentos
  docx: ['pdf', 'txt', 'html', 'rtf', 'odt', 'epub', 'md'],
  doc: ['docx', 'pdf', 'txt', 'html', 'rtf', 'odt'],
  pdf: ['docx', 'jpg', 'png', 'txt', 'xlsx', 'csv', 'pdfa'],
  txt: ['pdf', 'docx', 'html', 'md', 'mp3'],
  rtf: ['pdf', 'docx', 'txt'],
  html: ['pdf', 'docx', 'txt', 'md'],
  htm: ['pdf', 'docx', 'txt', 'md'],
  odt: ['pdf', 'docx', 'rtf'],
  epub: ['pdf', 'docx'],
  md: ['pdf', 'docx', 'html'],
  pdfa: ['pdf', 'docx', 'txt'],

  // Imágenes
  jpg: ['png', 'pdf', 'webp'],
  jpeg: ['png', 'pdf', 'webp'],
  png: ['jpg', 'jpeg', 'pdf', 'webp'],
  webp: ['jpg', 'jpeg', 'png', 'pdf'],
  heic: ['jpg', 'jpeg', 'png', 'pdf'],
  gif: ['jpg', 'jpeg', 'png', 'mp4'],
  bmp: ['jpg', 'jpeg', 'png', 'pdf'],
  tiff: ['jpg', 'jpeg', 'png', 'pdf'],
  tif: ['jpg', 'jpeg', 'png', 'pdf'],
  svg: ['png', 'pdf', 'jpg'],

  // Hojas de cálculo y datos
  xlsx: ['csv', 'pdf', 'json', 'xml', 'tsv'],
  xls: ['xlsx', 'csv', 'pdf'],
  csv: ['xlsx', 'pdf', 'json', 'xml'],
  tsv: ['csv', 'xlsx'],
  ods: ['xlsx', 'csv', 'pdf'],
  json: ['csv', 'xlsx'],
  xml: ['csv', 'xlsx'],

  // Presentaciones
  pptx: ['pdf', 'jpg', 'png', 'mp4'],
  ppt: ['pptx', 'pdf', 'jpg', 'png'],
  odp: ['pptx', 'pdf', 'jpg', 'png'],

  // Audio
  wav: ['mp3', 'flac', 'ogg', 'm4a', 'aac'],
  mp3: ['wav', 'm4a', 'aac', 'ogg'],
  flac: ['mp3', 'wav'],
  m4a: ['mp3', 'wav'],
  aac: ['mp3', 'wav'],
  ogg: ['mp3', 'wav'],
  opus: ['mp3', 'wav'],

  // Video
  mp4: ['mp3', 'wav', 'gif', 'mov', 'webm'],
  mov: ['mp4', 'mp3', 'wav', 'jpg', 'png'],
  avi: ['mp4', 'mp3', 'wav', 'jpg', 'png'],
  mkv: ['mp4', 'mp3', 'wav', 'jpg', 'png'],
  webm: ['mp4', 'mp3', 'wav', 'jpg', 'png'],
};

export const MIME_TYPE_MAP: Record<string, string> = {
  pdf: 'application/pdf',
  pdfa: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  doc: 'application/msword',
  txt: 'text/plain; charset=utf-8',
  html: 'text/html; charset=utf-8',
  htm: 'text/html; charset=utf-8',
  rtf: 'application/rtf',
  odt: 'application/vnd.oasis.opendocument.text',
  epub: 'application/epub+zip',
  md: 'text/markdown; charset=utf-8',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  heic: 'image/heic',
  gif: 'image/gif',
  bmp: 'image/bmp',
  tiff: 'image/tiff',
  tif: 'image/tiff',
  svg: 'image/svg+xml',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  xls: 'application/vnd.ms-excel',
  ods: 'application/vnd.oasis.opendocument.spreadsheet',
  csv: 'text/csv; charset=utf-8',
  tsv: 'text/tab-separated-values; charset=utf-8',
  json: 'application/json; charset=utf-8',
  xml: 'application/xml; charset=utf-8',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ppt: 'application/vnd.ms-powerpoint',
  odp: 'application/vnd.oasis.opendocument.presentation',
  wav: 'audio/wav',
  mp3: 'audio/mpeg',
  flac: 'audio/flac',
  ogg: 'audio/ogg',
  opus: 'audio/opus',
  m4a: 'audio/mp4',
  aac: 'audio/aac',
  mp4: 'video/mp4',
  mov: 'video/quicktime',
  avi: 'video/x-msvideo',
  mkv: 'video/x-matroska',
  webm: 'video/webm',
};

export function normalizeExtension(ext: string): string {
  return ext.replace(/^\./, '').replace(/[\/\-_]/g, '').toLowerCase().trim();
}

export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1 || lastDot === filename.length - 1) return '';
  return normalizeExtension(filename.slice(lastDot + 1));
}

export function isSourceFormatAllowed(ext: string): ext is SupportedSourceFormat {
  const normalized = normalizeExtension(ext);
  return SUPPORTED_SOURCE_FORMATS.includes(normalized as SupportedSourceFormat);
}

export function isConversionAllowed(sourceExt: string, targetExt: string): boolean {
  const source = normalizeExtension(sourceExt) as SupportedSourceFormat;
  const target = normalizeExtension(targetExt);

  if (!isSourceFormatAllowed(source)) {
    return false;
  }

  const allowedTargets = CONVERSION_MATRIX[source] || [];
  return allowedTargets.includes(target);
}

export function getSafeBaseName(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  const base = lastDot === -1 ? filename : filename.slice(0, lastDot);
  return base.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80) || 'converted';
}
