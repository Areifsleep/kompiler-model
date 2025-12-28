# Architecture Diagram - Refactored Structure

## 📊 Parser Validators Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Parser Entry Point                          │
│                        (xtuml-validator.js)                         │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │   ErrorManager        │
                    │   (Shared Resource)   │
                    └───────────────────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
                ▼               ▼               ▼
    ┌──────────────────┐ ┌─────────────┐ ┌──────────────────┐
    │ SchemaValidator  │ │Consistency  │ │SemanticValidator │
    │   (Phase 1)      │ │Validator    │ │   (Phase 3)      │
    │                  │ │(Phase 2)    │ │  ORCHESTRATOR    │
    └──────────────────┘ └─────────────┘ └────────┬─────────┘
                                                   │
        ┌──────────────────────────────────────────┼────────────────────┐
        │                                          │                    │
        ▼                                          ▼                    ▼
┌───────────────────┐                    ┌──────────────────┐ ┌─────────────────┐
│ State Validators  │                    │ Event Validators │ │ OAL Validators  │
├───────────────────┤                    ├──────────────────┤ ├─────────────────┤
│ ✓ Initial State   │                    │ ✓ Event Label    │ │ ✓ OAL Validator │
│   (Rule 16)       │                    │   (Rule 26-27)   │ │   (Orchestrator)│
│                   │                    │                  │ │                 │
│ ✓ Current State   │                    │ ✓ Event          │ │ ✓ Bridge Call   │
│   (Rule 38)       │                    │   Consistency    │ │   (Rule 20-21)  │
│                   │                    │   (Rule 29)      │ │                 │
│                   │                    │                  │ │ ✓ Self Ref      │
└───────────────────┘                    └──────────────────┘ └─────────────────┘
        │
        └─────────────────────────────┐
                                      ▼
                              ┌──────────────────┐
                              │ Transition       │
                              │ Validator        │
                              └──────────────────┘
```

## 🔄 TypeScript Translator Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Translation Entry Point                          │
│                   (TypeScriptTranslator.translate)                   │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │  TypeScriptTranslator │
                    │     ORCHESTRATOR      │
                    └───────────┬───────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
┌───────────────┐      ┌────────────────┐     ┌────────────────┐
│  GENERATORS   │      │   ANALYZERS    │     │ TRANSFORMERS   │
├───────────────┤      ├────────────────┤     ├────────────────┤
│               │      │                │     │                │
│ ✓ Header      │      │ ✓ Class Order  │     │ ✓ Type Mapper  │
│   Generator   │      │   Analyzer     │     │                │
│               │      │                │     │ ✓ OAL          │
│ ✓ Runtime     │      │ ✓ External     │     │   Transformer  │
│   Shim        │      │   Entity       │     │                │
│   Generator   │      │   Detector     │     │                │
│               │      │                │     │                │
└───────┬───────┘      └────────┬───────┘     └────────┬───────┘
        │                       │                      │
        │                       │                      │
        └───────────────────────┼──────────────────────┘
                                ▼
                    ┌───────────────────────┐
                    │   Generated TypeScript│
                    │   Code Output         │
                    └───────────────────────┘
```

## 🔁 Data Flow - Validation

```
JSON Model Input
      │
      ▼
┌─────────────┐
│   Parse     │  Phase 1: Schema Validation
│   JSON      │  ➜ Structure Check
└──────┬──────┘  ➜ Type Check
       │          ➜ Required Fields
       ▼
┌─────────────┐
│  Build      │  Phase 2: Consistency Validation
│  References │  ➜ Unique Names
└──────┬──────┘  ➜ Cross References
       │          ➜ Type Matching
       ▼
┌─────────────┐
│  Semantic   │  Phase 3: Semantic Validation
│  Validation │  ├─ State Validators
└──────┬──────┘  ├─ Event Validators
       │          ├─ OAL Validators
       │          └─ Transition Validator
       ▼
┌─────────────┐
│  Validation │
│  Result     │  ➜ Errors
└─────────────┘  ➜ Warnings
                 ➜ isValid
```

## 🔁 Data Flow - Translation

