/**
 * Event Consistency Validator
 * Rule 29: Validates event data consistency
 */
export class EventConsistencyValidator {
  constructor(errorManager) {
    this.errorManager = errorManager;
  }

  /**
   * Rule 29: All events causing transition to same state must have same event data
   */
  validate(stateModel, smPath) {
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
        const event = stateModel.events.find(
          (e) => (e.label || e.name) === eventLabel
        );
        if (!event) return;

        const paramSignature = JSON.stringify(
          (event.parameters || [])
            .map((p) => ({ name: p.name, type: p.type }))
            .sort((a, b) => a.name.localeCompare(b.name))
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
}
