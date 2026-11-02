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
  },
  navbar: {
    freeTag: 'Free, no account',
    startConverting: 'Start converting',
    toggleThemeDark: 'Switch to dark mode',
    toggleThemeLight: 'Switch to light mode',
  },
  dropzone: {
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
  },
  footer: {
    tagline: 'Safe, fast, and private file converter.',
    activeEngine: 'Conversion engine active',
    copyright: '© {year} {name} · Safe file converter',
  },
} as const;