```
JSON Model Input
      │
      ▼
┌─────────────┐
│   Parse     │  ➜ Classes Map
│   Model     │  ➜ Relationships Map
└──────┬──────┘  ➜ External Entities Map
       │
       ├──────────────────────────────────┐
       │                                  │
       ▼                                  ▼
┌─────────────┐                  ┌─────────────┐
│  Analyze    │                  │  Detect     │
│  Class      │                  │  Used EEs   │
│  Order      │                  │             │
└──────┬──────┘                  └──────┬──────┘
       │                                │
       ▼                                ▼
┌─────────────┐                  ┌─────────────┐
│  Generate   │                  │  Generate   │
│  Header     │                  │  Runtime    │
│             │                  │  Shims      │
└──────┬──────┘                  └──────┬──────┘
       │                                │
       └────────────┬───────────────────┘
                    │
                    ▼
            ┌───────────────┐
            │  Generate     │
            │  Types        │
            └────────┬──────┘
                     │
                     ▼
            ┌───────────────┐
            │  Generate     │  For each class in order:
            │  Classes      │  ├─ Attributes
            └────────┬──────┘  ├─ Constructor
                     │          ├─ Getters/Setters
                     ▼          ├─ Navigation Methods
            ┌───────────────┐  └─ State Machine Methods
            │  Transform    │      └─ Transform OAL
            │  OAL Code     │
            └────────┬──────┘
                     │
                     ▼
            ┌───────────────┐
            │  TypeScript   │
            │  Code Output  │
            └───────────────┘
```

## 📦 Module Dependencies

### Parser Validators Dependencies

```
SemanticValidator (main)
  │
  ├─► InitialStateValidator
  │     └─► ErrorManager
  │
  ├─► CurrentStateValidator
  │     └─► ErrorManager
  │
  ├─► EventLabelValidator
  │     └─► ErrorManager
  │
  ├─► EventConsistencyValidator
  │     └─► ErrorManager
  │
  ├─► OALValidator
  │     ├─► ErrorManager
  │     ├─► BridgeCallValidator
  │     │     ├─► ErrorManager
  │     │     └─► tokenizer.js
  │     └─► SelfReferenceValidator
  │           ├─► ErrorManager
  │           └─► tokenizer.js
  │
  └─► TransitionValidator
        └─► ErrorManager
```

### TypeScript Translator Dependencies

```
TypeScriptTranslator (main)
  │
  ├─► HeaderGenerator
  │
  ├─► RuntimeShimGenerator
  │     └─► TypeMapper
  │
  ├─► TypeMapper
  │
  ├─► OALTransformer
  │
  ├─► ClassOrderAnalyzer
  │
  └─► ExternalEntityDetector
```

## 🎯 Responsibilities Matrix

| Component                     | Input                       | Output   | Side Effects |
| ----------------------------- | --------------------------- | -------- | ------------ |
| **InitialStateValidator**     | StateModel, Path            | void     | Adds errors  |
| **CurrentStateValidator**     | StateModel, Path            | void     | Adds errors  |
| **EventLabelValidator**       | StateModel, KeyLetter, Path | void     | Adds errors  |
| **EventConsistencyValidator** | StateModel, Path            | void     | Adds errors  |
| **BridgeCallValidator**       | OAL, Path, ExternalEntities | void     | Adds errors  |
| **SelfReferenceValidator**    | OAL, Path                   | void     | Adds errors  |
| **TransitionValidator**       | StateModel, Path            | void     | Adds errors  |
| **HeaderGenerator**           | Model                       | string   | None         |
| **RuntimeShimGenerator**      | EEs, UsedEEs, TypeMapper    | string   | None         |
| **TypeMapper**                | Type, Class                 | string   | None         |
| **OALTransformer**            | OAL, ExternalEntities       | string   | May throw    |
| **ClassOrderAnalyzer**        | Classes, Relationships      | string[] | None         |
| **ExternalEntityDetector**    | Classes, ExternalEntities   | Set      | None         |

## 📝 File Size Comparison

### Validators

```
Before:                          After:
semantic-validator.js           semantic-validator.js
        337 lines                      47 lines
                                       ↓
                        ┌──────────────┴──────────────┐
                        │                             │
            initial-state-validator.js    current-state-validator.js
                    28 lines                     45 lines
                        │                             │
            event-label-validator.js      event-consistency-validator.js
                    55 lines                     65 lines
                        │                             │
            oal-validator.js              bridge-call-validator.js
                    29 lines                     82 lines
                        │                             │
            self-reference-validator.js   transition-validator.js
                    38 lines                     55 lines
```

### Translator

```
Before:                          After:
typescript-translator.js        typescript-translator.js
        968 lines                     ~780 lines
                                       ↓
                        ┌──────────────┴──────────────┐
                        │                             │
            header-generator.js           runtime-shim-generator.js
                    18 lines                      145 lines
                        │                             │
            type-mapper.js                oal-transformer.js
                    57 lines                      80 lines
                        │                             │
            class-order-analyzer.js       external-entity-detector.js
                    62 lines                      37 lines
```

---

**Legend:**

- 📊 Main Architecture
- 🔄 Data Flow
- 📦 Dependencies
- 🎯 Responsibilities
- 📝 Metrics
