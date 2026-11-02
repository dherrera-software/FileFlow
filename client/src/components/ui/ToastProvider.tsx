import { createContext, useContext, useReducer, useEffect, useRef, ReactNode, Dispatch } from 'react';
import { Toast, ToastWithoutId, ToastState, showToast, dismissToast, dismissAllToasts, updateToast, promise } from '../utils/toast';

type ToastAction =
  | { type: 'ADD'; payload: ToastWithoutId }
  | { type: 'DISMISS'; payload: string }
  | { type: 'DISMISS_ALL' }
  | { type: 'UPDATE'; payload: { id: string; patch: Partial<ToastWithoutId> } };

const initialState: ToastState = {
  toasts: [],
  maxVisible: Number(process.env.VITE_TOAST_MAX_VISIBLE || 5),
  defaultDuration: Number(process.env.VITE_TOAST_DEFAULT_DURATION || 4000),
  errorDuration: Number(process.env.VITE_TOAST_ERROR_DURATION || 6000),
  position: (process.env.VITE_TOAST_POSITION as 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center') || 'top-right',
};

const reducer = (state: ToastState, action: ToastAction): ToastState => {
  switch (action.type) {
    case 'ADD': {
      const { toast } = action.payload;
      const id = toast.id || createToastId();
      const newToast: Toast = { ...toast, id, createdAt: Date.now() };
      let toasts = [...state.toasts].filter(t => t.id !== id);
      toasts = [newToast, ...toasts].slice(0, state.maxVisible);
      return { ...state, toasts };
    }
    case 'DISMISS':
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.payload) };
    case 'DISMISS_ALL':
      return { ...state, toasts: [] };
    case 'UPDATE': {
      const { id, patch } = action.payload;
      return updateToast(id, patch, state);
    }
    default:
      return state;
  }
};

const ToastContext = createContext<{
  toasts: Toast[];
  show: (toast: ToastWithoutId) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
  update: (id: string, patch: Partial<ToastWithoutId>) => void;
  promise: <T,>(promise: Promise<T>, options: {
    loading: ToastWithoutId;
    success: (data: T) => ToastWithoutId;
    error: (err: Error) => ToastWithoutId;
  }) => Promise<T>;
} | null>(null);

export const ToastProvider = ({ children, position = 'top-right', maxVisible = 5 }: { children: ReactNode; position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'; maxVisible?: number }) => {
  const [state, dispatch] = useReducer(reducer, { ...initialState, position, maxVisible });
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // Filtrar toasts que deben mostrarse (resppetar maxVisible y posición)
  const visibleToasts = state.toasts.filter(t => mountedRef.current);

  const context = {
    toasts: visibleToasts,
    show: (toast: ToastWithoutId) => {
      const id = showToast(toast, state);
      // Asegurar maxVisible después de añadir
      if (state.toasts.length > state.maxVisible) {
        state.toasts = state.toasts.slice(0, state.maxVisible);
      }
      return id;
    },
    dismiss: (id: string) => {
      dismissToast(id, state);
    },
    dismissAll: () => {
      dismissAllToasts(state);
    },
    update: (id: string, patch: Partial<ToastWithoutId>) => {
      updateToast(id, patch, state);
    },
    promise: <T>(promise: Promise<T>, options: {
      loading: ToastWithoutId;
      success: (data: T) => ToastWithoutId;
      error: (err: Error) => ToastWithoutId;
    }) => promise(promise, options, state),
  };

  if (!mountedRef.current) return null;

  return (
    <ToastContext.Provider value={context}>
      {children}
      <ToastViewport toasts={visibleToasts} position={state.position} />
    </ToastContext.Provider>
  );
};

export const useToasts = (): {
  toasts: Toast[];
  show: (toast: ToastWithoutId) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
  update: (id: string, patch: Partial<ToastWithoutId>) => void;
  promise: <T>(promise: Promise<T>, options: {
    loading: ToastWithoutId;
    success: (data: T) => ToastWithoutId;
    error: (err: Error) => ToastWithoutId;
  }) => Promise<T>;
} => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToasts must be used within a ToastProvider');
  }
  return context;
};
