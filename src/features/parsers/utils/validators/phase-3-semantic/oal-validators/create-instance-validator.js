/**
 * Create Instance Validator
 *
 * Validates OAL syntax: create object instance <var> of <KL>
 *
 * Validation Rules:
 * - Rule OAL-CREATE-1: Syntax must be "create object instance <identifier> of <KL>"
 * - Rule OAL-CREATE-2: Key letter (KL) must exist in model classes
 * - Rule OAL-CREATE-3: Variable name must be valid identifier
 *
 * Example Valid:
 *   create object instance log_cuti of LogCuti;
 *   create object instance wisuda of Wisuda;
 *
 * Example Invalid:
 *   create object instance 123log of LogCuti;  // Invalid var name
 *   create object instance log of INVALID;     // Invalid KL
 */

import { getOALLineOffset } from "../../../tokenizer.js";

export class CreateInstanceValidator {
  /**
   * @param {Object} errorManager - Error manager instance
   * @param {Map} classesMap - Map of class key_letter -> class object
   */
  constructor(errorManager, classesMap) {
    this.errorManager = errorManager;
    this.classesMap = classesMap;
  }

  /**
   * Validate create instance statements in OAL
   * @param {string} oalCode - The OAL code to validate
   * @param {string} path - JSONPath to this OAL code
   */
  validate(oalCode, path) {
    if (!oalCode) return;

    // Regex: create object instance <var> of <KL>;
    const createPattern =
      /create\s+object\s+instance\s+(\w+)\s+of\s+(\w+)\s*;/gi;
    let match;

    while ((match = createPattern.exec(oalCode)) !== null) {
      const varName = match[1];
      const className = match[2];
      const lineNumber = getOALLineOffset(oalCode, match.index);

      // Rule OAL-CREATE-3: Validate variable name (must start with letter or underscore)
      if (!/^[a-zA-Z_]\w*$/.test(varName)) {
        this.errorManager.addError(
          `Invalid variable name "${varName}". Must start with letter or underscore.`,
          `${path} [line ~${lineNumber}]`,
          "Use valid identifier (letters, numbers, underscore)",
          "error",
          3
        );
      }

      // Rule OAL-CREATE-2: Validate class exists
      const classExists = Array.from(this.classesMap.values()).some(
        (cls) => cls.name === className || cls.key_letter === className
      );

      if (!classExists) {
        const availableClasses = Array.from(this.classesMap.values())
          .map((cls) => cls.name)
          .join(", ");

        this.errorManager.addError(
          `Class "${className}" not found in model. Cannot create instance.`,
          `${path} [line ~${lineNumber}]`,
          `Available classes: ${availableClasses}`,
          "error",
          3
        );
      }
    }
  }
}
