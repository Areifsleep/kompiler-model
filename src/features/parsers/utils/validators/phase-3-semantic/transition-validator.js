/**
 * Transition Validator
 * Validates state machine transitions
 */
export class TransitionValidator {
  constructor(errorManager) {
    this.errorManager = errorManager;
  }

  /**
   * Validate transitions reference valid states and events
   */
  validate(stateModel, smPath) {
    // Validate transitions
    if (stateModel.transitions && Array.isArray(stateModel.transitions)) {
      const stateNames = new Set((stateModel.states || []).map((s) => s.name));
      // Events can have 'label' (preferred) or 'name' field
      const eventLabels = new Set(
        (stateModel.events || []).map((e) => e.label || e.name)
      );

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
}
