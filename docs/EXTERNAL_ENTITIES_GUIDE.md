# External Entities Implementation Guide

## Overview

This document describes the implementation of **External Entities** support in the xTUML to TypeScript compiler, following **Shlaer-Mellor Rule 20** and **Rule 21**.

## What are External Entities?

External Entities (EEs) are interfaces to the outside world in xtUML models. They represent:

- **System services** (logging, timing, file I/O)
- **Hardware interfaces** (sensors, actuators)
- **External libraries** (math functions, encryption)

According to **Shlaer-Mellor Rule 20**: _"External Entities must be defined with KeyLetters and Bridge operations"_

## Architecture

### 1. Model Definition (JSON)

External Entities are defined in the `external_entities` array within each subsystem:

```json
{
  "subsystems": [
    {
      "external_entities": [
        {
          "name": "Logging",
          "key_letter": "LOG",
          "description": "External Entity for logging operations",
          "bridges": [
            {
              "name": "LogInfo",
              "description": "Log informational message",
              "parameters": [{ "name": "message", "type": "string" }]
            }
          ]
        }
      ]
    }
  ]
}
```

### 2. Compiler Processing

The TypeScriptTranslator processes External Entities in 4 phases:

#### Phase 1: Parsing

```javascript
parseModel() {
  subsystem.external_entities.forEach((ee) => {
    this.externalEntities.set(ee.key_letter, ee);
  });
}
```

#### Phase 2: Usage Detection (Optimization)

```javascript
detectUsedExternalEntities() {
  // Scan all OAL code to find which External Entities are actually used
  // Only used EEs will be included in output
}
```

**Key Feature**: Runtime shims are only generated for External Entities that are actually called in the model's OAL code. This keeps the output clean and efficient.

Example:

- If model defines LOG and TIM but only uses LOG → Only LOG class is generated
- If no bridge calls exist → No runtime library section at all

#### Phase 3: Runtime Library Generation

```javascript
generateRuntimeShims() {
  // Only generates implementation for used External Entities
  this.usedExternalEntities.forEach(keyLetter => {
    // Generate class implementation
  });
}
```

#### Phase 4: OAL Transformation

```javascript
transformOAL(oal) {
  // Transforms: LOG::LogInfo(message:"text")
  // Into: LOG.LogInfo({ message:"text" })
  // With validation against defined external entities
}
```

### 3. Validation

The SemanticValidator enforces Rule 20:

- **Unknown External Entity**: Error if `KEY::Method` references undefined EE
- **Unknown Bridge**: Error if bridge method not defined for that EE
- **Format Validation**: KeyLetter must be UPPERCASE before `::`

## Supported External Entities

### LOG - Logging External Entity

**KeyLetter**: `LOG`  
**Rule**: Shlaer-Mellor Rule 20

**Bridges**:

- `LogInfo(message: string)` - Log informational message
- `LogError(message: string)` - Log error message
- `LogWarning(message: string)` - Log warning message

**Usage in OAL**:

```oal
// Entry Action for State
LOG::LogInfo(message: "Student status changed to Active");
```

**Generated TypeScript**:

```typescript
class LOG {
  static LogInfo(params: { message: string }): void {
    console.log(`[INFO]: ${params.message}`);
  }
}
```

### TIM - Timer External Entity

**KeyLetter**: `TIM`  
**Rule**: Shlaer-Mellor Rule 21 (TIM keyletter reserved)

**Bridges**:

- `timer_start(microseconds: integer, event_inst: event_instance): integer` - Start timer
- `timer_cancel(timer_id: integer): boolean` - Cancel timer
- `timer_remaining_time(timer_id: integer): integer` - Get remaining time

**Usage in OAL**:

```oal
// Start a 5-second timer
timer_id = TIM::timer_start(microseconds: 5000000, event_inst: self);
```

**Generated TypeScript**:

