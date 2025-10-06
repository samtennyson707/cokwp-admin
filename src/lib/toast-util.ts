import { toast } from 'sonner';

/**
 * Toast utility options interface
 */
interface ToastOptions {
  description?: string;
  duration?: number;
}

/**
 * Success toast with consistent green styling and white text
 */
export function showSuccessToast(message: string, options: ToastOptions = {}): void {
  const { description, duration = 4000 } = options;

  toast.success(message, {
    description,
    duration,
    style: {
      backgroundColor: '#22c55e', // green-500
      color: '#ffffff',
      border: '1px solid #16a34a', // green-600
    },
    className: 'success-toast',
  });
}

/**
 * Error toast with consistent red styling and white text
 */
export function showErrorToast(message: string, options: ToastOptions = {}): void {
  const { description, duration = 5000 } = options;

  toast.error(message, {
    description,
    duration,
    style: {
      backgroundColor: '#ef4444', // red-500
      color: '#ffffff',
      border: '1px solid #dc2626', // red-600
    },
    className: 'error-toast',
  });
}

/**
 * Info toast with consistent blue styling and white text
 */
export function showInfoToast(message: string, options: ToastOptions = {}): void {
  const { description, duration = 4000 } = options;

  toast.info(message, {
    description,
    duration,
    style: {
      backgroundColor: '#3b82f6', // blue-500
      color: '#ffffff',
      border: '1px solid #2563eb', // blue-600
    },
    className: 'info-toast',
  });
}

/**
 * Warning toast with consistent yellow/orange styling and dark text for readability
 */
export function showWarningToast(message: string, options: ToastOptions = {}): void {
  const { description, duration = 4000 } = options;

  toast.warning(message, {
    description,
    duration,
    style: {
      backgroundColor: '#f59e0b', // amber-500
      color: '#1f2937', // gray-800 for better readability on yellow
      border: '1px solid #d97706', // amber-600
    },
    className: 'warning-toast',
  });
}
