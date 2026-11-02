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
  const imgRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cleanupFns = useRef<(() => void)[]>([]);

  const addCleanup = useCallback((fn: () => void) => {
    cleanupFns.current.push(fn);
  }, []);

  const clearCleanup = useCallback(() => {
    cleanupFns.current.forEach(fn => fn());
    cleanupFns.current = [];
  }, []);

  useEffect(() => {
    // Limpiar previo antes de crear nuevo
    clearCleanup();
    if (!file) {
      setPreview({ kind: 'none' });
      return;
    }

    const type = file.type;
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const name = file.name;

    // 1) Imagen (excepto SVG)
    if (type.startsWith('image/') && ext !== 'svg') {
      const url = URL.createObjectURL(file);
      addCleanup(() => URL.revokeObjectURL(url));
      const img = new Image();
      img.onload = () => {
        setPreview({ kind: 'image', src: url, width: img.width, height: img.height });
        // No es necesario revocar después de onload si ya la usamos en src,
        // pero lo hacemos para ser seguros:
        try { URL.revokeObjectURL(url); } catch {}
      };
      img.onerror = (e) => {
        try { URL.revokeObjectURL(url); } catch {}
        setPreview({ kind: 'image', src: url, error: 'No se pudo cargar la imagen' });
      };
      img.src = url;
      // Guardar referencia para posible cleanup manual
      imgRef.current = img;
      return;
    }

    // 2) SVG
    if (type === 'image/svg+xml' || ext === 'svg') {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview({ kind: 'image', src: e.target?.result as string });
      };
      reader.onerror = () => setPreview({ kind: 'image', error: 'No se pudo leer SVG' });
      reader.readAsDataURL(file);
      return;
    }

    // 3) PDF
    if (type === 'application/pdf' || ext === 'pdf') {
      const url = URL.createObjectURL(file);
      addCleanup(() => URL.revokeObjectURL(url));
      // Intentar cargar PDF.js de forma lazy
      import('pdfjs-dist/build/pdf.mjs')
        .then(pdfjs => {
          pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs';
          pdfjs.getDocument({ url }).promise
            .then((pdf) => pdf.getPage(1).then((page) => {
              const viewport = page.getViewport({ scale: 0.5 });
              const canvas = document.createElement('canvas');
              canvas.width = viewport.width;
              canvas.height = viewport.height;
              const ctx = canvas.getContext('2d');
              if (!ctx) return;
              page.render({ canvasContext: ctx, viewport }).promise.then(() => {
                const dataURL = canvas.toDataURL();
                setPreview({
                  kind: 'pdf',
                  src: url,          // object URL para download si se quiere
                  poster: dataURL,   // miniatura canvas
                  width: viewport.width,
                  height: viewport.height,
                  pages: pdf.numPages,
                });
              });
            }))
            .catch(() => {
              // Fallback: ícono + metadata
              setPreview({ kind: 'pdf', error: 'PDF.js no disponible, usar ícono' });
            });
        })
        .catch(() => {
          // Fallback suave sin PDF.js
          setPreview({ kind: 'pdf', error: 'No se pudo cargar PDF' });
        });
      return;
    }

    // 3) Video
    if (type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      addCleanup(() => URL.revokeObjectURL(url));
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true; // evita autoplay / ruido
      video.onloadedmetadata = () => {
        // buscar frame a 1s para poster
        video.currentTime = 1;
      };
      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d')!.drawImage(video, 0, 0);
        const postUrl = canvas.toDataURL();
        setPreview({
          kind: 'video',
          poster: postUrl,
          src: url,
          duration: video.duration,
          width: video.videoWidth,
          height: video.videoHeight,
        });
      };
      video.onerror = (e) => {
        try { URL.revokeObjectURL(url); } catch {}
        setPreview({ kind: 'video', error: 'No se pudo cargar el video' });
      };
      video.src = url;
      videoRef.current = video;
      return;
    }

    // 4) Audio
    if (type.startsWith('audio/')) {
      const url = URL.createObjectURL(file);
      addCleanup(() => URL.revokeObjectURL(url));
      const audio = new Audio(url);
      audio.onloadedmetadata = () => {
        setPreview({ kind: 'audio', src: url, duration: audio.duration });
      };
      audio.onerror = (e) => {
        try { URL.revokeObjectURL(url); } catch {}
        setPreview({ kind: 'audio', error: 'No se pudo cargar el audio' });
      };
      return;
    }

    // 5) Documentos / Otros
    setPreview({ kind: 'document' });
  }, [file, clearCleanup]);

  // Al desmontar, asegurar cleanup total
  useEffect(() => () => clearCleanup(), [clearCleanup]);

  return preview;
}
