import { XTUML_SCHEMA } from "../schema.js";

/**
 * Schema Validator (Phase 1)
 * Validates JSON structure against xtUML schema
 */
export class SchemaValidator {
  constructor(errorManager) {
    this.errorManager = errorManager;
  }

  /**
   * PHASE 1: Validate JSON structure against xtUML schema
   */
  validate(modelJson) {
    // Check root structure
    if (typeof modelJson !== "object" || modelJson === null) {
      this.errorManager.addError(
        "Root must be a valid JSON object",
        "$",
        "Ensure the input is valid JSON and starts with '{'",
        "error",
        1
      );
      return;
    }

    // Normalize model before validation (set default values)
    this.normalizeModel(modelJson);

    // Check for unknown keys at root
    const rootKeys = Object.keys(modelJson);
    const allowedRootKeys = ["system_model"];
    const unknownRootKeys = rootKeys.filter(
      (k) => !allowedRootKeys.includes(k)
    );

    if (unknownRootKeys.length > 0) {
      this.errorManager.addError(
        `Unknown root key(s): ${unknownRootKeys.join(", ")}`,
        "$",
        "Only 'system_model' is allowed at root level",
        "error",
        1
      );
    }

    // Validate system_model
    if (!modelJson.system_model) {
      this.errorManager.addError(
        "Missing required root key 'system_model'",
        "$",
        "Add 'system_model' object at root level",
        "error",
        1
      );
      return;
    }

    this.validateObject(
      modelJson.system_model,
      XTUML_SCHEMA.system_model,
      "$.system_model"
    );

    // Validate subsystems
    if (!modelJson.system_model.subsystems) {
      return; // Already reported as missing required key
    }

    if (!Array.isArray(modelJson.system_model.subsystems)) {
      this.errorManager.addError(
        "Field 'subsystems' must be an array",
        "$.system_model.subsystems",
        "Change 'subsystems' to an array: []",
        "error",
        1
      );
      return;
    }

    modelJson.system_model.subsystems.forEach((subsystem, idx) => {
      this.validateSubsystem(subsystem, idx);
    });
  }

  validateObject(obj, schema, path) {
    if (typeof obj !== "object" || obj === null) {
      this.errorManager.addError(
        `Expected object at '${path}'`,
        path,
        "Ensure this field is a valid JSON object",
        "error",
        1
      );
      return;
    }

    // Check required fields
    schema.required.forEach((field) => {
      if (!(field in obj)) {
        this.errorManager.addError(
          `Missing required field '${field}'`,
          `${path}`,
          `Add '${field}' field with type ${schema.types[field]}`,
          "error",
          1
        );
      }
    });

    // Check field types
    Object.keys(obj).forEach((field) => {
      const expectedType = schema.types[field];

      if (
        !expectedType &&
        !schema.optional.includes(field) &&
        !schema.required.includes(field)
      ) {
        this.errorManager.addError(
          `Unknown field '${field}'`,
          `${path}.${field}`,
          `Remove this field or check spelling against schema`,
          "warning",
          1
        );
        return;
      }

      if (expectedType) {
        this.validateType(obj[field], expectedType, `${path}.${field}`);
      }
    });
  }

  validateType(value, expectedType, path) {
    const actualType = Array.isArray(value) ? "array" : typeof value;

    if (expectedType === "integer") {
      if (typeof value !== "number" || !Number.isInteger(value)) {
        this.errorManager.addError(
          `Expected integer, got ${actualType}`,
          path,
          "Use an integer value (e.g., 1, 2, 3)",
          "error",
          1
        );
      }
    } else if (expectedType === "string|object") {
      // Allow either string or object
      if (actualType !== "string" && actualType !== "object") {
        this.errorManager.addError(
          `Expected string or object, got ${actualType}`,
          path,
          `Use either a string (e.g., "R1") or an object`,
          "error",
          1
        );
      }
    } else if (expectedType !== "any" && actualType !== expectedType) {
      this.errorManager.addError(
        `Expected ${expectedType}, got ${actualType}`,
        path,
        `Change to ${expectedType} type`,
        "error",
        1
      );
    }
  }

  validateSubsystem(subsystem, idx) {
    const path = `$.system_model.subsystems[${idx}]`;

    this.validateObject(subsystem, XTUML_SCHEMA.subsystem, path);

    // Validate classes array
    if (subsystem.classes && Array.isArray(subsystem.classes)) {
      subsystem.classes.forEach((cls, clsIdx) => {
        this.validateClass(cls, clsIdx, idx);
      });
    }

    // Validate relationships array
    if (subsystem.relationships && Array.isArray(subsystem.relationships)) {
      subsystem.relationships.forEach((rel, relIdx) => {
        this.validateRelationship(rel, relIdx, idx);
      });
    }
  }

  validateClass(cls, clsIdx, subsysIdx) {
    const path = `$.system_model.subsystems[${subsysIdx}].classes[${clsIdx}]`;

    this.validateObject(cls, XTUML_SCHEMA.class, path);

    // Validate attributes array
    if (cls.attributes && Array.isArray(cls.attributes)) {
      cls.attributes.forEach((attr, attrIdx) => {
        this.validateAttribute(attr, attrIdx, clsIdx, subsysIdx);
      });
    }

    // Validate state_model if present
    if (cls.state_model) {
      this.validateStateModel(cls.state_model, clsIdx, subsysIdx);
    }
  }

  validateAttribute(attr, attrIdx, clsIdx, subsysIdx) {
    const path = `$.system_model.subsystems[${subsysIdx}].classes[${clsIdx}].attributes[${attrIdx}]`;

    this.validateObject(attr, XTUML_SCHEMA.attribute, path);
  }

  validateRelationship(rel, relIdx, subsysIdx) {
    const path = `$.system_model.subsystems[${subsysIdx}].relationships[${relIdx}]`;

    this.validateObject(rel, XTUML_SCHEMA.relationship, path);
  }

  validateStateModel(stateModel, clsIdx, subsysIdx) {
    const path = `$.system_model.subsystems[${subsysIdx}].classes[${clsIdx}].state_model`;

    this.validateObject(stateModel, XTUML_SCHEMA.state_model, path);
  }

  /**
   * Normalize model by setting default values for optional fields
   * This ensures backward compatibility and reduces JSON verbosity
   */
  normalizeModel(modelJson) {
    if (!modelJson.system_model?.subsystems) return;

    modelJson.system_model.subsystems.forEach((subsystem) => {
      if (!subsystem.classes) return;

      subsystem.classes.forEach((cls) => {
        if (!cls.attributes) return;

        // Rule 9: Set default is_identifier = false if not specified
        // This makes the field optional while maintaining validation logic
        cls.attributes.forEach((attr) => {
          if (attr.is_identifier === undefined) {
            attr.is_identifier = false;
          }
        });
      });
    });
  }
}
