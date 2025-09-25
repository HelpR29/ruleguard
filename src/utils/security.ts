/**
 * Security & Validation System
 * Comprehensive security measures including input sanitization, XSS protection, and CSRF protection
 */

import React, { useCallback, useRef } from 'react';
import DOMPurify from 'isomorphic-dompurify';

// =============================================================================
// INPUT SANITIZATION UTILITIES
// =============================================================================

/**
 * Sanitize user input to prevent XSS attacks
 */
export const sanitizeInput = {
  /**
   * Sanitize HTML content
   */
  html: (input: string): string => {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3'],
      ALLOWED_ATTR: ['href', 'target', 'rel']
    });
  },

  /**
   * Sanitize plain text
   */
  text: (input: string): string => {
    return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
  },

  /**
   * Sanitize URL
   */
  url: (input: string): string => {
    try {
      const url = new URL(input);
      // Only allow http/https protocols
      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error('Invalid URL protocol');
      }
      return url.toString();
    } catch {
      return '';
    }
  },

  /**
   * Sanitize email
   */
  email: (input: string): string => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(input) ? input.toLowerCase().trim() : '';
  },

  /**
   * Sanitize filename
   */
  filename: (input: string): string => {
    return input
      .replace(/[^a-zA-Z0-9.-_]/g, '_') // Replace invalid characters with underscore
      .substring(0, 255); // Limit length
  },

  /**
   * Sanitize JSON
   */
  json: (input: string): string => {
    try {
      JSON.parse(input);
      return input;
    } catch {
      return '{}';
    }
  }
};

/**
 * Escape special characters for safe HTML rendering
 */
export const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Validate and sanitize form data
 */
export const sanitizeFormData = (data: Record<string, any>): Record<string, any> => {
  const sanitized: Record<string, any> = {};

  Object.entries(data).forEach(([key, value]) => {
    if (typeof value === 'string') {
      // Remove null bytes and control characters
      sanitized[key] = value.replace(/[\x00-\x1F\x7F]/g, '');
    } else if (typeof value === 'number') {
      // Validate numbers are finite and not NaN
      sanitized[key] = isFinite(value) ? value : 0;
    } else if (typeof value === 'boolean') {
      sanitized[key] = value;
    } else if (value === null || value === undefined) {
      sanitized[key] = '';
    } else {
      // For objects and arrays, recursively sanitize if they're simple structures
      sanitized[key] = value;
    }
  });

  return sanitized;
};

// =============================================================================
// CSRF PROTECTION
// =============================================================================

/**
 * CSRF Token Manager
 */
class CSRFTokenManager {
  private token: string | null = null;
  private readonly TOKEN_KEY = 'csrf_token';
  private readonly TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour

  /**
   * Generate a new CSRF token
   */
  generateToken(): string {
    this.token = this.generateRandomToken();
    this.saveToken();
    return this.token;
  }

  /**
   * Get the current CSRF token
   */
  getToken(): string {
    if (!this.token) {
      this.loadToken();
    }

    if (!this.token || this.isTokenExpired()) {
      this.token = this.generateToken();
    }

    return this.token;
  }

  /**
   * Validate a CSRF token
   */
  validateToken(token: string): boolean {
    const currentToken = this.getToken();
    return token === currentToken && !this.isTokenExpired();
  }

  /**
   * Refresh the CSRF token
   */
  refreshToken(): string {
    return this.generateToken();
  }

  private generateRandomToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  private saveToken(): void {
    if (this.token) {
      const tokenData = {
        value: this.token,
        expiry: Date.now() + this.TOKEN_EXPIRY
      };
      localStorage.setItem(this.TOKEN_KEY, JSON.stringify(tokenData));
    }
  }

  private loadToken(): void {
    try {
      const tokenData = localStorage.getItem(this.TOKEN_KEY);
      if (tokenData) {
        const parsed = JSON.parse(tokenData);
        if (parsed.value && parsed.expiry && parsed.expiry > Date.now()) {
          this.token = parsed.value;
        }
      }
    } catch {
      // Token corrupted, generate new one
      this.token = null;
    }
  }

  private isTokenExpired(): boolean {
    try {
      const tokenData = localStorage.getItem(this.TOKEN_KEY);
      if (tokenData) {
        const parsed = JSON.parse(tokenData);
        return !parsed.expiry || parsed.expiry <= Date.now();
      }
      return true;
    } catch {
      return true;
    }
  }
}

export const csrfTokenManager = new CSRFTokenManager();

/**
 * CSRF Protection Hook
 */
export const useCSRFProtection = () => {
  const getCSRFToken = useCallback(() => {
    return csrfTokenManager.getToken();
  }, []);

  const validateCSRFToken = useCallback((token: string) => {
    return csrfTokenManager.validateToken(token);
  }, []);

  const refreshCSRFToken = useCallback(() => {
    return csrfTokenManager.refreshToken();
  }, []);

  return {
    getCSRFToken,
    validateCSRFToken,
    refreshCSRFToken
  };
};

