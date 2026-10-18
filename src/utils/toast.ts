import { useStore } from '../store';

export const toast = {
  success: (message: string, title = 'Success') =>
    useStore.getState().addNotification({ type: 'success', title, message }),
  error: (message: string, title = 'Error') =>
    useStore.getState().addNotification({ type: 'error', title, message }),
  info: (message: string, title = 'Info') =>
    useStore.getState().addNotification({ type: 'info', title, message }),
  warning: (message: string, title = 'Warning') =>
    useStore.getState().addNotification({ type: 'warning', title, message }),
};
