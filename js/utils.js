/* ==========================================
   UTILITY FUNCTIONS & HELPERS
   ========================================== */

/* Toast Notification System */
function showToast(message, type = 'info') {
  // Remove existing toast if any
  const existingToast = document.getElementById('toast-notification');
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement('div');
  toast.id = 'toast-notification';
  toast.style.cssText = `
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    padding: 1rem 1.5rem;
    background-color: var(--${type === 'danger' ? 'danger' : type === 'success' ? 'primary' : 'info'});
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 10000;
    animation: slideInUp 0.3s ease-out;
    font-size: 0.95rem;
    font-weight: 500;
    max-width: 400px;
    word-wrap: break-word;
  `;

  // Add color fallback if CSS variable doesn't exist
  if (type === 'success') {
    toast.style.backgroundColor = '#10b981';
  } else if (type === 'danger') {
    toast.style.backgroundColor = '#ef4444';
  } else if (type === 'info') {
    toast.style.backgroundColor = '#3b82f6';
  }

  toast.textContent = message;
  document.body.appendChild(toast);

  // Auto-remove after 3 seconds
  setTimeout(() => {
    if (toast.parentElement) {
      toast.style.animation = 'slideOutDown 0.3s ease-out';
      setTimeout(() => toast.remove(), 300);
    }
  }, 3000);
}

/* Add animations if not already present */
if (!document.getElementById('toast-animations')) {
  const style = document.createElement('style');
  style.id = 'toast-animations';
  style.innerHTML = `
    @keyframes slideInUp {
      from {
        transform: translateY(100px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
    @keyframes slideOutDown {
      from {
        transform: translateY(0);
        opacity: 1;
      }
      to {
        transform: translateY(100px);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}

/* Local Storage Manager */
const StorageManager = {
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Storage error:', e);
      return false;
    }
  },

  get: (key, defaultValue = null) => {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : defaultValue;
    } catch (e) {
      console.error('Storage error:', e);
      return defaultValue;
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error('Storage error:', e);
      return false;
    }
  },

  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (e) {
      console.error('Storage error:', e);
      return false;
    }
  }
};

/* Date Formatter */
function formatDate(date, format = 'id-ID') {
  if (typeof date === 'string') {
    return new Date(date).toLocaleDateString(format);
  }
  return date.toLocaleDateString(format);
}

/* URL Query Parameter Helper */
function getQueryParam(key) {
  const params = new URLSearchParams(window.location.search);
  return params.get(key);
}

function getAllQueryParams() {
  return Object.fromEntries(new URLSearchParams(window.location.search));
}

/* DOM Utilities */
const DOM = {
  ready: (callback) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  },

  select: (selector) => document.querySelector(selector),
  selectAll: (selector) => document.querySelectorAll(selector),

  addClass: (el, className) => {
    if (el) el.classList.add(className);
  },

  removeClass: (el, className) => {
    if (el) el.classList.remove(className);
  },

  toggleClass: (el, className) => {
    if (el) el.classList.toggle(className);
  },

  hasClass: (el, className) => {
    return el ? el.classList.contains(className) : false;
  },

  setText: (el, text) => {
    if (el) el.textContent = text;
  },

  setHTML: (el, html) => {
    if (el) el.innerHTML = html;
  },

  on: (el, event, handler) => {
    if (el) el.addEventListener(event, handler);
  },

  off: (el, event, handler) => {
    if (el) el.removeEventListener(event, handler);
  }
};

/* Page Navigation Helper */
const Navigation = {
  go: (page) => {
    window.location.href = page;
  },

  back: () => {
    window.history.back();
  },

  forward: () => {
    window.history.forward();
  },

  reload: () => {
    window.location.reload();
  }
};

/* Data Validators */
const Validators = {
  email: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isEmpty: (value) => {
    return !value || value.toString().trim() === '';
  },

  minLength: (value, length) => {
    return value.toString().length >= length;
  },

  maxLength: (value, length) => {
    return value.toString().length <= length;
  }
};

/* Export for use in other scripts */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    showToast,
    StorageManager,
    formatDate,
    getQueryParam,
    getAllQueryParams,
    DOM,
    Navigation,
    Validators
  };
}

console.log('✓ Utils.js loaded successfully');
