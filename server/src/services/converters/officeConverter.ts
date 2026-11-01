import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import os from 'os';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

let _libreofficeBinaryResolved = false;
let _libreofficeBinaryPath: string | null = null;

/**
 * Robust detection of LibreOffice / soffice binary across platforms.
 * Priority:
 * 1. LIBREOFFICE_PATH env var
 * 2. SOFFICE_PATH env var
 * 3. Common system paths
 */
function getLibreOfficeBinaryPath(): string | null {
  if (_libreofficeBinaryResolved) return _libreofficeBinaryPath;

  const candidates = [
    process.env.LIBREOFFICE_PATH,
    process.env.SOFFICE_PATH,
    '/usr/bin/soffice',
    '/usr/bin/libreoffice',
    '/usr/local/bin/soffice',
    '/usr/local/bin/libreoffice',
    '/snap/bin/libreoffice',
    '/opt/libreoffice7.6/program/soffice',
    '/opt/libreoffice/program/soffice',
    '/opt/homebrew/bin/soffice',
    '/Applications/LibreOffice.app/Contents/MacOS/soffice',
    'C:\\Program Files\\LibreOffice\\program\\soffice.exe',
    'C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe',
  ].filter(Boolean) as string[];

  for (const p of candidates) {
    try {
      if (fsSync.existsSync(p)) {
        _libreofficeBinaryPath = p;
        break;
      }
    } catch {}
  }

  _libreofficeBinaryResolved = true;
  return _libreofficeBinaryPath;
}

/**
 * Convert a file using LibreOffice CLI headless.
 * Creates a temp working directory, copies input, runs soffice, moves result.
 */
export async function convertWithLibreOfficeCli(
  binaryPath: string,
  inputPath: string,
  outputPath: string,
  sourceFormat: string,
  targetFormat: string,
): Promise<void> {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'libreoffice-'));
  const tempInputName = `doc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${sourceFormat}`;
  const tempInput = path.join(tempDir, tempInputName);

  try {
    await fs.copyFile(inputPath, tempInput);

    const args = [
      '--headless',
      '--invisible',
      '--nodefault',
      '--nofirststartwizard',
      '--nolockcheck',
      '--nologo',
      '--convert-to',
      targetFormat,
      '--outdir',
      tempDir,
      tempInput,
    ];

    // Special filter for PDF import
    if (sourceFormat === 'pdf' && ['docx', 'doc', 'odt', 'rtf', 'txt'].includes(targetFormat)) {
      args.splice(7, 0, '--infilter=writer_pdf_import');
    }

    await execFileAsync(binaryPath, args, { timeout: 120000 });

    const files = await fs.readdir(tempDir);
    const generatedFile = files.find(
      (f) => f.startsWith('doc_') && f.endsWith(`.${targetFormat}`),
    );

    if (!generatedFile) {
      throw new Error(
        `LibreOffice CLI executed but did not generate .${targetFormat} output. Files: ${files.join(', ')}`,
      );
    }

    const generatedPath = path.join(tempDir, generatedFile);
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    // Prefer rename, fallback to copy
    try {
      await fs.rename(generatedPath, outputPath);
    } catch {
      await fs.copyFile(generatedPath, outputPath);
    }
  } finally {
    // Cleanup temp directory
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
  }
}

/**
 * Convert using libreoffice-convert npm library as fallback.
 * Allows headless conversion when binary is missing or CLI fails.
 */
export async function convertWithLibreOffice(
  inputPath: string,
  outputPath: string,
  sourceFormat: string,
  targetFormat: string,
): Promise<void> {
  const binary = getLibreOfficeBinaryPath();

  // 1. Try direct CLI if binary found
  if (binary) {
    try {
      await convertWithLibreOfficeCli(binary, inputPath, outputPath, sourceFormat, targetFormat);
      return;
    } catch (cliErr: any) {
      console.warn(
        `[OfficeConverter] Direct LibreOffice CLI failed: ${cliErr.message}. Falling back to libreoffice-convert library...`,
      );
    }
  }

  // 2. Fallback to libreoffice-convert library
  try {
    const libre = await import('libreoffice-convert');
    const libreConvertWithOptions = (libre as any).convertWithOptions || libre.default?.convertWithOptions;
    const libreConvert = libre.default?.convert || (libre as any).convert;

    if (!libreConvert && !libreConvertWithOptions) {
      throw new Error('LibreOffice convert library could not be loaded');
    }

    const inputBuffer = await fs.readFile(inputPath);
    const convertedBuffer = await new Promise<Buffer>((resolve, reject) => {
      const options: any = {
        fileName: `document.${sourceFormat}`,
        sofficeBinaryPaths: binary ? [binary] : undefined,
        sofficeAdditionalArgs:
          sourceFormat === 'pdf' && ['docx', 'doc', 'odt', 'rtf', 'txt'].includes(targetFormat)
            ? ['--infilter=writer_pdf_import']
            : [],
      };

      if (libreConvertWithOptions) {
        libreConvertWithOptions(
          inputBuffer,
          `.${targetFormat}`,
          undefined,
          options,
          (err: Error | null, done: Buffer) => {
            if (err) return reject(err);
            resolve(done);
          },
        );
      } else {
        libreConvert(inputBuffer, `.${targetFormat}`, undefined, (err: Error | null, done: Buffer) => {
          if (err) return reject(err);
          resolve(done);
        });
      }
    });

    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, convertedBuffer);
  } catch (error: any) {
    console.error(`[OfficeConverter] LibreOffice conversion failed ${sourceFormat} -> ${targetFormat}:`, error);
    throw new Error(
      `Conversion engine error for ${sourceFormat} -> ${targetFormat}: ${error?.message || error}`,
    );
  }
}

/**
 * Public API for Office conversions.
 * COM/PowerShell path removed. Uses LibreOffice Headless exclusively.
 */
export async function convertOfficeDocuments(
  inputPath: string,
  outputPath: string,
  sourceFormat: string,
  targetFormat: string,
): Promise<void> {
  await convertWithLibreOffice(inputPath, outputPath, sourceFormat, targetFormat);
}

/**
 * Docker / Production notes:
 * Install LibreOffice headless on Linux:
 *   apt-get update && apt-get install -y libreoffice
 * Optional for better typography:
 *   apt-get install -y fonts-liberation fonts-dejavu
 * Ensure soffice is in PATH (/usr/bin/soffice) or set LIBREOFFICE_PATH/SOFFICE_PATH.
 * For minimal images, use libreoffice corefonts-free alternatives.
 */
