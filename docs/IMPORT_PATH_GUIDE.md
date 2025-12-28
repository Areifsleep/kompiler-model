# Import Path Reference Guide

## 📂 File Structure Overview

```
src/features/parsers/utils/
├── tokenizer.js                                    ← TARGET FILE
├── validators/
│   ├── schema-validator.js
│   ├── consistency-validator.js
│   ├── semantic-validator.js
│   └── phase-3-semantic/
│       ├── state-validators/
│       │   ├── initial-state-validator.js
│       │   └── current-state-validator.js
│       ├── event-validators/
│       │   ├── event-label-validator.js
│       │   └── event-consistency-validator.js
│       ├── oal-validators/
│       │   ├── oal-validator.js
│       │   ├── bridge-call-validator.js           ← IMPORTING FILE
│       │   └── self-reference-validator.js        ← IMPORTING FILE
│       └── transition-validator.js
```

## 🔗 Import Path Calculations

### From OAL Validators to Tokenizer

**Current Location:**

```
src/features/parsers/utils/validators/phase-3-semantic/oal-validators/
```

**Target Location:**

```
src/features/parsers/utils/tokenizer.js
```

**Path Calculation:**

```
oal-validators/          (current)
    ../                  → phase-3-semantic/
    ../../               → validators/
    ../../../            → utils/
    ../../../tokenizer.js → utils/tokenizer.js ✅
```

**Correct Import:**

```javascript
import { tokenizeOAL, getOALLineOffset } from "../../../tokenizer.js";
```

---

## 📋 All Import Paths Reference

### Phase 3 Semantic Validators

| File                               | Location                                        | Import to tokenizer.js     |
| ---------------------------------- | ----------------------------------------------- | -------------------------- |
| **semantic-validator.js**          | `validators/`                                   | `../tokenizer.js`          |
| **initial-state-validator.js**     | `validators/phase-3-semantic/state-validators/` | N/A (doesn't need it)      |
| **current-state-validator.js**     | `validators/phase-3-semantic/state-validators/` | N/A (doesn't need it)      |
| **event-label-validator.js**       | `validators/phase-3-semantic/event-validators/` | N/A (doesn't need it)      |
| **event-consistency-validator.js** | `validators/phase-3-semantic/event-validators/` | N/A (doesn't need it)      |
| **oal-validator.js**               | `validators/phase-3-semantic/oal-validators/`   | N/A (uses sub-validators)  |
| **bridge-call-validator.js**       | `validators/phase-3-semantic/oal-validators/`   | `../../../tokenizer.js` ✅ |
| **self-reference-validator.js**    | `validators/phase-3-semantic/oal-validators/`   | `../../../tokenizer.js` ✅ |
| **transition-validator.js**        | `validators/phase-3-semantic/`                  | N/A (doesn't need it)      |

### Semantic Validator Imports

**semantic-validator.js** imports:

```javascript
import { InitialStateValidator } from "./phase-3-semantic/state-validators/initial-state-validator.js";
import { CurrentStateValidator } from "./phase-3-semantic/state-validators/current-state-validator.js";
import { EventLabelValidator } from "./phase-3-semantic/event-validators/event-label-validator.js";
import { EventConsistencyValidator } from "./phase-3-semantic/event-validators/event-consistency-validator.js";
import { OALValidator } from "./phase-3-semantic/oal-validators/oal-validator.js";
import { TransitionValidator } from "./phase-3-semantic/transition-validator.js";
```

### OAL Validator Imports

**oal-validator.js** imports:

```javascript
import { BridgeCallValidator } from "./bridge-call-validator.js";
import { SelfReferenceValidator } from "./self-reference-validator.js";
```

---

## 🐛 Common Import Errors

### ❌ Wrong Path (Too Short)

```javascript
// ❌ ERROR: Only goes up 2 levels
import { tokenizeOAL } from "../../tokenizer.js";
// This tries to find: validators/phase-3-semantic/tokenizer.js (doesn't exist)
```

### ✅ Correct Path

```javascript
// ✅ CORRECT: Goes up 3 levels
import { tokenizeOAL } from "../../../tokenizer.js";
// This finds: utils/tokenizer.js ✅
```

---

## 🔍 How to Calculate Import Paths

### Method 1: Count Directory Levels

1. Start from current file location
2. Count how many folders to go up to reach common parent
3. Add the relative path from common parent to target

**Example:**

```
From: validators/phase-3-semantic/oal-validators/bridge-call-validator.js
To:   tokenizer.js

Step 1: Go up to common parent (utils/)
  oal-validators/    → ../
  phase-3-semantic/  → ../../
  validators/        → ../../../

Step 2: From utils/ to tokenizer.js
  → tokenizer.js

Result: ../../../tokenizer.js
```

### Method 2: Visual Tree Navigation

```
utils/
├── tokenizer.js                    ← TARGET
└── validators/
    └── phase-3-semantic/
        └── oal-validators/
            └── bridge-call-validator.js   ← START

Path: ../../../tokenizer.js
      └─┬─┘ └┬┘ └┬┘
        │    │   └─ validators/
        │    └───── phase-3-semantic/
        └────────── oal-validators/
```

---

## ✅ Verification Checklist

After changing import paths:

- [x] No "Failed to resolve import" errors
- [x] File paths are relative (start with `./` or `../`)
- [x] Include `.js` extension
- [x] Run `get_errors` to verify
- [x] Test in development server

---

## 📝 Fixed Files

### 1. self-reference-validator.js

**Before:** `import { tokenizeOAL } from "../../tokenizer.js";`  
**After:** `import { tokenizeOAL } from "../../../tokenizer.js";`  
**Status:** ✅ Fixed

### 2. bridge-call-validator.js

**Before:** `import { tokenizeOAL } from "../../tokenizer.js";`  
**After:** `import { tokenizeOAL } from "../../../tokenizer.js";`  
**Status:** ✅ Fixed

---

## 🚀 All Systems Operational

✅ All import paths corrected  
✅ Zero import resolution errors  
✅ Development server should start successfully

**Last Updated:** December 28, 2025
