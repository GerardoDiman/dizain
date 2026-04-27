type ToastType = 'success' | 'error' | 'info';

export interface ToastEventDetail {
  id: string;
  type: ToastType;
  message: string;
}

export const TOAST_EVENT_NAME = 'dz-toast';

function emitToast(type: ToastType, message: string) {
  const event = new CustomEvent('dz-toast', {
    detail: {
      id: Math.random().toString(36).substring(2, 9),
      type,
      message,
    },
  });
  
  // Safe check for window to support SSR if needed
  if (typeof window !== 'undefined') {
    window.dispatchEvent(event);
  }
}

export const toast = {
  success: (message: string) => emitToast('success', message),
  error: (message: string) => emitToast('error', message),
  info: (message: string) => emitToast('info', message),
};

// Expose to window for debugging
if (typeof window !== 'undefined') {
  (window as any).dzToast = toast;
}
