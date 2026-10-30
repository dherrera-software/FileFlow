import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import os from 'os';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

let _psScriptPath: string | null = null;
let _libreofficeBinaryResolved = false;
let _libreofficeBinaryPath: string | null = null;

function getPowerShellScriptPath(): string {
  if (_psScriptPath) return _psScriptPath;

  const possiblePaths = [
    path.resolve(process.cwd(), 'src/scripts/convertOffice.ps1'),
    path.resolve(process.cwd(), 'dist/scripts/convertOffice.ps1'),
    path.resolve(typeof __dirname !== 'undefined' ? __dirname : '', '../scripts/convertOffice.ps1'),
  ];
  for (const p of possiblePaths) {
    if (fsSync.existsSync(p)) {
      _psScriptPath = p;
      return p;
    }
  }
  _psScriptPath = possiblePaths[0];
  return _psScriptPath;
}

function getLibreOfficeBinaryPath(): string | null {
  if (_libreofficeBinaryResolved) return _libreofficeBinaryPath;

  const possiblePaths = [
    process.env.LIBREOFFICE_PATH,
    process.env.SOFFICE_PATH,
    '/usr/bin/libreoffice',
    '/usr/bin/soffice',
    '/snap/bin/libreoffice',
    '/opt/libreoffice/program/soffice',
    'C:\\Program Files\\LibreOffice\\program\\soffice.exe',
    'C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe',
  ].filter(Boolean) as string[];

  for (const p of possiblePaths) {
    if (fsSync.existsSync(p)) {
      _libreofficeBinaryPath = p;
      break;
    }
  }

  _libreofficeBinaryResolved = true;
  return _libreofficeBinaryPath;
}

export async function convertWithOfficeCOM(
  inputPath: string,
  outputPath: string,
  sourceFormat: string,
  targetFormat: string,
): Promise<void> {
  const scriptPath = getPowerShellScriptPath();
  const { stdout, stderr } = await execFileAsync(
    'powershell.exe',
    [
      '-NoProfile',
      '-NonInteractive',
      '-ExecutionPolicy',
      'Bypass',
      '-File',
      scriptPath,
      '-InputPath',
      inputPath,
      '-OutputPath',
      outputPath,
      '-SourceFormat',
      sourceFormat,
      '-TargetFormat',
      targetFormat,
    ],
    { timeout: 120000, maxBuffer: 10 * 1024 * 1024 },
  );

  if (!stdout.includes('SUCCESS')) {
    throw new Error(stderr || stdout || 'Office COM conversion failed');
  }
}

export async function convertWithLibreOfficeCli(
  binaryPath: string,
  inputPath: string,
  outputPath: string,
  sourceFormat: string,
  targetFormat: string,
): Promise<void> {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'libreoffice-'));
  const tempInput = path.join(tempDir, `doc_${Date.now()}.${sourceFormat}`);

  try {
    await fs.copyFile(inputPath, tempInput);

    const args = [
      '--headless',
      '--invisible',
      '--nodefault',
      '--nofirststartwizard',
      '--nolockcheck',
      '--nologo',
    ];

    if (sourceFormat === 'pdf' && ['docx', 'doc', 'odt', 'rtf', 'txt'].includes(targetFormat)) {
      args.push('--infilter=writer_pdf_import');
    }

    args.push('--convert-to', targetFormat, '--outdir', tempDir, tempInput);

    await execFileAsync(binaryPath, args, { timeout: 120000 });

    const files = await fs.readdir(tempDir);
    const generatedFile = files.find(
      (f) => f.startsWith('doc_') && f.endsWith(`.${targetFormat}`),
    );

    if (!generatedFile) {
      throw new Error(
        `LibreOffice CLI executed but did not generate the .${targetFormat} output file.`,
      );
    }

    const generatedPath = path.join(tempDir, generatedFile);
    try {
      await fs.rename(generatedPath, outputPath);
    } catch {
      await fs.copyFile(generatedPath, outputPath);
    }
  } finally {
    fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
  }
}

export async function convertWithLibreOffice(
  inputPath: string,
  outputPath: string,
  sourceFormat: string,
  targetFormat: string,
): Promise<void> {
  const binary = getLibreOfficeBinaryPath();

  if (binary) {
    try {
      await convertWithLibreOfficeCli(binary, inputPath, outputPath, sourceFormat, targetFormat);
      return;
    } catch (cliErr: any) {
      console.warn(
        `[Conversion] Direct LibreOffice CLI attempt failed: ${cliErr.message}. Trying libreoffice-convert fallback...`,
      );
    }
  }

  try {
    const libre = await import('libreoffice-convert');
    const libreConvertWithOptions = (libre as any).convertWithOptions || libre.default?.convertWithOptions;
    const libreConvert = libre.default?.convert || (libre as any).convert;

    if (!libreConvert && !libreConvertWithOptions) {
      throw new Error('LibreOffice convert library could not be loaded');
    }

    const inputBuffer = await fs.readFile(inputPath);
    const convertedBuffer = await new Promise<Buffer>((resolve, reject) => {
      const options = {
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

    await fs.writeFile(outputPath, convertedBuffer);
  } catch (error: any) {
    console.error(
      `[Conversion Error: LibreOffice] Failed to convert ${sourceFormat} to ${targetFormat}:`,
      error,
    );
    throw new Error(
      `Conversion engine error for ${sourceFormat} -> ${targetFormat}: ${error?.message || error}`,
    );
  }
}

export async function convertOfficeDocuments(
  inputPath: string,
  outputPath: string,
  sourceFormat: string,
  targetFormat: string,
): Promise<void> {
  if (process.platform === 'win32') {
    try {
      await convertWithOfficeCOM(inputPath, outputPath, sourceFormat, targetFormat);
      return;
    } catch (err: any) {
      console.warn(`[Conversion] MS Office COM conversion warning: ${err.message}. Trying LibreOffice fallback...`);
    }
  }

  await convertWithLibreOffice(inputPath, outputPath, sourceFormat, targetFormat);
}

