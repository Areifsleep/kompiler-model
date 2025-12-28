/**
 * Initial State Validator
 * Rule 16: Validates that initial_state exists and references a valid state
 */
export class InitialStateValidator {
  constructor(errorManager) {
    this.errorManager = errorManager;
  }

  /**
   * Validate initial_state exists and references a valid state
   */
  validate(stateModel, smPath) {
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
}
