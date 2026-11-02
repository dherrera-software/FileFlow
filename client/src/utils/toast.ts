import { v4 as uuidv4 } from 'uuid';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'loading';
  title: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number; // ms, 0 = persistente
  dismissible?: boolean;
  createdAt: number;
}

export type ToastWithoutId = Omit<Toast, 'id' | 'createdAt'>;

export function createToastId(): string {
  return uuidv4();
}

/**
 * Muestra un toast y devuelve su id.
 * Si ya hay maxVisible toasts, el más antiguo se elimina (FIFO).
 */
export function showToast(toast: ToastWithoutId, state: ToastState): string {
  const id = createToastId();
  const newToast: Toast = { ...toast, id, createdAt: Date.now() };
  state.toasts = [...state.toasts].filter(t => t.id !== id); // quitar si ya existe
  state.toasts = [newToast, ...state.toasts].slice(0, state.maxVisible);
  return id;
}

/**
 * Oculta un toast por id.
 */
export function dismissToast(id: string, state: ToastState): void {
  state.toasts = state.toasts.filter(t => t.id !== id);
}

/**
 * Oculta todos los toasts.
 */
export function dismissAllToasts(state: ToastState): void {
  state.toasts = [];
}

/**
 * Actualiza un toast existente (útil para loading→success/error).
 */
export function updateToast(id: string, patch: Partial<ToastWithoutId>, state: ToastState): void {
  const idx = state.toasts.findIndex(t => t.id === id);
  if (idx === -1) return;
  state.toasts[idx] = { ...state.toasts[idx], ...patch } as Toast;
}

/**
 * Helper que muestra loading, y al resolverse muestra success,
 * o al fallar muestra error. Retorna la promesa original.
 */
export async function promise<T>(
  promise: Promise<T>,
  options: {
    loading: ToastWithoutId;
    success: (data: T) => ToastWithoutId;
    error: (err: Error) => ToastWithoutId;
  },
  state: ToastState,
): Promise<T> {
  // Mostrar loading
  const loadingId = showToast({ ...options.loading, dismissible: false, duration: 0 }, state);
  try {
    const data = await promise;
    // Success: reemplazar loading por success
    const successToast = { ...options.success(data), dismissible: true, duration: state.defaultDuration };
    updateToast(loadingId, { ...successToast, duration: state.defaultDuration }, state);
    return data;
  } catch (err: any) {
    // Error: reemplazar loading por error
    const errorToast = { ...options.error(err), dismissible: true, duration: state.errorDuration };
    updateToast(loadingId, { ...errorToast, duration: state.errorDuration }, state);
    throw err;
  }
}

/** Estado interno del provider (no exponer totalmente) */
export interface ToastState {
  toasts: Toast[];
  maxVisible: number;
  defaultDuration: number;
  errorDuration: number;
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}
