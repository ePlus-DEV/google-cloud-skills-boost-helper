/**
 * Form validation utilities
 */
import { DOMUtils } from "./domUtils";

export interface ValidationRule {
  id: string;
  required?: boolean;
  minLength?: number;
  pattern?: RegExp;
  message?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Array<{ id: string; message: string }>;
}

export const FormUtils = {
  /**
   * Validate form fields
   */
  validateForm(rules: ValidationRule[]): ValidationResult {
    const errors: Array<{ id: string; message: string }> = [];

    for (const rule of rules) {
      const value = DOMUtils.getInputValue(rule.id);

      if (rule.required && !value) {
        errors.push({
          id: rule.id,
          message: rule.message || `Field ${rule.id} is required`,
        });
        continue;
      }

      if (rule.minLength && value.length < rule.minLength) {
        errors.push({
          id: rule.id,
          message:
            rule.message ||
            `Field ${rule.id} must be at least ${rule.minLength} characters`,
        });
        continue;
      }

      if (rule.pattern && value && !rule.pattern.test(value)) {
        errors.push({
          id: rule.id,
          message: rule.message || `Field ${rule.id} format is invalid`,
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  /**
   * Show form errors
   */
  showFormErrors(errors: Array<{ id: string; message: string }>): void {
    // Clear previous errors
    this.clearFormErrors();

    for (const error of errors) {
      const element = DOMUtils.getElementById(error.id);
      if (element) {
        element.classList.add("border-red-500");

        // Create error message element
        const errorElement = document.createElement("div");
        errorElement.className = "text-red-500 text-sm mt-1";
        errorElement.textContent = error.message;
        errorElement.id = `${error.id}-error`;

        element.parentNode?.insertBefore(errorElement, element.nextSibling);
      }
    }
  },

  /**
   * Clear form errors
   */
  clearFormErrors(): void {
    // Remove error styling from all inputs
    for (const element of document.querySelectorAll(".border-red-500")) {
      element.classList.remove("border-red-500");
    }

    // Remove error messages
    for (const element of document.querySelectorAll('[id$="-error"]')) {
      element.remove();
    }
  },

  /**
   * Validate URL format
   */
  isValidUrl(url: string): boolean {
    try {
      const _ = new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Validate profile URL specifically for Google Cloud Skills Boost
   */
  isValidProfileUrl(url: string): boolean {
    if (!this.isValidUrl(url)) return false;

    const validPatterns = [
      /^https:\/\/www\.cloudskillsboost\.google\/public_profiles\/.+/,
      /^https:\/\/www\.qwiklabs\.com\/public_profiles\/.+/,
    ];

    return validPatterns.some((pattern) => pattern.test(url));
  },
};
