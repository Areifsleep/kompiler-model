/**
 * Delete Instance Validator
 *
 * Validates OAL syntax: delete object instance <var>
 *
 * Validation Rules:
 * - Rule OAL-DELETE-1: Syntax must be "delete object instance <identifier>"
 * - Rule OAL-DELETE-2: Variable name must be valid identifier
 * - Rule OAL-DELETE-3: Variable should be previously declared (warning if not found)
 *
 * Example Valid:
 *   delete object instance old_record;
 *   delete object instance temp_obj;
 *
 * Example Invalid:
 *   delete object instance 123invalid;  // Invalid var name
 */

import { getOALLineOffset } from "../../../tokenizer.js";

export class DeleteInstanceValidator {
  constructor(errorManager) {
    this.errorManager = errorManager;
  }

  /**
   * Validate delete instance statements in OAL
   * @param {string} oalCode - The OAL code to validate
   * @param {string} path - JSONPath to this OAL code
   */
  validate(oalCode, path) {
    if (!oalCode) return;

    // Regex: delete object instance <var>;
    const deletePattern = /delete\s+object\s+instance\s+(\w+)\s*;/gi;
    let match;

    const declaredVars = this.extractDeclaredVariables(oalCode);

    while ((match = deletePattern.exec(oalCode)) !== null) {
      const varName = match[1];
      const lineNumber = getOALLineOffset(oalCode, match.index);

      // Rule OAL-DELETE-2: Validate variable name
      if (!/^[a-zA-Z_]\w*$/.test(varName)) {
        this.errorManager.addError(
          `Invalid variable name "${varName}". Must start with letter or underscore.`,
          `${path} [line ~${lineNumber}]`,
          "Use valid identifier (letters, numbers, underscore)",
          "error",
          3
        );
      }

      // Rule OAL-DELETE-3: Check if variable was declared (warning only)
      if (!declaredVars.has(varName) && varName !== "self") {
        this.errorManager.addError(
          `Variable "${varName}" not found. Ensure it's declared before deletion.`,
          `${path} [line ~${lineNumber}]`,
          "Declare variable before deleting",
          "warning",
          3
        );
      }
    }
  }

  /**
   * Extract declared variables from OAL code
   * Looks for: create object instance, select any/many/one, assignments
   */
  extractDeclaredVariables(oalCode) {
    const vars = new Set();

    // From create statements
    const createPattern = /create\s+object\s+instance\s+(\w+)/gi;
    let match;
    while ((match = createPattern.exec(oalCode)) !== null) {
      vars.add(match[1]);
    }

    // From select statements
    const selectPattern = /select\s+(?:any|many|one)\s+(\w+)/gi;
    while ((match = selectPattern.exec(oalCode)) !== null) {
      vars.add(match[1]);
    }

    // From simple assignments (var = ...)
    const assignPattern = /^(\w+)\s*=/gm;
    while ((match = assignPattern.exec(oalCode)) !== null) {
      if (match[1] !== "self") {
        vars.add(match[1]);
      }
    }

    return vars;
  }
}
