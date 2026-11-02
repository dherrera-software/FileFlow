import type { es } from './es';

export type DeepString<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepString<T[K]> : string;
};

export type Dictionary = DeepString<typeof es>;
export type Lang = 'es' | 'en';
