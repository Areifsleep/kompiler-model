import { tokenizeOAL, getOALLineOffset } from "../tokenizer.js";

/**
 * Semantic Validator (Phase 3)
 * Validates semantic and behavioral aspects of the model
 */
export class SemanticValidator {
  constructor(errorManager) {
    this.errorManager = errorManager;
  }

  /**
   * PHASE 3: Semantic & Behavioral validation
   */
  validate(modelJson) {
    if (!modelJson.system_model?.subsystems) return;

    modelJson.system_model.subsystems.forEach((subsystem, subsysIdx) => {
      if (!subsystem.classes) return;

      subsystem.classes.forEach((cls, clsIdx) => {
        if (!cls.state_model) return;

        const smPath = `$.system_model.subsystems[${subsysIdx}].classes[${clsIdx}].state_model`;

        this.validateInitialState(cls.state_model, smPath);
        this.validateOALInStates(cls.state_model, smPath);
        this.validateTransitions(cls.state_model, smPath);
      });
    });
  }

  validateInitialState(stateModel, smPath) {
    // Validate initial_state exists
    if (stateModel.initial_state && stateModel.states) {
      const stateNames = stateModel.states.map((s) => s.name);
      if (!stateNames.includes(stateModel.initial_state)) {
        this.errorManager.addError(
          `Initial state '${stateModel.initial_state}' not found in states`,
          `${smPath}.initial_state`,
          "Reference an existing state name",
          "error",
          3
        );
      }
    }
  }

  validateOALInStates(stateModel, smPath) {
    // Validate OAL in states
    if (stateModel.states && Array.isArray(stateModel.states)) {
      stateModel.states.forEach((state, stateIdx) => {
        if (state.action_oal) {
          this.validateOAL(state.action_oal, `${smPath}.states[${stateIdx}].action_oal`);
        }
      });
    }
  }

  validateTransitions(stateModel, smPath) {
    // Validate transitions
    if (stateModel.transitions && Array.isArray(stateModel.transitions)) {
      const stateNames = new Set((stateModel.states || []).map((s) => s.name));
      // Events can have 'label' (preferred) or 'name' field
      const eventLabels = new Set((stateModel.events || []).map((e) => e.label || e.name));

      stateModel.transitions.forEach((trans, transIdx) => {
        const transPath = `${smPath}.transitions[${transIdx}]`;

        if (trans.from_state && !stateNames.has(trans.from_state)) {
          this.errorManager.addError(
            `Transition from_state '${trans.from_state}' not found`,
            `${transPath}.from_state`,
            "Reference an existing state name",
            "error",
            3
          );
        }

        if (trans.to_state && !stateNames.has(trans.to_state)) {
          this.errorManager.addError(
            `Transition to_state '${trans.to_state}' not found`,
            `${transPath}.to_state`,
            "Reference an existing state name",
            "error",
            3
          );
        }

        if (trans.event && !eventLabels.has(trans.event)) {
          this.errorManager.addError(
            `Transition event '${trans.event}' not found`,
            `${transPath}.event`,
            "Define the event in state_model.events with matching label",
            "warning",
            3
          );
        }
      });
    }
  }

  /**
   * Validate OAL (Object Action Language) syntax
   */
  validateOAL(oal, path) {
    if (!oal || typeof oal !== "string") return;

    const tokens = tokenizeOAL(oal);

    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];

      // Rule: 'self' must be followed by '.'
      if (t.value === "self") {
        const next = tokens[i + 1];
        if (!next || next.value !== ".") {
          this.errorManager.addError(
            "Keyword 'self' must be followed by '.' (e.g., self.AttributeName)",
            `${path} [line ~${getOALLineOffset(oal, t.index)}]`,
            "Add '.' after 'self' to access attributes",
            "error",
            3
          );
        }
      }

      // Rule: Bridge call format KEYLETTER::Function
      if (t.value === "::") {
        const prev = tokens[i - 1];
        if (!prev || !/^[A-Z][A-Z0-9_]*$/.test(prev.value)) {
          this.errorManager.addError(
            `Bridge call '::' must be preceded by valid KeyLetter (uppercase)`,
            `${path} [line ~${getOALLineOffset(oal, t.index)}]`,
            "Format: KEYLETTER::FunctionName",
            "error",
            3
          );
        }
      }
    }
  }
}
