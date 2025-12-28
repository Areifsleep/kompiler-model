import { tokenizeOAL, getOALLineOffset } from "../../../tokenizer.js";

/**
 * Self Reference Validator
 * Validates 'self' keyword usage in OAL (BPAL97 compliant)
 *
 * Valid syntax:
 * - self.AttributeName (attribute access)
 * - self->ClassName[Rn] (relationship navigation)
 *
 * @version 3.1.2 - Ignores 'self' inside string literals
 * @date 2025-12-28
 */
export class SelfReferenceValidator {
  constructor(errorManager) {
    this.errorManager = errorManager;
  }

  /**
   * Validate 'self' must be followed by '.' OR '->'
   * Rule: BPAL97 allows both attribute access and relationship navigation
   * Note: Skips tokens inside string literals (e.g., "Student self is active")
   * @version 3.1.2-HOTFIX (CACHE_BUST_v2)
   */
  validate(oal, path) {
    if (!oal || typeof oal !== "string") return;

    const tokens = tokenizeOAL(oal);

    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];

      // CRITICAL: Skip tokens inside string literals (v3.1.2 fix)
      if (t.isString) {
        continue; // Don't validate 'self' inside strings
      }

      // Rule: 'self' must be followed by '.' (attribute) or '->' (navigation)
      if (t.value === "self") {
        const next = tokens[i + 1];

        // Check if followed by '.' or '->' (now captured as single token)
        const isValidAttributeAccess = next && next.value === ".";
        const isValidNavigation = next && next.value === "->"; // FIXED: -> is now one token

        // Only throw error if NEITHER pattern matches
        if (!isValidAttributeAccess && !isValidNavigation) {
          this.errorManager.addError(
            "Keyword 'self' must be followed by '.' (attribute access) or '->' (relationship navigation)",
            `${path} [line ~${getOALLineOffset(oal, t.index)}]`,
            "Use 'self.AttributeName' or 'self->ClassName[Rn]'",
            "error",
            3
          );
        }
      }
    }
  }
}
