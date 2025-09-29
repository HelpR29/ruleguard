/**
 * Secure Form Components
 * Form components with built-in security validation and sanitization
 */

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Loader2,
  Upload,
  X
} from 'lucide-react';
import {
  sanitizeInput,
  sanitizeFormData,
  validateForm,
  ValidationRule,
  ValidationResult,
  useSecurityValidation,
  securityMiddleware,
  SECURITY_CONFIG
} from '../utils/security';

interface FormFieldProps {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'file' | 'number' | 'url';
  value: any;
  onChange: (value: any) => void;
  onBlur?: () => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  validationRules?: ValidationRule[];
  sanitizeType?: 'text' | 'html' | 'url' | 'email';
  maxLength?: number;
  options?: Array<{ value: string | number; label: string; disabled?: boolean }>;
  accept?: string;
  multiple?: boolean;
  error?: string;
}

interface SecureFormProps {
  fields: FormFieldProps[];
  onSubmit: (data: Record<string, any>) => Promise<void>;
  onValidationError?: (errors: Record<string, string>) => void;
  submitButtonText?: string;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  layout?: 'vertical' | 'horizontal' | 'grid';
  csrfToken?: string;
}

/**
 * Secure Input Component
 */
export const SecureInput = React.forwardRef<HTMLInputElement, FormFieldProps>(({
  name,
  label,
  type,
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  disabled = false,
  className = '',
  validationRules = [],
  sanitizeType = 'text',
  maxLength,
  error,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const { validateField, sanitizeValue } = useSecurityValidation();

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;

    // Sanitize input
    newValue = sanitizeValue(newValue, sanitizeType);

    // Apply max length
    if (maxLength && newValue.length > maxLength) {
      newValue = newValue.substring(0, maxLength);
    }

    onChange(newValue);
  }, [onChange, sanitizeType, sanitizeValue, maxLength]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    onBlur?.();
  }, [onBlur]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const getInputType = () => {
    if (type === 'password') {
      return showPassword ? 'text' : 'password';
    }
    return type;
  };

  const fieldError = error || (validationRules.length > 0 ? validateField(value, validationRules) : null);

  return (
    <div className={`space-y-2 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative">
        <input
          ref={ref}
          id={name}
          name={name}
          type={getInputType()}
          value={value || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          className={`w-full px-3 py-2 border rounded-lg transition-all duration-200 ${
            fieldError
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : isFocused
                ? 'border-blue-500 ring-1 ring-blue-500'
                : 'border-gray-300 focus:border-blue-500:border-blue-400 focus:ring-1 focus:ring-blue-500:ring-blue-400'
          } ${
            disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
          }`}
          {...props}
        />

        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600:text-gray-300"
            disabled={disabled}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>

      {fieldError && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-600 flex items-center gap-1"
        >
          <AlertCircle className="h-4 w-4" />
          {fieldError}
        </motion.p>
      )}
    </div>
  );
});

SecureInput.displayName = 'SecureInput';

/**
 * Secure Textarea Component
 */
export const SecureTextarea = React.forwardRef<HTMLTextAreaElement, FormFieldProps>(({
  name,
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  disabled = false,
  className = '',
  validationRules = [],
  sanitizeType = 'text',
  maxLength,
  error,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const { validateField, sanitizeValue } = useSecurityValidation();

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let newValue = e.target.value;

    // Sanitize input
    newValue = sanitizeValue(newValue, sanitizeType);

    // Apply max length
    if (maxLength && newValue.length > maxLength) {
      newValue = newValue.substring(0, maxLength);
    }

    onChange(newValue);
  }, [onChange, sanitizeType, sanitizeValue, maxLength]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    onBlur?.();
  }, [onBlur]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const fieldError = error || (validationRules.length > 0 ? validateField(value, validationRules) : null);

  return (
    <div className={`space-y-2 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <textarea
        ref={ref}
        id={name}
        name={name}
        value={value || ''}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        className={`w-full px-3 py-2 border rounded-lg transition-all duration-200 resize-vertical ${
          fieldError
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
            : isFocused
              ? 'border-blue-500 ring-1 ring-blue-500'
              : 'border-gray-300 focus:border-blue-500:border-blue-400 focus:ring-1 focus:ring-blue-500:ring-blue-400'
        } ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
        }`}
        rows={4}
        {...props}
      />

      <div className="flex justify-between items-center">
        {fieldError && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-600 flex items-center gap-1"
          >
            <AlertCircle className="h-4 w-4" />
            {fieldError}
          </motion.p>
        )}

        {maxLength && (
          <span className="text-xs text-gray-500">
            {value?.length || 0}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
});

SecureTextarea.displayName = 'SecureTextarea';

/**
 * Secure Select Component
 */
export const SecureSelect = React.forwardRef<HTMLSelectElement, FormFieldProps>(({
  name,
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  disabled = false,
  className = '',
  validationRules = [],
  options = [],
  error,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const { validateField } = useSecurityValidation();

  const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    onBlur?.();
  }, [onBlur]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const fieldError = error || (validationRules.length > 0 ? validateField(value, validationRules) : null);

  return (
    <div className={`space-y-2 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <select
        ref={ref}
        id={name}
        name={name}
        value={value || ''}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-lg transition-all duration-200 ${
          fieldError
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
            : isFocused
              ? 'border-blue-500 ring-1 ring-blue-500'
              : 'border-gray-300 focus:border-blue-500:border-blue-400 focus:ring-1 focus:ring-blue-500:ring-blue-400'
        } ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
        }`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>

      {fieldError && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-600 flex items-center gap-1"
        >
          <AlertCircle className="h-4 w-4" />
          {fieldError}
        </motion.p>
      )}
    </div>
  );
});

SecureSelect.displayName = 'SecureSelect';

/**
 * Secure File Upload Component
 */
export const SecureFileUpload = React.forwardRef<HTMLInputElement, FormFieldProps>(({
  name,
  label,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  className = '',
  accept,
  multiple = false,
  error,
  ...props
}, ref) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const fileArray = Array.from(selectedFiles);

    // Validate file types and sizes
    const validFiles = fileArray.filter(file => {
      if (!accept) return true;

      const acceptedTypes = accept.split(',').map(type => type.trim());
      return acceptedTypes.some(acceptedType => {
        if (acceptedType.startsWith('.')) {
          return file.name.toLowerCase().endsWith(acceptedType.toLowerCase());
        }
        return file.type.match(new RegExp(acceptedType.replace('*', '.*')));
      }) && file.size <= SECURITY_CONFIG.MAX_FILE_SIZE;
    });

    setFiles(validFiles);
    onChange(multiple ? validFiles : validFiles[0]);
  }, [accept, multiple, onChange]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileChange(e.dataTransfer.files);
  }, [handleFileChange]);

  const removeFile = useCallback((index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onChange(multiple ? newFiles : newFiles[0] || null);
  }, [files, multiple, onChange]);

  return (
    <div className={`space-y-2 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
          isDragOver
            ? 'border-blue-400 bg-blue-50/20'
            : 'border-gray-300 hover:border-gray-400:border-gray-500'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600">
          {placeholder || 'Drop files here or click to browse'}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Max file size: {Math.round(SECURITY_CONFIG.MAX_FILE_SIZE / 1024 / 1024)}MB
        </p>

        <input
          ref={ref}
          id={name}
          name={name}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={(e) => handleFileChange(e.target.files)}
          className="hidden"
          {...props}
        />
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                  <span className="text-xs font-medium text-blue-600">
                    {file.name.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 truncate max-w-48">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="p-1 text-gray-400 hover:text-red-600:text-red-400"
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-600 flex items-center gap-1"
        >
          <AlertCircle className="h-4 w-4" />
          {error}
        </motion.p>
      )}
    </div>
  );
});

SecureFileUpload.displayName = 'SecureFileUpload';

/**
 * Main Secure Form Component
 */
export const SecureForm = ({
  fields,
  onSubmit,
  onValidationError,
  submitButtonText = 'Submit',
  loading = false,
  disabled = false,
  className = '',
  layout = 'vertical',
  csrfToken
}: SecureFormProps) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const { validateForm: validateFormData } = useSecurityValidation();

  // Initialize form data
  React.useEffect(() => {
    const initialData: Record<string, any> = {};
    fields.forEach(field => {
      initialData[field.name] = field.value || '';
    });
    setFormData(initialData);
  }, [fields]);

  const handleFieldChange = useCallback((fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));

    // Clear field error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
  }, [errors]);

  const handleFieldBlur = useCallback((fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
  }, []);

  const validateAllFields = useCallback(() => {
    const fieldRules: Record<string, ValidationRule[]> = {};
    fields.forEach(field => {
      if (field.validationRules) {
        fieldRules[field.name] = field.validationRules;
      }
    });

    const validationResult = validateFormData(formData, fieldRules);

    setErrors(validationResult.errors);

    if (!validationResult.isValid && onValidationError) {
      onValidationError(validationResult.errors);
    }

    return validationResult.isValid;
  }, [formData, fields, validateFormData, onValidationError]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (disabled || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Validate all fields
      const isValid = validateAllFields();

      if (!isValid) {
        setIsSubmitting(false);
        return;
      }

      // Sanitize form data
      const sanitizedData = sanitizeFormData(formData);

      // Submit with CSRF token if provided
      const submitData = csrfToken ? { ...sanitizedData, csrfToken } : sanitizedData;

      await onSubmit(submitData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, disabled, isSubmitting, validateAllFields, onSubmit, csrfToken]);

  const getLayoutClasses = () => {
    switch (layout) {
      case 'horizontal':
        return 'grid grid-cols-2 gap-4';
      case 'grid':
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';
      default:
        return 'space-y-4';
    }
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className={`space-y-6 ${className}`}
      noValidate
    >
      <div className={getLayoutClasses()}>
        {fields.map((field) => {
          const fieldError = errors[field.name];
          const isTouched = touched[field.name];

          const fieldProps = {
            ...field,
            value: formData[field.name],
            onChange: (value: any) => handleFieldChange(field.name, value),
            onBlur: () => handleFieldBlur(field.name),
            error: isTouched ? fieldError : undefined,
            disabled: disabled || field.disabled
          };

          switch (field.type) {
            case 'textarea':
              return <SecureTextarea key={field.name} {...fieldProps} />;
            case 'select':
              return <SecureSelect key={field.name} {...fieldProps} />;
            case 'file':
              return <SecureFileUpload key={field.name} {...fieldProps} />;
            default:
              return <SecureInput key={field.name} {...fieldProps} />;
          }
        })}
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => formRef.current?.reset()}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50:bg-gray-700 transition-colors"
          disabled={disabled || isSubmitting}
        >
          Reset
        </button>

        <button
          type="submit"
          disabled={disabled || isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitButtonText}
        </button>
      </div>
    </form>
  );
};
