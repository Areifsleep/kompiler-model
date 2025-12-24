import { ErrorManager } from "./error-manager.js";
import { SchemaValidator } from "./validators/schema-validator.js";
import { ConsistencyValidator } from "./validators/consistency-validator.js";
import { SemanticValidator } from "./validators/semantic-validator.js";

/**
 * xtUML Parser - Main Orchestrator
 * Coordinates all validation phases
 */
export class XtUMLParser {
  constructor() {
    this.errorManager = new ErrorManager();
    this.schemaValidator = new SchemaValidator(this.errorManager);
    this.consistencyValidator = new ConsistencyValidator(this.errorManager);
    this.semanticValidator = new SemanticValidator(this.errorManager);
  }

  /**
   * Main validation function - processes in 3 phases
   * @param {Object} modelJson - User-provided JSON model
   * @param {string} rawText - Raw JSON text for line number extraction (optional)
   * @returns {Array} Array of structured error objects
   */
  parse(modelJson, rawText = null) {
    this.errorManager.clear();

    try {
      // PHASE 1: JSON Structure & Key Validation
      this.schemaValidator.validate(modelJson);

      // Only proceed if no critical structural errors
      if (this.errorManager.hasCriticalErrors(1)) {
        return this.errorManager.getErrors();
      }

      // PHASE 2: Model Consistency
      this.consistencyValidator.validate(modelJson);

      // PHASE 3: Semantic & Behavioral Checks
      this.semanticValidator.validate(modelJson);
    } catch (e) {
      this.errorManager.addError(`Critical parser exception: ${e.message}`, "$", "Ensure JSON is valid and restart validation", "error", 1);
    }

    return this.errorManager.getErrors();
  }

  /**
   * Get all errors
   */
  getErrors() {
    return this.errorManager.getErrors();
  }
}

// Export helper functions for backward compatibility
export { getLineNumber, getLineContext } from "./helpers.js";
