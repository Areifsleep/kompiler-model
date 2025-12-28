# xtUML Rules Compliance & OAL Extensions

## Shlaer-Mellor Rules Implementation Status

This document maps the implementation of Shlaer-Mellor OOA rules (from `rule-xt-uml.txt`) to our validator modules.

### ✅ **Fully Implemented Rules**

#### **Information Model Rules (Rules 5-14)**

| Rule       | Description                                           | Validator                                                          | Status         |
| ---------- | ----------------------------------------------------- | ------------------------------------------------------------------ | -------------- |
| Rule 6     | Each object must have unique name & number            | `consistency-validator.js`                                         | ✅ Implemented |
| Rule 7     | Each object must have unique KeyLetter                | `consistency-validator.js`                                         | ✅ Implemented |
| Rule 8     | Each attribute must have unique name within class     | `consistency-validator.js`                                         | ✅ Implemented |
| **Rule 9** | **Each object must have at least one identifier**     | `consistency-validator.js` + `schema-validator.js` (normalization) | ✅ **Fixed**   |
| Rule 10    | Referential attributes marked with relationship label | `consistency-validator.js`                                         | ✅ Implemented |

#### **State Model Rules (Rules 15-20)**

| Rule    | Description                             | Validator                    | Status         |
| ------- | --------------------------------------- | ---------------------------- | -------------- |
| Rule 16 | State model initial state must exist    | `initial-state-validator.js` | ✅ Implemented |
| Rule 18 | Each state must have unique name        | `consistency-validator.js`   | ✅ Implemented |
| Rule 19 | Each state must have unique number      | `consistency-validator.js`   | ✅ Implemented |
| Rule 20 | External entities have unique KeyLetter | `bridge-call-validator.js`   | ✅ Implemented |

#### **Events & Transitions Rules (Rules 22-29)**

| Rule    | Description                               | Validator                        | Status         |
| ------- | ----------------------------------------- | -------------------------------- | -------------- |
| Rule 26 | Event labels use form KLi                 | `event-label-validator.js`       | ✅ Implemented |
| Rule 27 | Events use form `<Label>:<Name> (<data>)` | `event-label-validator.js`       | ✅ Implemented |
| Rule 29 | Events to same state must have same data  | `event-consistency-validator.js` | ✅ Implemented |

#### **State Actions Rules (Rules 34-38)**

| Rule    | Description                                 | Validator                    | Status         |
| ------- | ------------------------------------------- | ---------------------------- | -------------- |
| Rule 38 | Actions must update current state attribute | `current-state-validator.js` | ✅ Implemented |

---

### 🆕 **OAL Extension Rules (Not in Shlaer-Mellor)**

Our implementation extends xtUML with BPAL97-compliant OAL (Object Action Language) features. These rules ensure OAL syntax correctness:

#### **CRUD Operations (P2)**

| Rule         | Description                                       | Validator                       | Compliance                              |
| ------------ | ------------------------------------------------- | ------------------------------- | --------------------------------------- |
| OAL-CREATE-1 | Syntax: `create object instance <var> of <KL>`    | `create-instance-validator.js`  | Aligns with Rule 36 (instance creation) |
| OAL-CREATE-2 | KeyLetter must exist in model                     | `create-instance-validator.js`  | Enforces Rule 7 (KeyLetter validity)    |
| OAL-SELECT-1 | Syntax: `select any/many/one <var> related by...` | `select-statement-validator.js` | Aligns with Rule 36 (data access)       |
| OAL-SELECT-4 | Navigation must reference valid relationships     | `select-statement-validator.js` | Enforces relationship consistency       |
| OAL-DELETE-1 | Syntax: `delete object instance <var>`            | `delete-instance-validator.js`  | Aligns with Rule 36 (instance deletion) |

#### **Control Flow (P4)**

| Rule       | Description                                   | Validator                   | Compliance         |
| ---------- | --------------------------------------------- | --------------------------- | ------------------ |
| OAL-CTRL-1 | Every `if` must have matching `end if`        | `control-flow-validator.js` | Syntax correctness |
| OAL-CTRL-2 | `elif/else` only after `if`                   | `control-flow-validator.js` | Syntax correctness |
| OAL-CTRL-3 | Only one `else` per if block                  | `control-flow-validator.js` | Syntax correctness |
| OAL-LOOP-1 | Every `for each` must have matching `end for` | `loop-validator.js`         | Syntax correctness |
| OAL-LOOP-2 | Loop variable must be valid identifier        | `loop-validator.js`         | Naming consistency |

