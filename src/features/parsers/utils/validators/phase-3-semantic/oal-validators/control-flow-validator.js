/**
 * Control Flow Validator
 *
 * Validates OAL control structures: if/elif/else/end if
 *
 * Validation Rules:
 * - Rule OAL-CTRL-1: Every 'if' must have matching 'end if'
 * - Rule OAL-CTRL-2: 'elif' and 'else' can only appear after 'if'
 * - Rule OAL-CTRL-3: Only one 'else' per if block
 * - Rule OAL-CTRL-4: Condition expressions must be valid boolean
 * - Rule OAL-CTRL-5: Proper nesting of if blocks
 *
 * Example Valid:
 *   if (count > 0)
 *     result = "positive";
 *   elif (count == 0)
 *     result = "zero";
 *   else
 *     result = "negative";
 *   end if;
 *
 * Example Invalid:
 *   if (count > 0)
 *     result = "positive";
 *   // Missing 'end if'
 */

import { getOALLineOffset } from "../../../tokenizer.js";

export class ControlFlowValidator {
  constructor(errorManager) {
    this.errorManager = errorManager;
  }

  /**
   * Validate control flow structures in OAL
   * @param {string} oalCode - The OAL code to validate
   * @param {string} path - JSONPath to this OAL code
   */
  validate(oalCode, path) {
    if (!oalCode) return;

    // Validate if/elif/else/end if structure
    this.validateIfBlocks(oalCode, path);
  }

  /**
   * Validate if/elif/else/end if structure
   */
  validateIfBlocks(oalCode, path) {
    const lines = oalCode.split("\n");
    const stack = []; // Stack to track nested if blocks
    let lineNumber = 0;

    for (const line of lines) {
      lineNumber++;
      const trimmed = line.trim();

      // Match 'if' statement
      if (/^if\s*\(/.test(trimmed)) {
        const condition = this.extractCondition(trimmed);
        stack.push({ type: "if", line: lineNumber, hasElse: false });

        // Rule OAL-CTRL-4: Validate condition
        if (!condition || condition.trim() === "") {
          this.errorManager.addError(
            `Empty condition in 'if' statement at line ${lineNumber}`,
            `${path} [line ~${lineNumber}]`,
            "Add condition inside if(...)",
            "error",
            3
          );
        }
      }
      // Match 'elif' statement
      else if (/^elif\s*\(/.test(trimmed)) {
        // Rule OAL-CTRL-2: elif must follow if
        if (stack.length === 0 || stack[stack.length - 1].hasElse) {
          this.errorManager.addError(
            `'elif' without matching 'if' or after 'else' at line ${lineNumber}`,
            `${path} [line ~${lineNumber}]`,
            "Remove elif or add if before it",
            "error",
            3
          );
        }

        const condition = this.extractCondition(trimmed);
        if (!condition || condition.trim() === "") {
          this.errorManager.addError(
            `Empty condition in 'elif' statement at line ${lineNumber}`,
            `${path} [line ~${lineNumber}]`,
            "Add condition inside elif(...)",
            "error",
            3
          );
        }
      }
      // Match 'else' statement
      else if (/^else\s*$/.test(trimmed)) {
        // Rule OAL-CTRL-2: else must follow if
        if (stack.length === 0) {
          this.errorManager.addError(
            `'else' without matching 'if' at line ${lineNumber}`,
            `${path} [line ~${lineNumber}]`,
            "Remove else or add if before it",
            "error",
            3
          );
        }
        // Rule OAL-CTRL-3: Only one else per if
        else if (stack[stack.length - 1].hasElse) {
          this.errorManager.addError(
            `Multiple 'else' clauses in same if block at line ${lineNumber}`,
            `${path} [line ~${lineNumber}]`,
            "Remove duplicate else clause",
            "error",
            3
          );
        } else {
          stack[stack.length - 1].hasElse = true;
        }
      }
      // Match 'end if' statement
      else if (/^end\s+if\s*;?$/.test(trimmed)) {
        // Rule OAL-CTRL-1: end if must have matching if
        if (stack.length === 0) {
          this.errorManager.addError(
            `'end if' without matching 'if' at line ${lineNumber}`,
            `${path} [line ~${lineNumber}]`,
            "Remove 'end if' or add if before it",
            "error",
            3
          );
        } else {
          stack.pop();
        }
      }
    }

    // Rule OAL-CTRL-1: Check for unclosed if blocks
    for (const block of stack) {
      this.errorManager.addError(
        `Unclosed 'if' block starting at line ${block.line}. Missing 'end if'.`,
        `${path} [line ~${block.line}]`,
        "Add 'end if;' to close the if block",
        "error",
        3
      );
    }
  }

  /**
   * Extract condition from if/elif statement
   */
  extractCondition(line) {
    const match = line.match(/\((.*?)\)/);
    return match ? match[1] : null;
  }
}
