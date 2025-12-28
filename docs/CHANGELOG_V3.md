# xTUML Compiler - Version 3.0

## 🚀 Major Refactoring: External Entities Support

### What's New in Version 3.0?

This release represents a **major architectural upgrade** to the xTUML to TypeScript compiler, making it **generic**, **modular**, and fully **Shlaer-Mellor compliant**.

### ✨ Key Features

#### 1. External Entities Support (Rule 20 & 21)

The compiler now supports **External Entities** - interfaces to the outside world defined in the xtUML model.

**Before:**

```typescript
// Bridge calls were hardcoded magic strings
LOG::LogInfo(message: "...") // ❌ No validation, hardcoded
```

**After:**

```typescript
// Bridge calls are validated against JSON definitions
// Auto-generates type-safe implementations
class LOG {
  static LogInfo(params: { message: string }): void {
    console.log(`[INFO]: ${params.message}`);
  }
}
```

#### 2. Smart Code Generation

**Conditional Runtime Library**: Only generates code for External Entities that are actually used in the model.

- Model defines LOG + TIM but only uses LOG → Only LOG class generated ✅
- No bridge calls in model → No runtime library section at all ✅
- Keeps output clean and efficient 🎯

#### 3. Comprehensive Validation

**Semantic Validator** enforces Shlaer-Mellor rules:

```javascript
// ❌ Error: Unknown External Entity
XYZ::Method(...)
// "Unknown External Entity: 'XYZ' (Rule 20 violation)"

// ❌ Error: Unknown Bridge Method
LOG::InvalidMethod(...)
// "Unknown bridge method: 'LOG::InvalidMethod'"
// "Available bridges for LOG: LogInfo, LogError, LogWarning"

// ✅ Valid: Defined in JSON and used correctly
LOG::LogInfo(message: "Student activated")
```

#### 4. Extensible Architecture

Adding new External Entities is now trivial:

1. **Define in JSON**:

```json
{
  "name": "FileSystem",
  "key_letter": "FS",
  "bridges": [
    { "name": "ReadFile", "parameters": [...] }
  ]
}
```

2. **Use in OAL**:

```oal
content = FS::ReadFile(path: "/config.txt");
```

3. **Auto-generated**:

```typescript
class FS {
  static ReadFile(params: { path: string }): string {
    // Implementation
  }
}
```

### 📊 Statistics

| Metric              | v2.0 | v3.0                      |
| ------------------- | ---- | ------------------------- |
| Shlaer-Mellor Rules | 18   | **20**                    |
| External Entities   | 0    | **2** (LOG, TIM)          |
| Bridge Methods      | 0    | **6**                     |
| Validation Phases   | 3    | **4** (+Usage Detection)  |
| Code Optimization   | ❌   | ✅ Conditional generation |

### 🎯 Architecture Principles

1. **Generic**: No hardcoded External Entities
2. **Modular**: Clean separation of concerns
3. **Compliant**: Follows Shlaer-Mellor standards
4. **Optimized**: Only generates what's needed
5. **Type-Safe**: Full TypeScript typing
6. **Validated**: Comprehensive error checking

### 📦 What's Included

#### Standard External Entities

**LOG - Logging Service**

- `LogInfo(message: string)`
- `LogError(message: string)`
- `LogWarning(message: string)`

**TIM - Timer Service** (Rule 21)

- `timer_start(microseconds: integer, event_inst: event_instance): integer`
- `timer_cancel(timer_id: integer): boolean`
- `timer_remaining_time(timer_id: integer): integer`

### 🔧 Usage Example

**1. Define Model** (`model-lengkap(2).json`):

```json
{
  "external_entities": [
    {
      "name": "Logging",
      "key_letter": "LOG",
      "bridges": [...]
    }
  ],
  "classes": [
    {
      "name": "Mahasiswa",
      "state_model": {
        "states": [
          {
            "name": "Cuti",
            "action_oal": "LOG::LogInfo(message: \"Mahasiswa cuti\");"
          }
        ]
      }
    }
  ]
}
```

**2. Validate** (Parsing Page):

- Upload JSON
- Click "Parse JSON"
- ✅ No errors - LOG is defined and used correctly

**3. Generate** (Translation Page):

```typescript
// Runtime Library (auto-generated)
class LOG {
  static LogInfo(params: { message: string }): void {
    console.log(`[INFO]: ${params.message}`);
  }
}

// Class with transformed OAL
class Mahasiswa {
  ajukanCuti(): void {
    LOG.LogInfo({ message: "Mahasiswa cuti" }); // ← Transformed!
  }
}
```

### 📚 Documentation

- **[External Entities Guide](docs/EXTERNAL_ENTITIES_GUIDE.md)** - Comprehensive guide
- **[Rule Implementation](docs/RULE_PARSING_YANG_TELAH_DIIMPLEMENTASIKAN.md)** - Rule 20 & 21 details
- **[Model Example](<models/model-lengkap(2).json>)** - Complete example

### 🛠️ Technical Details

**Files Modified:**

- `models/model-lengkap(2).json` - Added external_entities definition
- `src/features/translations/utils/typescript-translator.js` - Runtime shims generation
- `src/features/parsers/utils/validators/semantic-validator.js` - Bridge call validation

**New Features:**

- `detectUsedExternalEntities()` - Scans OAL to find used EEs
- `generateRuntimeShims()` - Conditional code generation
- `transformOAL()` - Bridge call transformation with validation

### 🎉 Migration Guide

**From v2.0 to v3.0:**

1. Add `external_entities` array to your model JSON
2. Define LOG and TIM if you use bridge calls
3. Re-run parser - bridge calls will be validated
4. Re-generate TypeScript - runtime library included automatically

**No breaking changes** - models without external_entities still work!

### 🔮 Future Enhancements

- [ ] Custom External Entity implementations
- [ ] External Entity mocking for testing
- [ ] Additional standard External Entities (MATH, FS, NET)
- [ ] Bridge call parameter validation
- [ ] Return type validation

---

**Version**: 3.0.0  
**Release Date**: December 28, 2025  
**Breaking Changes**: None  
**New Rules**: Rule 20, Rule 21  
**Status**: Production Ready ✅
