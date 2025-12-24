/**
 * Consistency Validator (Phase 2)
 * Validates model consistency according to xtUML rules
 */
export class ConsistencyValidator {
  constructor(errorManager) {
    this.errorManager = errorManager;
    this.keyLetters = new Map();
    this.classMap = new Map();
    this.relationshipLabels = new Set();
  }

  /**
   * Reset internal state
   */
  reset() {
    this.keyLetters.clear();
    this.classMap.clear();
    this.relationshipLabels.clear();
  }

  /**
   * PHASE 2: Validate model consistency (xtUML rules)
   */
  validate(modelJson) {
    this.reset();

    if (!modelJson.system_model?.subsystems) return;

    modelJson.system_model.subsystems.forEach((subsystem, subsysIdx) => {
      const subsysPath = `$.system_model.subsystems[${subsysIdx}]`;

      // Build class map for this subsystem
      if (subsystem.classes && Array.isArray(subsystem.classes)) {
        subsystem.classes.forEach((cls, clsIdx) => {
          const clsPath = `${subsysPath}.classes[${clsIdx}]`;

          // Check KeyLetter uniqueness
          if (cls.key_letter) {
            this.checkKeyLetterUniqueness(cls.key_letter, clsPath, subsysIdx);
            this.classMap.set(cls.key_letter, { name: cls.name, subsysIdx, clsIdx });
          }

          // Check identifier existence
          if (cls.attributes && Array.isArray(cls.attributes)) {
            const hasIdentifier = cls.attributes.some((attr) => attr.is_identifier === true);
            if (!hasIdentifier) {
              this.errorManager.addError(
                `Class '${cls.name}' has no identifier attribute`,
                `${clsPath}`,
                "Mark at least one attribute with 'is_identifier': true",
                "error",
                2
              );
            }

            // Validate referential attributes
            cls.attributes.forEach((attr, attrIdx) => {
              if (attr.referential) {
                this.validateReferentialAttribute(attr, attrIdx, clsIdx, subsysIdx);
              }
            });
          }
        });
      }

      // Check External Entities KeyLetters
      if (subsystem.external_entities && Array.isArray(subsystem.external_entities)) {
        subsystem.external_entities.forEach((ee, eeIdx) => {
          const eePath = `${subsysPath}.external_entities[${eeIdx}]`;
          if (ee.key_letter) {
            this.checkKeyLetterUniqueness(ee.key_letter, eePath, subsysIdx);
          }
        });
      }

      // Validate relationships
      if (subsystem.relationships && Array.isArray(subsystem.relationships)) {
        subsystem.relationships.forEach((rel, relIdx) => {
          this.validateRelationshipConsistency(rel, relIdx, subsysIdx, subsystem);
        });
      }
    });
  }

  checkKeyLetterUniqueness(keyLetter, path, subsysIdx) {
    if (!keyLetter) return;

    if (this.keyLetters.has(keyLetter)) {
      const originalPath = this.keyLetters.get(keyLetter);
      this.errorManager.addError(
        `Duplicate KeyLetter '${keyLetter}' (first defined at ${originalPath})`,
        path,
        "Use a unique KeyLetter for each class/external entity",
        "error",
        2
      );
    } else {
      this.keyLetters.set(keyLetter, path);
    }
  }

  validateReferentialAttribute(attr, attrIdx, clsIdx, subsysIdx) {
    const path = `$.system_model.subsystems[${subsysIdx}].classes[${clsIdx}].attributes[${attrIdx}]`;

    // Referential can be a string (e.g., "R1") or object with relationship_label
    if (typeof attr.referential === "string") {
      // String format is valid (e.g., "R1")
      if (!attr.referential.trim()) {
        this.errorManager.addError(
          `Referential attribute '${attr.name}' has empty relationship label`,
          `${path}.referential`,
          "Provide a valid relationship label (e.g., 'R1', 'R2')",
          "error",
          2
        );
      }
    } else if (typeof attr.referential === "object") {
      // Object format must have relationship_label
      if (!attr.referential.relationship_label) {
        this.errorManager.addError(
          `Referential attribute '${attr.name}' missing 'relationship_label'`,
          `${path}.referential`,
          "Add 'relationship_label' field (e.g., 'R1', 'R2')",
          "error",
          2
        );
      }
    }
  }

