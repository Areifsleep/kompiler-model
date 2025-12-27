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
        this.validateEventLabels(cls.state_model, cls.key_letter, smPath);
        this.validateEventDataConsistency(cls.state_model, smPath);
        this.validateOALInStates(cls.state_model, smPath);
        this.validateTransitions(cls.state_model, smPath);
        this.validateCurrentStateUpdate(cls.state_model, smPath);
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

  // Rule 26: Event label format KLi (where KL is KeyLetter, i is integer)
  // Rule 27: Event format validation
  validateEventLabels(stateModel, classKeyLetter, smPath) {
    if (!stateModel.events || !Array.isArray(stateModel.events)) return;

    const eventPattern = new RegExp(`^${classKeyLetter}\\d+$`);

    stateModel.events.forEach((event, eventIdx) => {
      const eventPath = `${smPath}.events[${eventIdx}]`;
      const label = event.label || event.name;

      // Rule 26: Validate event label format
      if (label && !eventPattern.test(label)) {
        this.errorManager.addError(
          `Event label '${label}' doesn't follow format '${classKeyLetter}<number>' (e.g., ${classKeyLetter}1, ${classKeyLetter}2)`,
          `${eventPath}.label`,
          `Use format: ${classKeyLetter}1, ${classKeyLetter}2, ${classKeyLetter}3, etc.`,
          "error",
          3
        );
      }

      // Rule 27: Validate event has meaning/description
      if (!event.meaning && !event.description) {
        this.errorManager.addError(
          `Event '${label}' missing 'meaning' or 'description'`,
          eventPath,
          "Add 'meaning' field to describe event purpose",
          "warning",
          3
        );
      }

      // Validate parameters structure
      if (event.parameters && !Array.isArray(event.parameters)) {
        this.errorManager.addError(
          `Event '${label}' parameters must be an array`,
          `${eventPath}.parameters`,
          "Change to array format: [{name: 'param1', type: 'string'}]",
          "error",
          3
        );
      }
    });
  }

  // Rule 29: All events causing transition to same state must have same event data
  validateEventDataConsistency(stateModel, smPath) {
    if (!stateModel.transitions || !stateModel.events) return;

    // Group transitions by target state
    const stateTransitions = new Map();
    stateModel.transitions.forEach((trans, idx) => {
      if (trans.to_state) {
        if (!stateTransitions.has(trans.to_state)) {
          stateTransitions.set(trans.to_state, []);
        }
        stateTransitions.get(trans.to_state).push({ ...trans, idx });
      }
    });

    // Check each state's incoming events have consistent parameters
    stateTransitions.forEach((transitions, toState) => {
      if (transitions.length < 2) return; // No need to check if only one transition

      const eventParamSignatures = new Map();

      transitions.forEach(({ event: eventLabel, idx }) => {
        const event = stateModel.events.find((e) => (e.label || e.name) === eventLabel);
        if (!event) return;

        const paramSignature = JSON.stringify(
          (event.parameters || []).map((p) => ({ name: p.name, type: p.type })).sort((a, b) => a.name.localeCompare(b.name))
        );

        if (eventParamSignatures.size === 0) {
          eventParamSignatures.set(eventLabel, paramSignature);
        } else {
          const firstEntry = Array.from(eventParamSignatures.entries())[0];
          const [firstEvent, firstSignature] = firstEntry;

          if (paramSignature !== firstSignature) {
            this.errorManager.addError(
              `Event '${eventLabel}' parameters differ from '${firstEvent}' but both transition to state '${toState}'`,
              `${smPath}.transitions[${idx}]`,
              "All events transitioning to the same state must have identical parameter structure",
              "error",
              3
            );
          }
        }
      });
    });
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

  // Rule 38: Actions must update Current_State (except deletion states)
  validateCurrentStateUpdate(stateModel, smPath) {
    if (!stateModel.states || !Array.isArray(stateModel.states)) return;

    stateModel.states.forEach((state, stateIdx) => {
      const statePath = `${smPath}.states[${stateIdx}]`;

      // Skip if state looks like a deletion state
      if (
        state.name.toLowerCase().includes("delete") ||
        state.name.toLowerCase().includes("removed") ||
        state.action_oal?.toLowerCase().includes("delete")
      ) {
        return;
      }

      // Check if action_oal updates Current_State
      if (state.action_oal) {
        const hasCurrentStateUpdate = /self\.Current_State\s*=/.test(state.action_oal);
        if (!hasCurrentStateUpdate) {
          this.errorManager.addError(
            `State '${state.name}' action doesn't update Current_State`,
            `${statePath}.action_oal`,
            `Add: self.Current_State = "${state.name}";`,
            "warning",
            3
          );
        }
      }
    });
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
