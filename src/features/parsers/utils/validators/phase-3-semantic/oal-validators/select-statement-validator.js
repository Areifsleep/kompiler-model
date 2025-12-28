/**
 * Select Statement Validator
 *
 * Validates OAL syntax: select any/many <var> related by ... where ...
 *
 * Validation Rules:
 * - Rule OAL-SELECT-1: Syntax must be "select any/many/one <var> related by <navigation>"
 * - Rule OAL-SELECT-2: Variable name must be valid identifier
 * - Rule OAL-SELECT-3: WHERE clause must have valid boolean expression
 * - Rule OAL-SELECT-4: Navigation path must reference valid relationships
 *
 * Example Valid:
 *   select one person related by self->PRS[R1];
 *   select many krs_list related by self->KRS[R2];
 *   select many krs_completed related by self->KRS[R2] where selected.Status == "Lulus";
 *
 * Example Invalid:
 *   select any 123invalid related by self->PRS[R1];  // Invalid var name
 *   select many list related by self->INVALID[R99];  // Invalid relationship
 */

import { getOALLineOffset } from "../../../tokenizer.js";

export class SelectStatementValidator {
  /**
   * @param {Object} errorManager - Error manager instance
   * @param {Map} classesMap - Map of class key_letter -> class object
   * @param {Map} relationshipsMap - Map of relationship label -> relationship object
   */
  constructor(errorManager, classesMap, relationshipsMap) {
    this.errorManager = errorManager;
    this.classesMap = classesMap;
    this.relationshipsMap = relationshipsMap;
  }

  /**
   * Validate select statements in OAL
   * @param {string} oalCode - The OAL code to validate
   * @param {string} path - JSONPath to this OAL code
   */
  validate(oalCode, path) {
    if (!oalCode) return;

    // Regex: select any/many/one <var> related by <navigation> [where <condition>];
    const selectPattern =
      /select\s+(any|many|one)\s+(\w+)\s+related\s+by\s+([\w\->\[\]]+)(?:\s+where\s+(.+?))?;/gi;
    let match;

    while ((match = selectPattern.exec(oalCode)) !== null) {
      const selectType = match[1]; // any, many, one
      const varName = match[2]; // variable name
      const navigation = match[3]; // navigation path (e.g., self->KRS[R2])
      const whereClause = match[4]; // optional WHERE condition
      const lineNumber = getOALLineOffset(oalCode, match.index);

      // Rule OAL-SELECT-2: Validate variable name
      if (!/^[a-zA-Z_]\w*$/.test(varName)) {
        this.errorManager.addError(
          `Invalid variable name "${varName}". Must start with letter or underscore.`,
          `${path} [line ~${lineNumber}]`,
          "Use valid identifier (letters, numbers, underscore)",
          "error",
          3
        );
      }

      // Rule OAL-SELECT-4: Validate navigation path
      this.validateNavigationPath(navigation, lineNumber, path);

      // Rule OAL-SELECT-3: Validate WHERE clause if present
      if (whereClause) {
        this.validateWhereClause(whereClause, varName, lineNumber, path);
      }
    }
  }

  /**
   * Validate navigation path (e.g., self->KRS[R2])
   */
  validateNavigationPath(navigation, lineNumber, path) {
    // Extract relationship references [R1], [R2], etc.
    const relPattern = /\[([R]\d+)\]/g;
    let relMatch;

    while ((relMatch = relPattern.exec(navigation)) !== null) {
      const relLabel = relMatch[1];

      if (!this.relationshipsMap.has(relLabel)) {
        this.errorManager.addError(
          `Relationship "${relLabel}" not found in model.`,
          `${path} [line ~${lineNumber}]`,
          `Check model relationships`,
          "error",
          3
        );
      }
    }
  }

  /**
   * Validate WHERE clause boolean expression
   */
  validateWhereClause(whereClause, varName, lineNumber, path) {
    // Check for 'selected' keyword (required in WHERE clause)
    if (!whereClause.includes("selected.")) {
      this.errorManager.addError(
        `WHERE clause should reference 'selected' keyword.`,
        `${path} [line ~${lineNumber}]`,
        `Example: "selected.Status == \\"Active\\""`,
        "warning",
        3
      );
    }

    // Check for comparison operators
    const hasComparison = /==|!=|<|>|<=|>=/.test(whereClause);
    if (!hasComparison) {
      this.errorManager.addError(
        `WHERE clause must contain comparison operator (==, !=, <, >, <=, >=)`,
        `${path} [line ~${lineNumber}]`,
        `Add comparison to WHERE clause`,
        "error",
        3
      );
    }
  }
}
