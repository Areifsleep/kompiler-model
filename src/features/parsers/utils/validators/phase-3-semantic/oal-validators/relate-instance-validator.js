import { tokenizeOAL, getOALLineOffset } from "../../../tokenizer.js";

/**
 * Relate Instances Validator (BPAL97 P3 Feature)
 * Validates 'relate ... to ... across RX' syntax
 *
 * Valid syntax:
 * - relate instance1 to instance2 across R1;
 * - relate self to otherInstance across R5;
 */
export class RelateInstanceValidator {
  constructor(errorManager) {
    this.errorManager = errorManager;
  }

  /**
   * Validate relate statement syntax
   * Pattern: relate <var1> to <var2> across R<num>;
   */
  validate(oal, path) {
    if (!oal || typeof oal !== "string") return;

    const tokens = tokenizeOAL(oal);

    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];

      // Skip tokens inside strings
      if (t.isString) continue;

      // Find 'relate' keyword
      if (t.value === "relate") {
        // Pattern: relate var1 to var2 across R1;
        const var1 = tokens[i + 1];
        const toKeyword = tokens[i + 2];
        const var2 = tokens[i + 3];
        const acrossKeyword = tokens[i + 4];
        const relationship = tokens[i + 5];
        const semicolon = tokens[i + 6];

        // Validate structure
        if (!var1 || var1.isString) {
          this.errorManager.addError(
            "Missing instance variable after 'relate' keyword",
            `${path} [line ~${getOALLineOffset(oal, t.index)}]`,
            "Use: relate var1 to var2 across R1;",
            "error",
            3
          );
          continue;
        }

        if (!toKeyword || toKeyword.value !== "to") {
          this.errorManager.addError(
            "Expected 'to' keyword after instance variable in relate statement",
            `${path} [line ~${getOALLineOffset(oal, t.index)}]`,
            "Use: relate var1 to var2 across R1;",
            "error",
            3
          );
          continue;
        }

        if (!var2 || var2.isString) {
          this.errorManager.addError(
            "Missing second instance variable after 'to' in relate statement",
            `${path} [line ~${getOALLineOffset(oal, t.index)}]`,
            "Use: relate var1 to var2 across R1;",
            "error",
            3
          );
          continue;
        }

        if (!acrossKeyword || acrossKeyword.value !== "across") {
          this.errorManager.addError(
            "Expected 'across' keyword in relate statement",
            `${path} [line ~${getOALLineOffset(oal, t.index)}]`,
            "Use: relate var1 to var2 across R1;",
            "error",
            3
          );
          continue;
        }

        if (!relationship || !relationship.value.match(/^R\d+$/)) {
          this.errorManager.addError(
            "Invalid relationship label in relate statement",
            `${path} [line ~${getOALLineOffset(oal, t.index)}]`,
            "Use relationship label like R1, R2, R10, etc.",
            "error",
            3
          );
          continue;
        }

        if (!semicolon || semicolon.value !== ";") {
          this.errorManager.addError(
            "Missing semicolon at end of relate statement",
            `${path} [line ~${getOALLineOffset(oal, t.index)}]`,
            "Add ';' at the end",
            "error",
            3
          );
        }
      }
    }
  }
}
