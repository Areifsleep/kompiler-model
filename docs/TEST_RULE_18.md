# Test Case: Rule 18 - Duplicate State Names

## Test Purpose

Verify that the parser correctly detects duplicate state names within a state model (Rule 18).

## Test Model

```json
{
  "system_model": {
    "system_name": "Test Duplicate State Names",
    "version": "1.0",
    "subsystems": [
      {
        "name": "Test Subsystem",
        "prefix": "TST",
        "classes": [
          {
            "name": "Mahasiswa",
            "key_letter": "MHS",
            "class_number": 1,
            "attributes": [
              { "name": "MHS_ID", "type": "unique_ID", "is_identifier": true },
              { "name": "Current_State", "type": "state<MHS>", "is_identifier": false }
            ],
            "state_model": {
              "lifecycle_type": "Instance",
              "initial_state": "Aktif",
              "states": [
                {
                  "name": "Aktif",
                  "state_number": 1,
                  "action_oal": "self.Current_State = \"Aktif\";"
                },
                {
                  "name": "Aktif",
                  "state_number": 55,
                  "action_oal": "self.Current_State = \"Aktif\";"
                },
                {
                  "name": "Cuti",
                  "state_number": 3,
                  "action_oal": "self.Current_State = \"Cuti\";"
                }
              ],
              "events": [{ "label": "MHS1", "meaning": "Ajukan Cuti", "parameters": [] }],
              "transitions": [{ "from_state": "Aktif", "event": "MHS1", "to_state": "Cuti" }]
            }
          }
        ]
      }
    ]
  }
}
```

## Expected Error

```
Severity: error
Message: Duplicate state name 'Aktif' (first defined at states[0])
Path: $.system_model.subsystems[0].classes[0].state_model.states[1].name
Fix: Use unique state names within each state model
Phase: 2
```

## Implementation

File: `consistency-validator.js`

```javascript
// Rule 18 & 19: Each state must have unique name and number
if (stateModel.states && Array.isArray(stateModel.states)) {
  const stateNames = new Map();
  const stateNumbers = new Map();

  stateModel.states.forEach((state, stateIdx) => {
    // Rule 18: Check state name uniqueness
    if (state.name) {
      if (stateNames.has(state.name)) {
        const firstIdx = stateNames.get(state.name);
        this.errorManager.addError(
          `Duplicate state name '${state.name}' (first defined at states[${firstIdx}])`,
          `${smPath}.states[${stateIdx}].name`,
          "Use unique state names within each state model",
          "error",
          2
        );
      } else {
        stateNames.set(state.name, stateIdx);
      }
    }

    // Rule 19: Check state number uniqueness
    if (state.state_number !== undefined) {
      if (stateNumbers.has(state.state_number)) {
        const firstState = stateNumbers.get(state.state_number);
        this.errorManager.addError(
          `Duplicate state number ${state.state_number} (first used by '${firstState}')`,
          `${smPath}.states[${stateIdx}].state_number`,
          "Assign unique state numbers (1, 2, 3, ...)",
          "error",
          2
        );
      } else {
        stateNumbers.set(state.state_number, state.name);
      }
    }
  });
}
```

## How to Test

```javascript
import { XtUMLParser } from "./src/features/parsers/utils/xtuml-validator.js";
import fs from "fs";

const model = JSON.parse(fs.readFileSync("./test-duplicate-state-names.json", "utf8"));
const parser = new XtUMLParser();
const errors = parser.parse(model);

// Should have at least 1 error for duplicate state name
console.assert(errors.length > 0, "Rule 18 should detect duplicate state names");
console.assert(
  errors.some((e) => e.message.includes("Duplicate state name")),
  "Error message should mention duplicate state name"
);
```

## Edge Cases Tested

### 1. Same Name, Different Number

```json
{
  "states": [
    { "name": "Aktif", "state_number": 1 },
    { "name": "Aktif", "state_number": 2 } // ❌ Error: duplicate name
  ]
}
```

### 2. Different Name, Same Number

```json
{
  "states": [
    { "name": "Aktif", "state_number": 1 },
    { "name": "Cuti", "state_number": 1 } // ❌ Error: duplicate number (Rule 19)
  ]
}
```

### 3. Multiple Duplicates

```json
{
  "states": [
    { "name": "Aktif", "state_number": 1 },
    { "name": "Aktif", "state_number": 2 }, // ❌ Duplicate name
    { "name": "Aktif", "state_number": 3 } // ❌ Duplicate name
  ]
}
```

### 4. Valid States

```json
{
  "states": [
    { "name": "Aktif", "state_number": 1 },
    { "name": "Cuti", "state_number": 2 },
    { "name": "Lulus", "state_number": 3 } // ✅ All unique
  ]
}
```

## Why This Rule is Important

### Problem Without Rule 18:

If two states have the same name, it creates ambiguity:

- Which "Aktif" state should transitions target?
- Which "Aktif" state is the initial_state?
- Event handlers can't distinguish between states

### Example of Confusion:

```json
{
  "states": [
    { "name": "Aktif", "state_number": 1 },
    { "name": "Aktif", "state_number": 2 }
  ],
  "initial_state": "Aktif", // Which one?
  "transitions": [
    { "from_state": "Cuti", "event": "MHS2", "to_state": "Aktif" } // Which one?
  ]
}
```

## Test Status

✅ **FIXED** - Rule 18 now correctly detects duplicate state names

## Related Rules

- Rule 17: Unique state model KeyLetters
- Rule 19: Unique state numbers
- Initial state validation (must reference unique state name)
- Transition validation (must reference unique state names)
