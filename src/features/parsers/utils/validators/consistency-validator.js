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
    this.subsystemNames = new Set();
    this.stateModelKeyLetters = new Map();
  }

  /**
   * Reset internal state
   */
  reset() {
    this.keyLetters.clear();
    this.classMap.clear();
    this.relationshipLabels.clear();
    this.subsystemNames.clear();
    this.stateModelKeyLetters.clear();
  }

  /**
   * PHASE 2: Validate model consistency (xtUML rules)
   */
  validate(modelJson) {
    this.reset();

    if (!modelJson.system_model?.subsystems) return;

    modelJson.system_model.subsystems.forEach((subsystem, subsysIdx) => {
      const subsysPath = `$.system_model.subsystems[${subsysIdx}]`;

      // Rule 2: Each subsystem must have a unique name
      if (subsystem.name) {
        if (this.subsystemNames.has(subsystem.name)) {
          this.errorManager.addError(
            `Duplicate subsystem name '${subsystem.name}'`,
            `${subsysPath}.name`,
            "Use a unique name for each subsystem",
            "error",
            2
          );
        } else {
          this.subsystemNames.add(subsystem.name);
        }
      }

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

            // Rule 8: Check attribute name uniqueness within class
            const attributeNames = new Map();
            cls.attributes.forEach((attr, attrIdx) => {
              if (attr.name) {
                if (attributeNames.has(attr.name)) {
                  const firstIdx = attributeNames.get(attr.name);
                  this.errorManager.addError(
                    `Duplicate attribute name '${attr.name}' in class '${cls.name}' (first defined at attributes[${firstIdx}])`,
                    `${clsPath}.attributes[${attrIdx}]`,
                    "Use unique attribute names within each class",
                    "error",
                    2
                  );
                } else {
                  attributeNames.set(attr.name, attrIdx);
                }
              }
            });

            // Validate referential attributes
            cls.attributes.forEach((attr, attrIdx) => {
              if (attr.referential) {
                this.validateReferentialAttribute(attr, attrIdx, clsIdx, subsysIdx, cls, subsystem);
              }
            });
          }

          // Rule 17 & 38: Validate state model
          if (cls.state_model) {
            this.validateStateModelConsistency(cls.state_model, cls.key_letter, cls.name, clsIdx, subsysIdx, cls.attributes);
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

  validateReferentialAttribute(attr, attrIdx, clsIdx, subsysIdx, cls, subsystem) {
    const path = `$.system_model.subsystems[${subsysIdx}].classes[${clsIdx}].attributes[${attrIdx}]`;

    // Referential can be a string (e.g., "R1") or object with relationship_label
    let relLabel = null;
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
        return;
      }
      relLabel = attr.referential;
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
        return;
      }
      relLabel = attr.referential.relationship_label;
    }

    // Rule 11: Domain type checking - validate referenced attribute type matches
    if (relLabel && subsystem.relationships) {
      const relationship = subsystem.relationships.find((r) => r.label === relLabel);
      if (relationship) {
        this.validateReferentialTypeMatch(attr, cls, relationship, subsystem, path);
      }
    }
  }

  validateRelationshipConsistency(rel, relIdx, subsysIdx, subsystem) {
    const path = `$.system_model.subsystems[${subsysIdx}].relationships[${relIdx}]`;

    // Rule 9 (Note): Check label existence and uniqueness
    if (!rel.label || (typeof rel.label === "string" && !rel.label.trim())) {
      this.errorManager.addError(
        `Relationship missing or has empty label`,
        `${path}.label`,
        "Provide a valid relationship label (e.g., 'R1', 'R2', 'R3')",
        "error",
        2
      );
    } else {
      // Check label uniqueness
      if (this.relationshipLabels.has(rel.label)) {
        this.errorManager.addError(`Duplicate relationship label '${rel.label}'`, path, "Use unique labels (R1, R2, R3, etc.)", "error", 2);
      } else {
        this.relationshipLabels.add(rel.label);
      }
    }

    // Rule 12: Validate relationship composition (Ri = Rj + Rk)
    if (rel.composition) {
      this.validateRelationshipComposition(rel, path, subsystem);
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

  // Rule 11: Validate referential attribute type matches referenced attribute
  validateReferentialTypeMatch(attr, cls, relationship, subsystem, path) {
    // Find the referenced class based on relationship type
    let referencedClass = null;

    if (relationship.type === "Subtype" && relationship.superclass) {
      referencedClass = subsystem.classes?.find((c) => c.key_letter === relationship.superclass.key_letter);
    } else if (relationship.one_side && relationship.one_side.key_letter !== cls.key_letter) {
      referencedClass = subsystem.classes?.find((c) => c.key_letter === relationship.one_side.key_letter);
    } else if (relationship.other_side && relationship.other_side.key_letter !== cls.key_letter) {
      referencedClass = subsystem.classes?.find((c) => c.key_letter === relationship.other_side.key_letter);
    }

    if (referencedClass) {
      // Find matching attribute in referenced class (by name or by identifier)
      const matchingAttr = referencedClass.attributes?.find(
        (a) => a.name === attr.name || (a.is_identifier && attr.name.includes(referencedClass.key_letter))
      );

      if (matchingAttr && matchingAttr.type !== attr.type) {
        this.errorManager.addError(
          `Referential attribute '${attr.name}' type '${attr.type}' doesn't match referenced attribute type '${matchingAttr.type}'`,
          path,
          `Change type to '${matchingAttr.type}' to match referenced attribute`,
          "error",
          2
        );
      }
    }
  }

  // Rule 12: Validate relationship composition (Ri = Rj + Rk)
  validateRelationshipComposition(rel, path, subsystem) {
    if (typeof rel.composition === "string") {
      // Format: "R1+R2" or "R1 + R2"
      const parts = rel.composition.split("+").map((s) => s.trim());
      if (parts.length !== 2) {
        this.errorManager.addError(
          `Invalid composition format '${rel.composition}'`,
          `${path}.composition`,
          "Use format 'Rj+Rk' (e.g., 'R1+R2')",
          "error",
          2
        );
        return;
      }

      // Validate both relationships exist
      parts.forEach((relLabel) => {
        const exists = subsystem.relationships?.some((r) => r.label === relLabel);
        if (!exists) {
          this.errorManager.addError(
            `Composition references undefined relationship '${relLabel}'`,
            `${path}.composition`,
            `Define relationship '${relLabel}' first or fix composition formula`,
            "error",
            2
          );
        }
      });
    }
  }

  // Rule 17, 19, 38: Validate state model consistency
  validateStateModelConsistency(stateModel, classKeyLetter, className, clsIdx, subsysIdx, classAttributes) {
    const smPath = `$.system_model.subsystems[${subsysIdx}].classes[${clsIdx}].state_model`;

    // Rule 17: State model must have unique KeyLetter matching class
    if (stateModel.lifecycle_type) {
      const expectedKL = classKeyLetter;
      // Store for uniqueness checking
      if (this.stateModelKeyLetters.has(expectedKL)) {
        this.errorManager.addError(
          `State model KeyLetter '${expectedKL}' already used`,
          smPath,
          "Each state model must have unique KeyLetter",
          "error",
          2
        );
      } else {
        this.stateModelKeyLetters.set(expectedKL, className);
      }
    }

    // Rule 18 & 19: Each state must have unique name and number
    if (stateModel.states && Array.isArray(stateModel.states)) {
      const stateNames = new Map();
      const stateNumbers = new Map();

      stateModel.states.forEach((state, stateIdx) => {
        // Rule 18: Check state name uniqueness
        if (state.name) {
          if (stateNames.has(state.name)) {
            const firstIdx = stateNames.get(state.name);
            this.errorManager.addError(
              `Duplicate state name '${state.name}' (first defined at states[${firstIdx}])`,
              `${smPath}.states[${stateIdx}].name`,
              "Use unique state names within each state model",
              "error",
              2
            );
          } else {
            stateNames.set(state.name, stateIdx);
          }
        }

        // Rule 19: Check state number uniqueness
        if (state.state_number !== undefined) {
          if (stateNumbers.has(state.state_number)) {
            const firstState = stateNumbers.get(state.state_number);
            this.errorManager.addError(
              `Duplicate state number ${state.state_number} (first used by '${firstState}')`,
              `${smPath}.states[${stateIdx}].state_number`,
              "Assign unique state numbers (1, 2, 3, ...)",
              "error",
              2
            );
          } else {
            stateNumbers.set(state.state_number, state.name);
          }
        }
      });
    }

    // Rule 38: Check if Current_State attribute exists
    const hasCurrentState = classAttributes?.some((attr) => attr.name === "Current_State" && attr.type?.includes("state"));
    if (!hasCurrentState) {
      this.errorManager.addError(
        `Class '${className}' with state model must have 'Current_State' attribute`,
        `${smPath}`,
        "Add attribute: { name: 'Current_State', type: 'state<${classKeyLetter}>', is_identifier: false }",
        "warning",
        2
      );
    }
  }
}
