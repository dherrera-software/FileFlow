/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useReducer, useEffect, useRef, type ReactNode } from 'react';
import {
  type Toast,
  type ToastWithoutId,
  type ToastState,
  createToastId,
  showToast,
  dismissToast,
  dismissAllToasts,
  updateToast,
  promiseHelper,
} from '../../utils/toast';
import { ToastViewport } from './ToastViewport';

type ToastAction =
  | { type: 'ADD'; payload: ToastWithoutId }
  | { type: 'DISMISS'; payload: string }
  | { type: 'DISMISS_ALL' }
  | { type: 'UPDATE'; payload: { id: string; patch: Partial<ToastWithoutId> } };

const initialState: ToastState = {
  toasts: [],
  maxVisible: 5,
  defaultDuration: 4000,
  errorDuration: 6000,
  position: 'top-right',
};

const reducer = (state: ToastState, action: ToastAction): ToastState => {
  switch (action.type) {
    case 'ADD': {
      const toastPayload = action.payload;
      const id = createToastId();
      const newToast: Toast = { ...toastPayload, id, createdAt: Date.now() };
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
      updateToast(id, patch, state);
      return { ...state, toasts: [...state.toasts] };
    }
    default:
      return state;
  }
};

interface ToastContextValue {
  toasts: Toast[];
  show: (toast: ToastWithoutId) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
  update: (id: string, patch: Partial<ToastWithoutId>) => void;
  promise: <T, >(
    promiseToTrack: Promise<T>,
    options: {
      loading: ToastWithoutId;
      success: (data: T) => ToastWithoutId;
      error: (err: Error) => ToastWithoutId;
    }
  ) => Promise<T>;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider = ({
  children,
  position = 'top-right',
  maxVisible = 5,
}: {
  children: ReactNode;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  maxVisible?: number;
}) => {
  const [state, dispatch] = useReducer(reducer, { ...initialState, position, maxVisible });
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const visibleToasts = state.toasts;

  const context: ToastContextValue = {
    toasts: visibleToasts,
    show: (toast: ToastWithoutId) => {
      const id = showToast(toast, state);
      dispatch({ type: 'ADD', payload: toast });
      return id;
    },
    dismiss: (id: string) => {
      dismissToast(id, state);
      dispatch({ type: 'DISMISS', payload: id });
    },
    dismissAll: () => {
      dismissAllToasts(state);
      dispatch({ type: 'DISMISS_ALL' });
    },
    update: (id: string, patch: Partial<ToastWithoutId>) => {
      updateToast(id, patch, state);
      dispatch({ type: 'UPDATE', payload: { id, patch } });
    },
    promise: <T,>(
      promiseToTrack: Promise<T>,
      options: {
        loading: ToastWithoutId;
        success: (data: T) => ToastWithoutId;
        error: (err: Error) => ToastWithoutId;
      }
    ) => promiseHelper(promiseToTrack, options, state),
  };

  return (
    <ToastContext.Provider value={context}>
      {children}
      <ToastViewport toasts={visibleToasts} position={state.position} onDismiss={context.dismiss} />
    </ToastContext.Provider>
  );
};

export const useToasts = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToasts must be used within a ToastProvider');
  }
  return context;
};
