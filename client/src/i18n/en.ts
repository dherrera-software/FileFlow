/**
 * English dictionary - Reference for FileFlow i18n.
 * Contains translations for all keys defined in es.ts.
 */

export const en = {
  common: {
    convert: 'Convert',
    converting: 'Converting...',
    download: 'Download',
    error: 'Error',
    success: 'Success!',
    fileSizeLimit: 'up to {maxMB} MB',
    convertFile: 'Convert a file',
    selectFile: 'Select file',
    chooseAnotherFile: 'Choose another file',
    dismiss: 'Dismiss',
    retry: 'Retry',
    loading: 'Loading',
  },
  navbar: {
    freeTag: 'Free, no account',
    startConverting: 'Start converting',
    toggleThemeDark: 'Switch to dark mode',
    toggleThemeLight: 'Switch to light mode',
  },
  dropzone: {
    dropHere: 'Drag a file here',
    dragDrop: 'Drop the file to select it',
    dropToCheck: 'Drop to check the format and see conversion options.',
    dropSupports: 'or choose from your device — supports {formats}.',
    selectFile: 'Choose a file to convert',
    removeFile: 'Remove {fileName}',
    dropzoneLabel: 'Drag and drop files area',
    formatCategories: 'Format categories',
    accepts: 'Accepts',
    maxSize: 'up to {maxMB} MB',
    titleIdle: 'Drag a file here',
    titleDragging: 'Drop the file to select it',
    subtitleIdle: 'or choose from your device — supports documents, images, data, presentations, audio and video.',
    subtitleDragging: 'Drop to check the format and see conversion options.',
    selectButton: 'Select file',
    chooseAnother: 'Choose another file',
    acceptsPrefix: 'Accepts',
  },
  options: {
    convertTo: 'Convert to',
    detectedFormat: 'detected {format}',
    progressStage: {
      uploading: 'Uploading file...',
      queued: 'Queued...',
      processing: 'Processing conversion in background...',
      optimizing: 'Optimizing final file...',
      completed: 'Completed!',
    },
  },
  errors: {
    unsupportedFormat: 'Unsupported format.',
    fileTooLarge: 'File is {size}. Limit is {maxMB} MB.',
    fileEmpty: 'This file is empty; there is nothing to convert.',
    networkError: 'Could not connect to the backend server.',
    conversionFailed: 'Conversion failed on the server.',
    fileConversionFailed: 'Cannot convert this file',
  },
  footer: {
    tagline: 'Safe, fast, and private file converter.',
    activeEngine: 'Conversion engine active',
    copyright: '© {year} {name} · Safe file converter',
  },
} as const;
