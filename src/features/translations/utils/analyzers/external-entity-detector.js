/**
 * External Entity Detector
 * Scans OAL code to detect which External Entities are actually used
 */
export class ExternalEntityDetector {
  constructor(classes, externalEntities) {
    this.classes = classes;
    this.externalEntities = externalEntities;
  }

  /**
   * Detect which External Entities are used in OAL code
   */
  detect() {
    const usedExternalEntities = new Set();

    this.classes.forEach((cls) => {
      if (!cls.state_model?.states) return;

      cls.state_model.states.forEach((state) => {
        if (!state.action_oal) return;

        // Match all bridge calls: KEY::Method(...)
        const bridgeCallRegex = /([A-Z]+)::/g;
        let match;

        while ((match = bridgeCallRegex.exec(state.action_oal)) !== null) {
          const keyLetter = match[1];
          if (this.externalEntities.has(keyLetter)) {
            usedExternalEntities.add(keyLetter);
          }
        }
      });
    });

    return usedExternalEntities;
  }
}
