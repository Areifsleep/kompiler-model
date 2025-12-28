/**
 * Current State Validator
 * Rule 38: Validates that actions update Current_State (except deletion states)
 */
export class CurrentStateValidator {
  constructor(errorManager) {
    this.errorManager = errorManager;
  }

  /**
   * Rule 38: Actions must update Current_State (except deletion states)
   */
  validate(stateModel, smPath) {
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
        const hasCurrentStateUpdate = /self\.Current_State\s*=/.test(
          state.action_oal
        );
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
}
