import { BridgeCallValidator } from "./bridge-call-validator.js";
import { SelfReferenceValidator } from "./self-reference-validator.js";
import { CreateInstanceValidator } from "./create-instance-validator.js";
import { SelectStatementValidator } from "./select-statement-validator.js";
import { DeleteInstanceValidator } from "./delete-instance-validator.js";
import { ControlFlowValidator } from "./control-flow-validator.js";
import { LoopValidator } from "./loop-validator.js";
import { RelateInstanceValidator } from "./relate-instance-validator.js";

/**
 * OAL Validator
 * Orchestrates all OAL-related validations for BPAL97 compliance
 */
export class OALValidator {
  constructor(
    errorManager,
    classesMap = new Map(),
    relationshipsMap = new Map()
  ) {
    this.errorManager = errorManager;
    this.classesMap = classesMap;
    this.relationshipsMap = relationshipsMap;

    // Legacy validators
    this.bridgeCallValidator = new BridgeCallValidator(errorManager);
    this.selfReferenceValidator = new SelfReferenceValidator(errorManager);

    // BPAL97 validators
    this.createInstanceValidator = new CreateInstanceValidator(
      errorManager,
      classesMap
    );
    this.selectStatementValidator = new SelectStatementValidator(
      errorManager,
      classesMap,
      relationshipsMap
    );
    this.deleteInstanceValidator = new DeleteInstanceValidator(errorManager);
    this.controlFlowValidator = new ControlFlowValidator(errorManager);
    this.loopValidator = new LoopValidator(errorManager);
    this.relateInstanceValidator = new RelateInstanceValidator(errorManager);
  }

  /**
   * Validate OAL (Object Action Language) syntax
   */
  validate(oal, path, externalEntities = new Map()) {
    if (!oal || typeof oal !== "string") return;

    // Legacy validations (Rule 20, 21)
    this.bridgeCallValidator.validate(oal, path, externalEntities);
    this.selfReferenceValidator.validate(oal, path);

    // BPAL97 P2: CRUD Operations
    this.createInstanceValidator.validate(oal, path);
    this.selectStatementValidator.validate(oal, path);
    this.deleteInstanceValidator.validate(oal, path);

    // BPAL97 P3: Relationships
    this.relateInstanceValidator.validate(oal, path);

    // BPAL97 P4: Control Flow
    this.controlFlowValidator.validate(oal, path);
    this.loopValidator.validate(oal, path);
  }
}
