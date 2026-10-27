declare module 'libreoffice-convert' {
  export function convert(
    document: Buffer,
    format: string,
    filter: any,
    callback: (err: Error | null, result: Buffer) => void,
  ): void;
}

declare module 'pdf-poppler' {
  export interface ConvertOptions {
    format?: string;
    out_dir?: string;
    out_prefix?: string;
    page?: number | null;
    scale?: number;
  }

  export function convert(file: string, options: ConvertOptions): Promise<any>;
}

declare module 'heic-convert';
declare module 'pdf-parse';