  validateRelationshipConsistency(rel, relIdx, subsysIdx, subsystem) {
    const path = `$.system_model.subsystems[${subsysIdx}].relationships[${relIdx}]`;

    // Check label uniqueness
    if (rel.label) {
      if (this.relationshipLabels.has(rel.label)) {
        this.errorManager.addError(`Duplicate relationship label '${rel.label}'`, path, "Use unique labels (R1, R2, R3, etc.)", "error", 2);
      } else {
        this.relationshipLabels.add(rel.label);
      }
    }

    // Validate based on relationship type
    const classKeyLetters = new Set((subsystem.classes || []).map((cls) => cls.key_letter).filter(Boolean));

    if (rel.type === "Subtype") {
      this.validateSubtypeRelationship(rel, path, classKeyLetters);
    } else if (rel.type === "Associative") {
      this.validateAssociativeRelationship(rel, path, classKeyLetters);
    } else if (rel.type === "Simple" || rel.type === "Association") {
      this.validateSimpleRelationship(rel, path, classKeyLetters);
    }
  }

  validateSubtypeRelationship(rel, path, classKeyLetters) {
    // Validate superclass
    if (rel.superclass) {
      if (!classKeyLetters.has(rel.superclass.key_letter)) {
        this.errorManager.addError(
          `Superclass KeyLetter '${rel.superclass.key_letter}' not found in classes`,
          `${path}.superclass`,
          "Reference an existing class KeyLetter",
          "error",
          2
        );
      }
    }

    // Validate subclasses
    if (rel.subclasses && Array.isArray(rel.subclasses)) {
      rel.subclasses.forEach((subclass, subIdx) => {
        if (!classKeyLetters.has(subclass.key_letter)) {
          this.errorManager.addError(
            `Subclass KeyLetter '${subclass.key_letter}' not found in classes`,
            `${path}.subclasses[${subIdx}]`,
            "Reference an existing class KeyLetter",
            "error",
            2
          );
        }
      });
    }
  }

  validateAssociativeRelationship(rel, path, classKeyLetters) {
    // Validate one_side
    if (rel.one_side && !classKeyLetters.has(rel.one_side.key_letter)) {
      this.errorManager.addError(
        `One-side KeyLetter '${rel.one_side.key_letter}' not found in classes`,
        `${path}.one_side`,
        "Reference an existing class KeyLetter",
        "error",
        2
      );
    }

    // Validate other_side
    if (rel.other_side && !classKeyLetters.has(rel.other_side.key_letter)) {
      this.errorManager.addError(
        `Other-side KeyLetter '${rel.other_side.key_letter}' not found in classes`,
        `${path}.other_side`,
        "Reference an existing class KeyLetter",
        "error",
        2
      );
    }

    // Validate association_class
    if (rel.association_class && !classKeyLetters.has(rel.association_class.key_letter)) {
      this.errorManager.addError(
        `Association class KeyLetter '${rel.association_class.key_letter}' not found in classes`,
        `${path}.association_class`,
        "Reference an existing class KeyLetter",
        "error",
        2
      );
    }
  }

  validateSimpleRelationship(rel, path, classKeyLetters) {
    // Validate one_side and other_side
    if (rel.one_side && !classKeyLetters.has(rel.one_side.key_letter)) {
      this.errorManager.addError(
        `One-side KeyLetter '${rel.one_side.key_letter}' not found in classes`,
        `${path}.one_side`,
        "Reference an existing class KeyLetter",
        "error",
        2
      );
    }
    if (rel.other_side && !classKeyLetters.has(rel.other_side.key_letter)) {
      this.errorManager.addError(
        `Other-side KeyLetter '${rel.other_side.key_letter}' not found in classes`,
        `${path}.other_side`,
        "Reference an existing class KeyLetter",
        "error",
        2
      );
    }
  }
}
