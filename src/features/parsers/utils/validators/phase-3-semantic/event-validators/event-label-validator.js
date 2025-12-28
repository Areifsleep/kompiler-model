/**
 * Event Label Validator
 * Rule 26, 27: Validates event label format (KL + number)
 */
export class EventLabelValidator {
  constructor(errorManager) {
    this.errorManager = errorManager;
  }

  /**
   * Rule 26: Event label format KLi (where KL is KeyLetter, i is integer)
   * Rule 27: Event format validation
   */
  validate(stateModel, classKeyLetter, smPath) {
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
}
