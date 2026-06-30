/**
 * Toast 通知工具函数
 */

import { createRoot } from 'react-dom/client';
import Toast from '../components/Toast';

let toastRoot = null;

function getToastRoot() {
  if (!toastRoot) {
    const container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
    toastRoot = createRoot(container);
  }
  return toastRoot;
}

export function showToast(options) {
  const root = getToastRoot();
  const { message, type, duration } = options;

  root.render(
    <Toast
      message={message}
      type={type}
      duration={duration}
      onClose={() => {
        root.unmount();
        const container = document.getElementById('toast-container');
        if (container && container.children.length === 0) {
          container.remove();
          toastRoot = null;
        }
      }}
    />
  );
}

export const toast = {
  success: (message, duration) => {
    showToast({ message, type: 'success', duration });
  },
  error: (message, duration) => {
    showToast({ message, type: 'error', duration });
  },
  warning: (message, duration) => {
    showToast({ message, type: 'warning', duration });
  },
  info: (message, duration) => {
    showToast({ message, type: 'info', duration });
  }
};
