/**
 * Loop Validator
 *
 * Validates OAL loop structures: for each...in...end for
 *
 * Validation Rules:
 * - Rule OAL-LOOP-1: Every 'for each' must have matching 'end for'
 * - Rule OAL-LOOP-2: Loop variable must be valid identifier
 * - Rule OAL-LOOP-3: Collection variable must be declared
 * - Rule OAL-LOOP-4: Proper nesting of for loops
 *
 * Example Valid:
 *   for each krs in krs_list
 *     total = total + krs.SKS;
 *   end for;
 *
 * Example Invalid:
 *   for each krs in krs_list
 *     total = total + krs.SKS;
 *   // Missing 'end for'
 */

import { getOALLineOffset } from "../../../tokenizer.js";

export class LoopValidator {
  constructor(errorManager) {
    this.errorManager = errorManager;
  }

  /**
   * Validate loop structures in OAL
   * @param {string} oalCode - The OAL code to validate
   * @param {string} path - JSONPath to this OAL code
   */
  validate(oalCode, path) {
    if (!oalCode) return;

    // Validate for each...in...end for structure
    this.validateForEachLoops(oalCode, path);
  }

  /**
   * Validate for each...in...end for structure
   */
  validateForEachLoops(oalCode, path) {
    const lines = oalCode.split("\n");
    const stack = []; // Stack to track nested for loops
    const declaredVars = this.extractDeclaredVariables(oalCode);
    let lineNumber = 0;

    for (const line of lines) {
      lineNumber++;
      const trimmed = line.trim();

      // Match 'for each <var> in <collection>'
      const forMatch = trimmed.match(/^for\s+each\s+(\w+)\s+in\s+(\w+)\s*$/);
      if (forMatch) {
        const loopVar = forMatch[1];
        const collection = forMatch[2];

        // Rule OAL-LOOP-2: Validate loop variable name
        if (!/^[a-zA-Z_]\w*$/.test(loopVar)) {
          this.errorManager.addError(
            `Invalid loop variable name "${loopVar}". Must start with letter or underscore.`,
            `${path} [line ~${lineNumber}]`,
            "Use valid identifier for loop variable",
            "error",
            3
          );
        }

        // Rule OAL-LOOP-3: Check if collection is declared (warning)
        if (!declaredVars.has(collection) && collection !== "self") {
          this.errorManager.addError(
            `Collection variable "${collection}" not found. Ensure it's declared before loop.`,
            `${path} [line ~${lineNumber}]`,
            "Declare collection variable before using in loop",
            "warning",
            3
          );
        }

        stack.push({ type: "for", line: lineNumber, loopVar, collection });
      }
      // Match 'end for'
      else if (/^end\s+for\s*;?$/.test(trimmed)) {
        // Rule OAL-LOOP-1: end for must have matching for each
        if (stack.length === 0) {
          this.errorManager.addError(
            `'end for' without matching 'for each' at line ${lineNumber}`,
            `${path} [line ~${lineNumber}]`,
            "Remove 'end for' or add 'for each' before it",
            "error",
            3
          );
        } else {
          stack.pop();
        }
      }
    }

    // Rule OAL-LOOP-1: Check for unclosed for loops
    for (const loop of stack) {
      this.errorManager.addError(
        `Unclosed 'for each' loop starting at line ${loop.line}. Missing 'end for'.`,
        `${path} [line ~${loop.line}]`,
        "Add 'end for;' to close the loop",
        "error",
        3
      );
    }
  }

  /**
   * Extract declared variables from OAL code
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

    // From simple assignments
    const assignPattern = /^(\w+)\s*=/gm;
    while ((match = assignPattern.exec(oalCode)) !== null) {
      if (match[1] !== "self") {
        vars.add(match[1]);
      }
    }

    return vars;
  }
}