// =============================================================================
// FORM VALIDATION
// =============================================================================

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'email' | 'url' | 'number' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message: string;
  validator?: (value: any, data?: Record<string, any>) => boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
}

/**
 * Comprehensive form validation
 */
export const validateForm = (
  data: Record<string, any>,
  rules: Record<string, ValidationRule[]>
): ValidationResult => {
  const errors: Record<string, string> = {};
  const warnings: Record<string, string> = {};

  Object.entries(rules).forEach(([fieldName, fieldRules]) => {
    const value = data[fieldName];

    fieldRules.forEach(rule => {
      let isValid = true;

      switch (rule.type) {
        case 'required':
          isValid = value !== null && value !== undefined && value !== '';
          break;

        case 'minLength':
          isValid = typeof value === 'string' && value.length >= (rule.value || 0);
          break;

        case 'maxLength':
          isValid = typeof value === 'string' && value.length <= (rule.value || 0);
          break;

        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          isValid = typeof value === 'string' && emailRegex.test(value);
          break;

        case 'url':
          try {
            new URL(value);
            isValid = true;
          } catch {
            isValid = false;
          }
          break;

        case 'number':
          isValid = typeof value === 'number' && !isNaN(value);
          break;

        case 'min':
          isValid = typeof value === 'number' && value >= (rule.value || 0);
          break;

        case 'max':
          isValid = typeof value === 'number' && value <= (rule.value || 0);
          break;

        case 'pattern':
          isValid = typeof value === 'string' && new RegExp(rule.value).test(value);
          break;

        case 'custom':
          isValid = rule.validator ? rule.validator(value, data) : true;
          break;
      }

      if (!isValid) {
        errors[fieldName] = rule.message;
      }
    });
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings
  };
};

// =============================================================================
// SECURITY HEADERS & CSP
// =============================================================================

/**
 * Content Security Policy utilities
 */
export const securityHeaders = {
  /**
   * Generate CSP header for HTML responses
   */
  generateCSPHeader: (nonce?: string): string => {
    const directives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://trusted.cdn.com",
      `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
      "img-src 'self' data: https: blob:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://api.example.com wss: ws:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests"
    ];

    if (nonce) {
      directives[1] = directives[1].replace("'unsafe-inline'", `'nonce-${nonce}'`);
    }

    return directives.join('; ');
  },

  /**
   * Generate security headers for responses
   */
  generateSecurityHeaders: (nonce?: string) => ({
    'Content-Security-Policy': securityHeaders.generateCSPHeader(nonce),
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
  })
};

// =============================================================================
// RATE LIMITING
// =============================================================================

/**
 * Rate Limiter class
 */
export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }>;
  private readonly maxAttempts: number;
  private readonly windowMs: number;

  constructor(maxAttempts = 5, windowMs = 15 * 60 * 1000) { // 5 attempts per 15 minutes
    this.attempts = new Map();
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  /**
   * Check if a request should be allowed
   */
  isAllowed(identifier: string): { allowed: boolean; remainingAttempts: number; resetTime: number } {
    const now = Date.now();
    const attemptData = this.attempts.get(identifier);

    if (!attemptData || now > attemptData.resetTime) {
      // First attempt or window expired
      const newData = {
        count: 1,
        resetTime: now + this.windowMs
      };
      this.attempts.set(identifier, newData);

      return {
        allowed: true,
        remainingAttempts: this.maxAttempts - 1,
        resetTime: newData.resetTime
      };
    }

    if (attemptData.count >= this.maxAttempts) {
      return {
        allowed: false,
        remainingAttempts: 0,
        resetTime: attemptData.resetTime
      };
    }

    attemptData.count++;
    this.attempts.set(identifier, attemptData);

    return {
      allowed: true,
      remainingAttempts: this.maxAttempts - attemptData.count,
      resetTime: attemptData.resetTime
    };
  }

  /**
   * Reset attempts for an identifier
   */
  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }

  /**
   * Get remaining attempts for an identifier
   */
  getRemainingAttempts(identifier: string): number {
    const attemptData = this.attempts.get(identifier);
    if (!attemptData) return this.maxAttempts;

    const now = Date.now();
    if (now > attemptData.resetTime) {
      return this.maxAttempts;
    }

    return Math.max(0, this.maxAttempts - attemptData.count);
  }
}

// Global rate limiter instance
export const globalRateLimiter = new RateLimiter();

// =============================================================================
// SECURITY MIDDLEWARE
// =============================================================================

/**
 * Security middleware for API requests
 */
export const securityMiddleware = {
  /**
   * Validate API request
   */
  validateRequest: (request: Request, csrfToken?: string) => {
    const errors: string[] = [];

    // Check Content-Type
    const contentType = request.headers.get('content-type');
    if (request.method === 'POST' && contentType && !contentType.includes('application/json')) {
      errors.push('Invalid content type. Expected application/json');
    }

    // Check CSRF token for state-changing requests
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method) && csrfToken) {
      const token = request.headers.get('x-csrf-token');
      if (!token || !csrfTokenManager.validateToken(token)) {
        errors.push('Invalid CSRF token');
      }
    }

    // Check User-Agent
    const userAgent = request.headers.get('user-agent');
    if (!userAgent || userAgent.length < 10) {
      errors.push('Invalid User-Agent header');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Sanitize request data
   */
  sanitizeRequestData: (data: any): any => {
    if (typeof data === 'string') {
      return sanitizeInput.text(data);
    }

    if (Array.isArray(data)) {
      return data.map(item => securityMiddleware.sanitizeRequestData(item));
    }

    if (data && typeof data === 'object') {
      const sanitized: Record<string, any> = {};
      Object.entries(data).forEach(([key, value]) => {
        if (key.toLowerCase().includes('password') || key.toLowerCase().includes('token')) {
          // Don't log sensitive data
          sanitized[key] = '[REDACTED]';
        } else {
          sanitized[key] = securityMiddleware.sanitizeRequestData(value);
        }
      });
      return sanitized;
    }

    return data;
  }
};

// =============================================================================
// XSS PROTECTION COMPONENTS
// =============================================================================

/**
 * Safe HTML renderer component
 */
export const SafeHtml = ({
  html,
  className = '',
  tagName = 'div'
}: {
  html: string;
  className?: string;
  tagName?: keyof JSX.IntrinsicElements;
}) => {
  const sanitizedHtml = sanitizeInput.html(html);
  const Tag = tagName as any;

  return (
    <Tag
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
};

/**
 * Safe text renderer component
 */
export const SafeText = ({
  text,
  className = '',
  maxLength
}: {
  text: string;
  className?: string;
  maxLength?: number;
}) => {
  const sanitizedText = sanitizeInput.text(text);
  const displayText = maxLength ? sanitizedText.substring(0, maxLength) : sanitizedText;

  return (
    <span className={className}>
      {displayText}
      {maxLength && sanitizedText.length > maxLength && '...'}
    </span>
  );
};

// =============================================================================
// SECURITY HOOKS
// =============================================================================

/**
 * Security validation hook for forms
 */
export const useSecurityValidation = () => {
  const validateField = useCallback((value: any, rules: ValidationRule[]): string | null => {
    for (const rule of rules) {
      let isValid = true;

      switch (rule.type) {
        case 'required':
          isValid = value !== null && value !== undefined && value !== '';
          break;
        case 'minLength':
          isValid = typeof value === 'string' && value.length >= (rule.value || 0);
          break;
        case 'maxLength':
          isValid = typeof value === 'string' && value.length <= (rule.value || 0);
          break;
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          isValid = typeof value === 'string' && emailRegex.test(value);
          break;
        case 'url':
          try {
            new URL(value);
            isValid = true;
          } catch {
            isValid = false;
          }
          break;
        case 'pattern':
          isValid = typeof value === 'string' && new RegExp(rule.value).test(value);
          break;
        case 'custom':
          isValid = rule.validator ? rule.validator(value) : true;
          break;
      }

      if (!isValid) {
        return rule.message;
      }
    }

    return null;
  }, []);

  const sanitizeValue = useCallback((value: any, type: 'text' | 'html' | 'url' | 'email'): any => {
    if (typeof value !== 'string') return value;

    switch (type) {
      case 'html':
        return sanitizeInput.html(value);
      case 'url':
        return sanitizeInput.url(value);
      case 'email':
        return sanitizeInput.email(value);
      default:
        return sanitizeInput.text(value);
    }
  }, []);

  return {
    validateField,
    sanitizeValue,
    validateForm: (data: Record<string, any>, rules: Record<string, ValidationRule[]>) => validateForm(data, rules)
  };
};

// =============================================================================
// SECURITY CONSTANTS
// =============================================================================

export const SECURITY_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILENAME_LENGTH: 255,
  ALLOWED_FILE_TYPES: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'text/plain',
    'text/csv',
    'application/json'
  ],
  RATE_LIMITS: {
    LOGIN: { maxAttempts: 5, windowMs: 15 * 60 * 1000 },
    API: { maxAttempts: 100, windowMs: 60 * 1000 },
    UPLOAD: { maxAttempts: 10, windowMs: 60 * 1000 }
  },
  CSP_NONCE_LENGTH: 32,
  SESSION_TIMEOUT: 30 * 60 * 1000 // 30 minutes
} as const;
