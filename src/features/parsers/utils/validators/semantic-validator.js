import { InitialStateValidator } from "./phase-3-semantic/state-validators/initial-state-validator.js";
import { CurrentStateValidator } from "./phase-3-semantic/state-validators/current-state-validator.js";
import { EventLabelValidator } from "./phase-3-semantic/event-validators/event-label-validator.js";
import { EventConsistencyValidator } from "./phase-3-semantic/event-validators/event-consistency-validator.js";
import { OALValidator } from "./phase-3-semantic/oal-validators/oal-validator.js";
import { TransitionValidator } from "./phase-3-semantic/transition-validator.js";

/**
 * Semantic Validator (Phase 3) - Main Orchestrator
 * Validates semantic and behavioral aspects of the model
 * Coordinates all sub-validators for state machines, events, OAL, and transitions
 */
export class SemanticValidator {
  constructor(errorManager) {
    this.errorManager = errorManager;

    // Initialize sub-validators (OALValidator will be created later with context)
    this.initialStateValidator = new InitialStateValidator(errorManager);
    this.currentStateValidator = new CurrentStateValidator(errorManager);
    this.eventLabelValidator = new EventLabelValidator(errorManager);
    this.eventConsistencyValidator = new EventConsistencyValidator(
      errorManager
    );
    this.transitionValidator = new TransitionValidator(errorManager);
  }

  /**
   * PHASE 3: Semantic & Behavioral validation
   */
  validate(modelJson) {
    if (!modelJson.system_model?.subsystems) return;

    modelJson.system_model.subsystems.forEach((subsystem, subsysIdx) => {
      // Build external entities map for validation (Rule 20)
      const externalEntities = new Map();
      if (subsystem.external_entities) {
        subsystem.external_entities.forEach((ee) => {
          externalEntities.set(ee.key_letter, ee);
        });
      }

      // Build classes map for OAL validation (create/select/delete)
      const classesMap = new Map();
      if (subsystem.classes) {
        subsystem.classes.forEach((cls) => {
          classesMap.set(cls.key_letter, cls);
        });
      }

      // Build relationships map for OAL validation (select...related by)
      const relationshipsMap = new Map();
      if (subsystem.relationships) {
        subsystem.relationships.forEach((rel) => {
          relationshipsMap.set(rel.label, rel);
        });
      }

      // Create OAL validator with model context
      const oalValidator = new OALValidator(
        this.errorManager,
        classesMap,
        relationshipsMap
      );

      if (!subsystem.classes) return;

      subsystem.classes.forEach((cls, clsIdx) => {
        if (!cls.state_model) return;

        const smPath = `$.system_model.subsystems[${subsysIdx}].classes[${clsIdx}].state_model`;

        // Delegate to sub-validators
        this.initialStateValidator.validate(cls.state_model, smPath);
        this.eventLabelValidator.validate(
          cls.state_model,
          cls.key_letter,
          smPath
        );
        this.eventConsistencyValidator.validate(cls.state_model, smPath);
        this.validateOALInStates(
          cls.state_model,
          smPath,
          externalEntities,
          oalValidator
        );
        this.transitionValidator.validate(cls.state_model, smPath);
        this.currentStateValidator.validate(cls.state_model, smPath);
      });
    });
  }

  validateOALInStates(stateModel, smPath, externalEntities, oalValidator) {
    // Validate OAL in states
    if (stateModel.states && Array.isArray(stateModel.states)) {
      stateModel.states.forEach((state, stateIdx) => {
        if (state.action_oal) {
          oalValidator.validate(
            state.action_oal,
            `${smPath}.states[${stateIdx}].action_oal`,
            externalEntities
          );
        }
      });
    }
  }
}
