import { toast } from '../components/ui/sonner';

const recentMessages = new Map();
const DUPLICATE_WINDOW_MS = 1800;

function canShow(type, message) {
  const key = `${type}:${String(message || '').trim()}`;
  const now = Date.now();
  const lastShownAt = recentMessages.get(key) || 0;

  if (now - lastShownAt < DUPLICATE_WINDOW_MS) {
    return false;
  }

  recentMessages.set(key, now);
  return true;
}

function show(type, message, options = {}) {
  if (!message || !canShow(type, message)) {
    return;
  }

  if (type === 'success') {
    toast.success(message, options);
    return;
  }

  if (type === 'info') {
    toast(message, options);
    return;
  }

  toast.error(message, options);
}

export const notify = {
  success(message, options) {
    show('success', message, options);
  },
  error(message, options) {
    show('error', message, options);
  },
  info(message, options) {
    show('info', message, options);
  }
};
