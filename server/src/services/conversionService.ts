import { normalizeExtension } from '../utils/formatRules.js';
import type { ConvertOptions } from './converters/types.js';
import { convertOfficeDocuments } from './converters/officeConverter.js';
import { convertImage } from './converters/imageConverter.js';
import { convertMedia } from './converters/mediaConverter.js';
import { convertSpreadsheetAndData } from './converters/spreadsheetConverter.js';
import { convertSpecializedDocuments } from './converters/specializedConverter.js';

export type { ConvertOptions };

const IMAGE_FORMATS = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'gif', 'bmp', 'tiff', 'tif', 'svg'];
const MEDIA_FORMATS = ['wav', 'mp3', 'flac', 'm4a', 'aac', 'ogg', 'opus', 'mp4', 'mov', 'avi', 'mkv', 'webm'];
const DATA_FORMATS = ['xlsx', 'xls', 'csv', 'tsv', 'ods', 'json', 'xml'];
const OFFICE_SOURCES = ['docx', 'doc', 'rtf', 'odt', 'html', 'htm', 'txt', 'pdf', 'pdfa', 'pptx', 'ppt', 'odp', 'xlsx', 'xls', 'ods'];

/**
 * Master dispatcher for all supported conversions.
 * Delegates to specialized converter modules based on source and target formats.
 */
export async function convertFile(options: ConvertOptions): Promise<void> {
  const source = normalizeExtension(options.sourceFormat);
  const target = normalizeExtension(options.targetFormat);

  // 1. GIF <-> MP4
  if ((source === 'gif' && target === 'mp4') || (source === 'mp4' && target === 'gif')) {
    return convertMedia(options.inputPath, options.outputPath, source, target);
  }

  // 2. Video to frame extraction (Video -> JPG/PNG)
  if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(source) && ['jpg', 'jpeg', 'png'].includes(target)) {
    return convertMedia(options.inputPath, options.outputPath, source, target);
  }

  // 3. Audio & Video media transcoding (including Video -> Audio extraction)
  if (MEDIA_FORMATS.includes(source) && MEDIA_FORMATS.includes(target)) {
    return convertMedia(options.inputPath, options.outputPath, source, target);
  }

  // 4. Image conversions (Sharp, heic-convert, pdf-lib)
  if (IMAGE_FORMATS.includes(source) && (IMAGE_FORMATS.includes(target) || target === 'pdf')) {
    return convertImage(options.inputPath, options.outputPath, source, target);
  }

  // 5. Spreadsheet and structured data
  if (DATA_FORMATS.includes(source) && (DATA_FORMATS.includes(target) || target === 'pdf')) {
    return convertSpreadsheetAndData(options.inputPath, options.outputPath, source, target);
  }

  // 6. TXT to MP3
  if (source === 'txt' && target === 'mp3') {
    return convertSpecializedDocuments(options.inputPath, options.outputPath, source, target);
  }

  // 7. Markdown, HTML -> MD, EPUB, PDF -> TXT/XLSX/CSV/JPG/PNG
  if (
    source === 'md' ||
    target === 'md' ||
    source === 'epub' ||
    (source === 'pdf' && ['txt', 'xlsx', 'csv', 'jpg', 'jpeg', 'png'].includes(target)) ||
    (source === 'txt' && ['html', 'md'].includes(target))
  ) {
    return convertSpecializedDocuments(options.inputPath, options.outputPath, source, target);
  }

  // 8. Office documents (Word, Excel, PowerPoint -> PDF, PDF/A, DOCX, TXT, HTML, RTF, ODT, JPG, PNG, MP4)
  if (OFFICE_SOURCES.includes(source)) {
    return convertOfficeDocuments(options.inputPath, options.outputPath, source, target);
  }

  throw new Error(`Unsupported conversion route from '${source}' to '${target}'`);
}
