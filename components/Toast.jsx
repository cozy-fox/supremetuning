'use client';

import { useEffect } from 'react';
import { Check, AlertCircle, X } from 'lucide-react';

export default function Toast({ show, message, type, onClose, duration = 3000 }) {
  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '24px',
        right: '24px',
        zIndex: 10000,
        background: type === 'error' 
          ? 'rgba(255, 68, 68, 0.95)' 
          : type === 'success'
          ? 'rgba(0, 255, 136, 0.95)'
          : 'rgba(168, 176, 184, 0.95)',
        color: type === 'error' || type === 'success' ? '#1a1a1a' : '#fff',
        padding: '16px 20px',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        minWidth: '300px',
        maxWidth: '500px',
        animation: 'slideInRight 0.3s ease-out',
        fontWeight: '500'
      }}
    >
      {type === 'success' && <Check size={20} />}
      {type === 'error' && <AlertCircle size={20} />}
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: 'inherit',
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          opacity: 0.8
        }}
        onMouseEnter={(e) => e.target.style.opacity = '1'}
        onMouseLeave={(e) => e.target.style.opacity = '0.8'}
      >
        <X size={18} />
      </button>
      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