```typescript
class TIM {
  static timer_start(params: {
    microseconds: number;
    event_inst: any;
  }): number {
    console.log(`[TIM]: Timer started for ${params.microseconds}μs`);
    const timerId = setTimeout(() => {
      console.log("[TIM]: Timer expired, generating event");
      // Event generation logic
    }, params.microseconds / 1000);
    return timerId as unknown as number;
  }
}
```

## Adding New External Entities

### Step 1: Define in JSON Model

```json
{
  "name": "FileSystem",
  "key_letter": "FS",
  "description": "External Entity for file operations",
  "bridges": [
    {
      "name": "ReadFile",
      "description": "Read file contents",
      "parameters": [{ "name": "path", "type": "string" }],
      "return_type": "string"
    },
    {
      "name": "WriteFile",
      "description": "Write content to file",
      "parameters": [
        { "name": "path", "type": "string" },
        { "name": "content", "type": "string" }
      ],
      "return_type": "boolean"
    }
  ]
}
```

### Step 2: Implement in TypeScriptTranslator

Add implementation logic in `generateRuntimeShims()`:

```javascript
if (ee.key_letter === "FS") {
  if (bridge.name === "ReadFile") {
    code += `    return ""; // File reading implementation\n`;
  } else if (bridge.name === "WriteFile") {
    code += `    return true; // File writing implementation\n`;
  }
}
```

### Step 3: Use in OAL

```oal
// In state action
content = FS::ReadFile(path: "/data/config.txt");
LOG::LogInfo(message: "File content: " + content);
```

## Error Messages

### Unknown External Entity

```
Unknown External Entity: 'XYZ' (Rule 20 Shlaer-Mellor violation)
Location: $.system_model.subsystems[0].classes[1].state_model.states[0].action_oal [line ~3]
Fix: Available External Entities: LOG, TIM
```

### Unknown Bridge Method

```
Unknown bridge method: 'LOG::InvalidMethod'
Location: $.system_model.subsystems[0].classes[1].state_model.states[0].action_oal [line ~5]
Fix: Available bridges for LOG: LogInfo, LogError, LogWarning
```

### Format Error

```
Bridge call format error: KeyLetter before '::' must be UPPERCASE
Location: $.system_model.subsystems[0].classes[1].state_model.states[0].action_oal [line ~2]
Fix: Use UPPERCASE keyletter for External Entity (e.g., LOG, TIM, MATH)
```

## Output Structure

Generated TypeScript file structure:

```typescript
// ============================================================================
// Generated TypeScript Code
// ============================================================================

// ============================================================================
// RUNTIME STANDARD LIBRARY
// External Entities Implementation (Shlaer-Mellor Rule 20)
// ============================================================================

class LOG {
  /* ... */
}
class TIM {
  /* ... */
}

// ============================================================================
// Type Definitions
// ============================================================================

type UniqueID = string;
// ...

// ============================================================================
// Class Definitions
// ============================================================================

class Person {
  /* ... */
}
class Mahasiswa extends Person {
  ajukanCuti(params: MHS1EventParams): void {
    if (this.Current_State === "Aktif") {
      LOG.LogInfo({ message: "Mahasiswa cuti: " + params.alasan });
      this.Current_State = "Cuti";
    }
  }
}
```

## Benefits

✅ **Type Safety**: Bridge parameters are type-checked  
✅ **Modularity**: Easy to add new External Entities  
✅ **Compliance**: Follows Shlaer-Mellor rules  
✅ **Validation**: Parser catches invalid bridge calls  
✅ **Testability**: External Entities can be mocked  
✅ **Documentation**: Auto-generated JSDoc comments  
✅ **Optimization**: Only used External Entities are included in output  
✅ **Clean Code**: No unused runtime library bloat

## References

- **Shlaer-Mellor Rule 20**: External Entities and Bridge operations
- **Shlaer-Mellor Rule 21**: TIM keyletter reservation
- **xtUML Specification**: Object Action Language (OAL) syntax

---

_Last Updated: December 2025_
