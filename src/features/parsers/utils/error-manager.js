/**
 * Error Manager
 * Manages validation errors with structured format
 */
export class ErrorManager {
  constructor() {
    this.errors = [];
  }

  /**
   * Add structured error to errors array
   * @param {string} message - Error message
   * @param {string} path - JSONPath to error location
   * @param {string} suggestion - How to fix the error
   * @param {string} severity - 'error' | 'warning' | 'info'
   * @param {number} phase - Validation phase (1, 2, or 3)
   */
  addError(message, path, suggestion, severity = "error", phase = 1) {
    this.errors.push({
      severity,
      phase,
      message,
      path,
      suggestion,
    });
  }

  /**
   * Get all errors
   */
  getErrors() {
    return this.errors;
  }

  /**
   * Clear all errors
   */
  clear() {
    this.errors = [];
  }

  /**
   * Check if there are critical errors in a specific phase
   */
  hasCriticalErrors(phase = null) {
    if (phase === null) {
      return this.errors.some((e) => e.severity === "error");
    }
    return this.errors.some((e) => e.severity === "error" && e.phase === phase);
  }
}
