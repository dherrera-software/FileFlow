import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { convertOfficeDocuments } from './officeConverter.js';

let _excelJSInstance: any = null;

async function getExcelJS() {
  if (!_excelJSInstance) {
    const mod = await import('exceljs');
    _excelJSInstance = (mod as any).default || mod;
  }
  return _excelJSInstance;
}

export async function convertSpreadsheetAndData(
  inputPath: string,
  outputPath: string,
  sourceFormat: string,
  targetFormat: string,
): Promise<void> {
  const ExcelJS = await getExcelJS();
  const { XMLParser } = await import('fast-xml-parser');

  // If source is XLS or ODS and target is PDF/XLSX/CSV, use Office COM / Excel
  if ((sourceFormat === 'xls' || sourceFormat === 'ods') && ['xlsx', 'csv', 'pdf'].includes(targetFormat)) {
    return convertOfficeDocuments(inputPath, outputPath, sourceFormat, targetFormat);
  }

  // 1. JSON -> CSV or XLSX
  if (sourceFormat === 'json') {
    const jsonRaw = await fs.readFile(inputPath, 'utf-8');
    let data: any;
    try {
      data = JSON.parse(jsonRaw);
    } catch {
      throw new Error('Invalid JSON input file');
    }

    const items: Record<string, any>[] = Array.isArray(data) ? data : (data.items || data.data || [data]);
    const headers = Array.from(new Set(items.flatMap((item) => (typeof item === 'object' && item !== null ? Object.keys(item) : ['value']))));

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data');
    worksheet.columns = headers.map((h) => ({ header: h, key: h, width: 20 }));

    for (const item of items) {
      if (typeof item === 'object' && item !== null) {
        worksheet.addRow(item);
      } else {
        worksheet.addRow({ value: item });
      }
    }

    if (targetFormat === 'csv') {
      await workbook.csv.writeFile(outputPath);
    } else {
      await workbook.xlsx.writeFile(outputPath);
    }
    return;
  }

  // 2. XML -> CSV or XLSX
  if (sourceFormat === 'xml') {
    const xmlRaw = await fs.readFile(inputPath, 'utf-8');
    const parser = new XMLParser();
    const parsed = parser.parse(xmlRaw);

    let records: any[] = [];
    const findArray = (obj: any): any[] | null => {
      if (!obj || typeof obj !== 'object') return null;
      for (const key of Object.keys(obj)) {
        if (Array.isArray(obj[key])) return obj[key];
        if (typeof obj[key] === 'object') {
          const res = findArray(obj[key]);
          if (res) return res;
        }
      }
      return null;
    };

    records = findArray(parsed) || [parsed];
    const headers = Array.from(new Set(records.flatMap((r) => (typeof r === 'object' && r !== null ? Object.keys(r) : ['value']))));

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data');
    worksheet.columns = headers.map((h) => ({ header: h, key: h, width: 20 }));

    for (const r of records) {
      if (typeof r === 'object' && r !== null) {
        worksheet.addRow(r);
      } else {
        worksheet.addRow({ value: r });
      }
    }

    if (targetFormat === 'csv') {
      await workbook.csv.writeFile(outputPath);
    } else {
      await workbook.xlsx.writeFile(outputPath);
    }
    return;
  }

  // 3. TSV -> CSV or XLSX
  if (sourceFormat === 'tsv') {
    const raw = await fs.readFile(inputPath, 'utf-8');
    const rows = raw.split(/\r?\n/).map((line) => line.split('\t'));

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');
    rows.forEach((row) => worksheet.addRow(row));

    if (targetFormat === 'csv') {
      await workbook.csv.writeFile(outputPath);
    } else {
      await workbook.xlsx.writeFile(outputPath);
    }
    return;
  }

  // 4. XLSX or CSV -> CSV, XLSX, TSV, JSON, XML, PDF
  const workbook = new ExcelJS.Workbook();
  if (sourceFormat === 'csv') {
    await workbook.csv.readFile(inputPath);
  } else {
    const fileStats = await fs.stat(inputPath);
    if (fileStats.size > 5 * 1024 * 1024) {
      const stream = fsSync.createReadStream(inputPath);
      await workbook.xlsx.read(stream);
    } else {
      await workbook.xlsx.readFile(inputPath);
    }
  }

  const worksheet = workbook.worksheets[0] || workbook.addWorksheet('Sheet1');

  if (targetFormat === 'pdf') {
    if (sourceFormat === 'csv') {
      const tempXlsx = path.join(os.tmpdir(), `temp-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.xlsx`);
      try {
        await workbook.xlsx.writeFile(tempXlsx);
        await convertOfficeDocuments(tempXlsx, outputPath, 'xlsx', 'pdf');
      } finally {
        fs.unlink(tempXlsx).catch(() => {});
      }
      return;
    }
    return convertOfficeDocuments(inputPath, outputPath, 'xlsx', 'pdf');
  }

  if (targetFormat === 'xlsx') {
    await workbook.xlsx.writeFile(outputPath);
    return;
  }

  if (targetFormat === 'csv') {
    await workbook.csv.writeFile(outputPath);
    return;
  }

  if (targetFormat === 'tsv') {
    const lines: string[] = [];
    worksheet.eachRow((row: any) => {
      const values = Array.isArray(row.values) ? row.values.slice(1) : [];
      lines.push(values.map((v: any) => (v === null || v === undefined ? '' : String(v))).join('\t'));
    });
    await fs.writeFile(outputPath, lines.join('\n'), 'utf-8');
    return;
  }

  if (targetFormat === 'json') {
    const rows: Record<string, any>[] = [];
    let headers: string[] = [];

    worksheet.eachRow((row: any, rowNumber: number) => {
      const values = Array.isArray(row.values) ? row.values.slice(1) : [];
      if (rowNumber === 1) {
        headers = values.map((v: any, i: number) => (v ? String(v) : `col_${i + 1}`));
      } else {
        const item: Record<string, any> = {};
        headers.forEach((h, i) => {
          item[h] = values[i] !== undefined ? values[i] : null;
        });
        rows.push(item);
      }
    });

    await fs.writeFile(outputPath, JSON.stringify(rows, null, 2), 'utf-8');
    return;
  }

  if (targetFormat === 'xml') {
    const xmlChunks: string[] = ['<?xml version="1.0" encoding="UTF-8"?>\n<spreadsheet>\n'];
    let headers: string[] = [];

    worksheet.eachRow((row: any, rowNumber: number) => {
      const values = Array.isArray(row.values) ? row.values.slice(1) : [];
      if (rowNumber === 1) {
        headers = values.map((v: any, i: number) => (v ? String(v).replace(/[^a-zA-Z0-9_]/g, '_') : `col_${i + 1}`));
      } else {
        xmlChunks.push('  <row>\n');
        headers.forEach((h, i) => {
          const val = values[i] !== undefined && values[i] !== null ? String(values[i]) : '';
          const escaped = val
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
          xmlChunks.push(`    <${h}>${escaped}</${h}>\n`);
        });
        xmlChunks.push('  </row>\n');
      }
    });
    xmlChunks.push('</spreadsheet>\n');
    await fs.writeFile(outputPath, xmlChunks.join(''), 'utf-8');
    return;
  }

  throw new Error(`Unsupported spreadsheet conversion: ${sourceFormat} to ${targetFormat}`);
}

