/**
 * Client-Side Input Validation Module
 * Provides validation and sanitization utilities for form inputs
 */

const Validators = {
    /**
     * Validate email format
     * @param {string} email
     * @returns {{valid: boolean, message: string}}
     */
    validateEmail(email) {
        if (!email || !email.trim()) {
            return { valid: false, message: 'Email is required' };
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return { valid: false, message: 'Please enter a valid email address' };
        }
        return { valid: true, message: '' };
    },

    /**
     * Validate password strength
     * @param {string} password
     * @returns {{valid: boolean, message: string}}
     */
    validatePassword(password) {
        if (!password) {
            return { valid: false, message: 'Password is required' };
        }
        if (password.length < 6) {
            return { valid: false, message: 'Password must be at least 6 characters' };
        }
        if (password.length > 128) {
            return { valid: false, message: 'Password must be less than 128 characters' };
        }
        return { valid: true, message: '' };
    },

    /**
     * Validate required field
     * @param {string} value
     * @param {string} fieldName
     * @returns {{valid: boolean, message: string}}
     */
    validateRequired(value, fieldName) {
        if (!value || !String(value).trim()) {
            return { valid: false, message: `${fieldName} is required` };
        }
        return { valid: true, message: '' };
    },

    /**
     * Validate FIR number format
     * @param {string} fir
     * @returns {{valid: boolean, message: string}}
     */
    validateFIRNumber(fir) {
        if (!fir || !fir.trim()) {
            return { valid: false, message: 'FIR number is required' };
        }
        // FIR numbers are typically alphanumeric with slashes or hyphens
        const firRegex = /^[A-Za-z0-9\-\/]+$/;
        if (!firRegex.test(fir.trim())) {
            return { valid: false, message: 'FIR number can only contain letters, numbers, hyphens, and slashes' };
        }
        return { valid: true, message: '' };
    },

    /**
     * Sanitize input - trim and remove potentially dangerous characters
     * @param {string} value
     * @returns {string}
     */
    sanitizeInput(value) {
        if (!value) return '';
        return String(value)
            .trim()
            .replace(/[<>]/g, '') // Remove angle brackets to prevent basic XSS
            .replace(/javascript:/gi, '') // Remove javascript: protocol
            .replace(/on\w+\s*=/gi, ''); // Remove event handlers
    },

    /**
     * Show inline validation error for a form field
     * @param {HTMLElement} input - The input element
     * @param {string} message - Error message to display
     */
    showFieldError(input, message) {
        // Remove existing error
        this.clearFieldError(input);
        
        if (!message) return;
        
        input.classList.add('border-red-500');
        const errorEl = document.createElement('p');
        errorEl.className = 'validation-error text-red-500 text-xs mt-1';
        errorEl.textContent = message;
        input.parentNode.appendChild(errorEl);
    },

    /**
     * Clear validation error for a form field
     * @param {HTMLElement} input - The input element
     */
    clearFieldError(input) {
        input.classList.remove('border-red-500');
        const existing = input.parentNode.querySelector('.validation-error');
        if (existing) existing.remove();
    },

    /**
     * Validate an entire form
     * @param {Object} rules - { fieldId: validationFunction }
     * @returns {boolean} - true if all valid
     */
    validateForm(rules) {
        let allValid = true;
        for (const [fieldId, validateFn] of Object.entries(rules)) {
            const input = document.getElementById(fieldId);
            if (!input) continue;
            const result = validateFn(input.value);
            if (!result.valid) {
                this.showFieldError(input, result.message);
                allValid = false;
            } else {
                this.clearFieldError(input);
            }
        }
        return allValid;
    }
};