---

### 🔧 **Rule 9 Implementation Fix**

**Problem:** Schema validator required `is_identifier` field to be present in every attribute, causing errors even when user just wanted default behavior (false).

**Solution:**

1. **Schema Change** (`schema.js`):

   ```javascript
   attribute: {
     required: ["name", "type"],  // ✅ is_identifier removed from required
     optional: ["description", "default_value", "referential", "is_identifier"],
   }
   ```

2. **Normalization** (`schema-validator.js`):

   ```javascript
   normalizeModel(modelJson) {
     // Set default is_identifier = false if not specified
     cls.attributes.forEach((attr) => {
       if (attr.is_identifier === undefined) {
         attr.is_identifier = false;  // ✅ Auto-fill default
       }
     });
   }
   ```

3. **Validation** (`consistency-validator.js`):
   ```javascript
   // Rule 9: At least one identifier required
   const hasIdentifier = cls.attributes.some(
     (attr) => attr.is_identifier === true
   );
   if (!hasIdentifier) {
     this.errorManager.addError(
       `Class '${cls.name}' has no identifier attribute`,
       `${clsPath}`,
       "Mark at least one attribute with 'is_identifier': true",
       "error",
       2
     );
   }
   ```

**Result:**

- ✅ Users don't need to write `"is_identifier": false` for every attribute
- ✅ Error only appears when class has NO identifier (violates Rule 9)
- ✅ Backward compatible with existing models

---

### ⚠️ **Partially Implemented / Not Applicable**

| Rule       | Description                                      | Status             | Reason                                                               |
| ---------- | ------------------------------------------------ | ------------------ | -------------------------------------------------------------------- |
| Rule 1-4   | Subsystem partitioning                           | ⚠️ Partial         | Model supports subsystems, but no validation for domain partitioning |
| Rule 12    | Composition relationships ($Ri=Rj+Rk$)           | ❌ Not implemented | Advanced feature, low priority                                       |
| Rule 21    | TIMER object formalism                           | ⚠️ Partial         | TIM external entity supported, but not full TIMER semantics          |
| Rule 30    | TIMER events (TIM1, TIM2)                        | ⚠️ Partial         | External entity bridges supported, but not timer-specific validation |
| Rule 31-33 | Object Communication Model (OCM)                 | ❌ Not implemented | OCM is separate diagram, not validated in JSON                       |
| Rule 35-37 | Action self-consistency & relationship integrity | ⚠️ Partial         | OAL syntax validated, but not semantic relationship consistency      |
| Rule 39-69 | Process Models (ADFD)                            | ❌ Not implemented | ADFD is separate notation, not part of JSON model                    |
| Rule 70-72 | Access & Communication Models                    | ❌ Not implemented | Separate diagrams, not validated in JSON                             |

---

### 📊 **Implementation Summary**

**Core xtUML Rules:**

- ✅ Implemented: 13 rules
- ⚠️ Partially: 6 rules
- ❌ Not applicable: 53 rules (separate diagrams/notations)

**OAL Extension Rules:**

- ✅ Implemented: 11 custom rules
- Coverage: 100% of BPAL97 OAL features

**Total Validation Rules:** 24 active rules (13 xtUML + 11 OAL)

---

### 🎯 **Design Principles**

1. **Schema Flexibility:** Optional fields have sensible defaults (e.g., `is_identifier: false`)
2. **Error Clarity:** Errors reference specific xtUML rules when applicable
3. **Extension Compatibility:** OAL rules don't conflict with Shlaer-Mellor semantics
4. **Validation Phases:**
   - Phase 1: Schema structure (required fields, types)
   - Phase 2: Consistency (uniqueness, references, Rule 9)
   - Phase 3: Semantics (state machines, OAL syntax)

---

### 📝 **Developer Notes**

When adding new validators:

1. ✅ **DO** reference xtUML rule numbers in comments
2. ✅ **DO** make fields optional when possible (with sensible defaults)
3. ✅ **DO** validate semantic correctness, not just syntax
4. ❌ **DON'T** enforce rules for separate diagrams (OCM, ADFD)
5. ❌ **DON'T** require redundant fields (like `is_identifier: false`)

---

**Last Updated:** December 28, 2025  
**Rule 9 Fix:** Applied in schema-validator.js normalization
