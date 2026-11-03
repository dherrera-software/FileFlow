import { useState, useEffect, useRef, useCallback } from 'react';

export type PreviewKind = 'image' | 'pdf' | 'video' | 'audio' | 'document' | 'none';

export interface FilePreview {
  kind: PreviewKind;
  src?: string;           // object URL, data URL, o blob URL
  poster?: string;        // para video: frame poster (data URL)
  duration?: number;      // segundos (video/audio)
  width?: number;         // ancho real (img/video)
  height?: number;        // alto real (img/video)
  pages?: number;         // número de páginas (PDF)
  error?: string;         // mensaje si falló generación
}

export function useFilePreview(file: File | null): FilePreview {
  const [preview, setPreview] = useState<FilePreview>({ kind: 'none' });
  const cleanupFns = useRef<(() => void)[]>([]);

  const addCleanup = useCallback((fn: () => void) => {
    cleanupFns.current.push(fn);
  }, []);

  const clearCleanup = useCallback(() => {
    cleanupFns.current.forEach(fn => {
      try {
        fn();
      } catch {
        // ignore cleanup error
      }
    });
    cleanupFns.current = [];
  }, []);

  useEffect(() => {
    clearCleanup();
    if (!file) {
      const timer = setTimeout(() => {
        setPreview({ kind: 'none' });
      }, 0);
      return () => {
        clearTimeout(timer);
        clearCleanup();
      };
    }

    const type = file.type;
    const ext = file.name.split('.').pop()?.toLowerCase() || '';

    // 1) Imagen (excepto SVG)
    if (type.startsWith('image/') && ext !== 'svg') {
      const url = URL.createObjectURL(file);
      addCleanup(() => URL.revokeObjectURL(url));
      const img = new Image();
      img.onload = () => {
        setPreview({ kind: 'image', src: url, width: img.width, height: img.height });
      };
      img.onerror = () => {
        setPreview({ kind: 'image', src: url, error: 'No se pudo cargar la imagen' });
      };
      img.src = url;
      return () => clearCleanup();
    }

    // 2) SVG
    if (type === 'image/svg+xml' || ext === 'svg') {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview({ kind: 'image', src: e.target?.result as string });
      };
      reader.onerror = () => setPreview({ kind: 'image', error: 'No se pudo leer SVG' });
      reader.readAsDataURL(file);
      return () => clearCleanup();
    }

    // 3) PDF
    if (type === 'application/pdf' || ext === 'pdf') {
      const timer = setTimeout(() => {
        setPreview({ kind: 'pdf' });
      }, 0);
      return () => {
        clearTimeout(timer);
        clearCleanup();
      };
    }

    // 4) Video
    if (type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      addCleanup(() => URL.revokeObjectURL(url));
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.onloadedmetadata = () => {
        video.currentTime = Math.min(1, video.duration / 2);
      };
      video.onseeked = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth || 320;
          canvas.height = video.videoHeight || 240;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const postUrl = canvas.toDataURL();
            setPreview({
              kind: 'video',
              poster: postUrl,
              src: url,
              duration: video.duration,
              width: video.videoWidth,
              height: video.videoHeight,
            });
            return;
          }
        } catch {
          // ignore canvas extraction error
        }
        setPreview({
          kind: 'video',
          src: url,
          duration: video.duration,
          width: video.videoWidth,
          height: video.videoHeight,
        });
      };
      video.onerror = () => {
        setPreview({ kind: 'video', error: 'No se pudo cargar el video' });
      };
      video.src = url;
      return () => clearCleanup();
    }

    // 5) Audio
    if (type.startsWith('audio/')) {
      const url = URL.createObjectURL(file);
      addCleanup(() => URL.revokeObjectURL(url));
      const audio = new Audio(url);
      audio.onloadedmetadata = () => {
        setPreview({ kind: 'audio', src: url, duration: audio.duration });
      };
      audio.onerror = () => {
        setPreview({ kind: 'audio', error: 'No se pudo cargar el audio' });
      };
      return () => clearCleanup();
    }

    // 6) Documentos / Otros
    const timer = setTimeout(() => {
      setPreview({ kind: 'document' });
    }, 0);
    return () => {
      clearTimeout(timer);
      clearCleanup();
    };
  }, [file, clearCleanup, addCleanup]);

  return preview;
}
