import { tokenizeOAL, getOALLineOffset } from "../../../tokenizer.js";

/**
 * Bridge Call Validator
 * Rule 20, 21: Validates External Entity bridge calls
 */
export class BridgeCallValidator {
  constructor(errorManager) {
    this.errorManager = errorManager;
  }

  /**
   * Validate bridge calls (KEY::Method syntax) in OAL code
   */
  validate(oal, path, externalEntities = new Map()) {
    if (!oal || typeof oal !== "string") return;

    const tokens = tokenizeOAL(oal);

    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];

      // Rule 20: Bridge call format KEYLETTER::Function
      if (t.value === "::") {
        const prev = tokens[i - 1];
        const next = tokens[i + 1];

        // Validate format: UPPERCASE_KEY::functionName
        if (!prev || !/^[A-Z][A-Z0-9_]*$/.test(prev.value)) {
          this.errorManager.addError(
            `Bridge call format error: KeyLetter before '::' must be UPPERCASE (e.g., LOG::LogInfo)`,
            `${path} [line ~${getOALLineOffset(oal, t.index)}]`,
            "Use UPPERCASE keyletter for External Entity (e.g., LOG, TIM, MATH)",
            "error",
            3
          );
        }

        // Rule 20: Validate External Entity exists
        if (prev && externalEntities.size > 0) {
          const keyLetter = prev.value;
          const externalEntity = externalEntities.get(keyLetter);

          if (!externalEntity) {
            const availableEEs = Array.from(externalEntities.keys()).join(", ");
            const suggestion = availableEEs
              ? `Available External Entities: ${availableEEs}`
              : "Define external_entities in subsystem JSON";

            this.errorManager.addError(
              `Unknown External Entity: '${keyLetter}' (Rule 20 Shlaer-Mellor violation)`,
              `${path} [line ~${getOALLineOffset(oal, t.index)}]`,
              suggestion,
              "error",
              3
            );
          } else if (next) {
            // Validate bridge method exists
            const methodName = next.value;
            const bridge = externalEntity.bridges?.find(
              (b) => b.name === methodName
            );

            if (!bridge) {
              const availableBridges =
                externalEntity.bridges?.map((b) => b.name).join(", ") || "none";
              this.errorManager.addError(
                `Unknown bridge method: '${keyLetter}::${methodName}'`,
                `${path} [line ~${getOALLineOffset(oal, t.index)}]`,
                `Available bridges for ${keyLetter}: ${availableBridges}`,
                "error",
                3
              );
            }
          }
        }
      }
    }
  }
}
