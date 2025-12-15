'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';

const ProgressContext = createContext(null);

/**
 * Global Progress Context
 * Locks the entire admin panel during critical operations
 * Prevents concurrent operations that could corrupt data
 */
export function ProgressProvider({ children }) {
  const [isOperationInProgress, setIsOperationInProgress] = useState(false);
  const [operationMessage, setOperationMessage] = useState('Processing operation...');
  const [operationDetails, setOperationDetails] = useState('');

  /**
   * Start a global operation
   * @param {string} message - Main message to display
   * @param {string} details - Additional details (optional)
   */
  const startOperation = useCallback((message = 'Processing operation...', details = '') => {
    setOperationMessage(message);
    setOperationDetails(details);
    setIsOperationInProgress(true);
    console.log('🔒 Operation started:', message);
  }, []);

  /**
   * End the global operation
   */
  const endOperation = useCallback(() => {
    setIsOperationInProgress(false);
    setOperationMessage('');
    setOperationDetails('');
    console.log('🔓 Operation completed');
  }, []);

  /**
   * Update operation progress message
   */
  const updateProgress = useCallback((message, details = '') => {
    setOperationMessage(message);
    setOperationDetails(details);
  }, []);

  /**
   * Wrap an async function with progress tracking
   * Automatically starts and ends the operation
   */
  const withProgress = useCallback(async (asyncFn, message = 'Processing...', details = '') => {
    startOperation(message, details);
    try {
      const result = await asyncFn();
      return result;
    } finally {
      endOperation();
    }
  }, [startOperation, endOperation]);

  const value = {
    isOperationInProgress,
    operationMessage,
    operationDetails,
    startOperation,
    endOperation,
    updateProgress,
    withProgress
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
      
      {/* Global Operation Loading Overlay */}
      {isOperationInProgress && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.92)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          flexDirection: 'column',
          gap: '24px',
          backdropFilter: 'blur(8px)'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
            borderRadius: '50%',
            width: '120px',
            height: '120px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(0, 255, 136, 0.3)'
          }}>
            <RefreshCw 
              size={56} 
              style={{ 
                animation: 'spin 1s linear infinite', 
                color: '#000'
              }} 
            />
          </div>
          
          <div style={{ textAlign: 'center', maxWidth: '600px', padding: '0 24px' }}>
            <h2 style={{ 
              fontSize: '1.5rem', 
              color: 'var(--primary)', 
              fontWeight: '700',
              marginBottom: '12px',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              {operationMessage}
            </h2>
            
            {operationDetails && (
              <p style={{ 
                fontSize: '1rem', 
                color: 'var(--text-muted)',
                lineHeight: '1.6'
              }}>
                {operationDetails}
              </p>
            )}
            
            <p style={{ 
              fontSize: '0.875rem', 
              color: 'var(--text-muted)',
              marginTop: '24px',
              opacity: 0.7
            }}>
              ⚠️ Please wait, do not close this window or navigate away
            </p>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </ProgressContext.Provider>
  );
}

/**
 * Hook to use progress context
 */
export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}

