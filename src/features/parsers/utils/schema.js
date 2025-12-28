/**
 * xtUML JSON Schema Template
 * Defines the expected structure and types for validation
 */
export const XTUML_SCHEMA = {
  system_model: {
    required: ["system_name", "version", "subsystems"],
    optional: ["description"],
    types: {
      system_name: "string",
      version: "string",
      subsystems: "array",
      description: "string",
    },
  },
  subsystem: {
    required: ["name", "prefix", "classes", "relationships"],
    optional: ["data_types", "external_entities", "description"],
    types: {
      name: "string",
      prefix: "string",
      classes: "array",
      relationships: "array",
      data_types: "array",
      external_entities: "array",
      description: "string",
    },
  },
  class: {
    required: ["name", "key_letter", "class_number", "attributes"],
    optional: ["description", "state_model", "operations", "type"],
    types: {
      name: "string",
      key_letter: "string",
      class_number: "integer",
      attributes: "array",
      description: "string",
      state_model: "object",
      operations: "array",
      type: "string",
    },
  },
  attribute: {
    required: ["name", "type"],
    optional: ["description", "default_value", "referential", "is_identifier"],
    types: {
      name: "string",
      type: "string",
      is_identifier: "boolean",
      description: "string",
      default_value: "any",
      referential: "string|object",
    },
  },
  relationship: {
    required: ["label", "type"],
    optional: [
      "description",
      "one_side",
      "other_side",
      "superclass",
      "subclasses",
      "association_class",
    ],
    types: {
      label: "string",
      type: "string",
      description: "string",
      one_side: "object",
      other_side: "object",
      superclass: "object",
      subclasses: "array",
      association_class: "object",
    },
  },
  state_model: {
    required: ["initial_state", "states"],
    optional: ["events", "transitions", "lifecycle_type"],
    types: {
      initial_state: "string",
      states: "array",
      events: "array",
      transitions: "array",
      lifecycle_type: "string",
    },
  },
};
