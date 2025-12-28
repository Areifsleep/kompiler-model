# 📚 Dokumentasi Lengkap Compiler Model XT-UML

## 🎯 Overview

Compiler Model XT-UML adalah compiler yang mentransformasi model JSON berbasis Shlaer-Mellor/XT-UML menjadi kode TypeScript yang executable. Compiler ini mengimplementasikan **full pipeline** dari parsing, validation, hingga code generation.

**Version**: 4.1.0  
**Date**: 28 Desember 2025  
**Language**: JavaScript (ES6+) / TypeScript Output

---

## 🔄 Alur Lengkap Compiler (Pipeline)

```
┌─────────────────────────────────────────────────────────────────┐
│                    INPUT: JSON Model File                        │
│              (Shlaer-Mellor/XT-UML Specification)               │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                  PHASE 1: LEXICAL ANALYSIS                       │
│                    (Schema Validation)                           │
├─────────────────────────────────────────────────────────────────┤
│  • JSON Structure Validation                                     │
│  • Required Fields Check                                         │
│  • Data Type Validation                                          │
│  • Unknown Fields Detection                                      │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                PHASE 2: SYNTACTIC ANALYSIS                       │
│                  (Consistency Validation)                        │
├─────────────────────────────────────────────────────────────────┤
│  • Uniqueness Constraints (Names, KeyLetters, IDs)              │
│  • Referential Integrity (Relationships)                         │
│  • Type Matching (Referential Attributes)                        │
│  • Composition Validation                                        │
│  • State Model Structure                                         │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                 PHASE 3: SEMANTIC ANALYSIS                       │
│                    (OAL & Logic Validation)                      │
├─────────────────────────────────────────────────────────────────┤
│  • OAL Syntax Validation                                         │
│  • Bridge Call Validation (External Entities)                    │
│  • State Transition Validation                                   │
│  • Event Format & Consistency                                    │
│  • Relationship Navigation Validation                            │
│  • Self-Reference Validation                                     │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│              PHASE 4: INTERMEDIATE REPRESENTATION                │
│                    (Model Parsing & Mapping)                     │
├─────────────────────────────────────────────────────────────────┤
│  • Build Class Hierarchy                                         │
│  • Map Relationships (Simple, Associative, Subtype)             │
│  • Extract State Machines                                        │
│  • Collect External Entities                                     │
│  • Type Mapping (XT-UML → TypeScript)                           │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                PHASE 5: OAL TRANSFORMATION                       │
│              (Action Language Processing)                        │
├─────────────────────────────────────────────────────────────────┤
│  • Bridge Calls:     KEY::Method → KEY.Method({...})            │
│  • Create Instance:  create object instance → {} as Type        │
│  • Select Queries:   select one/many → getRelated() / filter()  │
│  • Delete Instance:  delete object instance → (runtime)         │
│  • Relate/Unrelate:  relate/unrelate → setRelated()             │
│  • Conditionals:     if/elif/else → if/else if/else             │
│  • Loops:            for each → for (const x of array)          │
│  • Self Keyword:     self → this                                │
│  • Event Params:     param.x → params.x                         │
│  • Variable Decl:    varname = → let varname =                  │
│  • Operators:        AND/OR/NOT → &&/||/!                       │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                  PHASE 6: CODE GENERATION                        │
│                   (TypeScript Output)                            │
├─────────────────────────────────────────────────────────────────┤
│  1. Runtime Library (External Entities)                          │
│  2. Type Definitions (Custom Types, State Types)                │
│  3. Event Parameter Interfaces                                   │
│  4. Class Definitions (Attributes, Constructor)                  │
│  5. Getters & Setters                                            │
│  6. Navigation Methods (Relationship Traversal)                  │
│  7. State Methods (Event Handlers with OAL)                      │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                OUTPUT: TypeScript Code (.ts)                     │
│                   (Executable Classes)                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 PHASE 1: LEXICAL ANALYSIS (Schema Validation)

**File**: `src/features/parsers/utils/validators/schema-validator.js`

### ✅ Fitur yang Diimplementasikan:

#### 1. **JSON Structure Validation**

- Memvalidasi bahwa input adalah valid JSON
- Memastikan struktur dasar model ada (`system_model`, `subsystems`)

#### 2. **Required Fields Check**

- Setiap subsystem harus punya `name`, `prefix`
- Setiap class harus punya `name`, `key_letter`, `class_number`
- Setiap attribute harus punya `name`, `type`
- Setiap relationship harus punya `label`, `type`

#### 3. **Data Type Validation**

- `name` harus string
- `class_number` harus integer
- `is_identifier` harus boolean
- `attributes` harus array
- `state_model` harus object

#### 4. **Unknown Fields Detection**

- Mendeteksi field yang tidak dikenal dalam schema
- Memberikan warning untuk typo atau field yang salah

### 📊 Contoh Output:

```
❌ [PHASE 1 - Schema] Missing required field 'name' at $.system_model.subsystems[0].classes[1]
⚠️  [PHASE 1 - Schema] Unknown field 'clazz_number' (did you mean 'class_number'?)
```

---

## 📋 PHASE 2: SYNTACTIC ANALYSIS (Consistency Validation)

**File**: `src/features/parsers/utils/validators/consistency-validator.js`

### ✅ Fitur yang Diimplementasikan:

#### 1. **Unique Subsystem Names (Rule 2)**

```javascript
validateUniqueSubsystemNames() {
  // Memastikan tidak ada subsystem dengan nama sama
}
```

**Error Example:**

```
Duplicate subsystem name 'Manajemen Akademik' at subsystems[1]
Fix: Use unique subsystem names
```

#### 2. **Unique Class Names & Numbers (Rule 6)**

```javascript
validateUniqueClasses() {
  // Validasi: nama class unik per subsystem
  // Validasi: class_number unik per subsystem
}
```

#### 3. **Unique KeyLetters (Rule 7)**

```javascript
validateUniqueKeyLetters() {
  // KeyLetter harus unik di seluruh model
  // Format: 3-4 huruf kapital (MHS, DSN, PRS)
}
```

**Error Example:**

```
Duplicate KeyLetter 'MHS' found in class 'MahasiswaBaru'
Fix: Use unique KeyLetters (e.g., MHSB for MahasiswaBaru)
```

#### 4. **Unique Attribute Names (Rule 8)**

```javascript
validateUniqueAttributes() {
  // Attribute names harus unik dalam satu class
}
```

**Error Example:**

```
Duplicate attribute name 'SKS' in class 'MataKuliah' (first defined at attributes[3])
Fix: Use unique attribute names within each class
```

#### 5. **At Least One Identifier (Rule 9)**

```javascript
validateIdentifiers() {
  // Setiap class harus punya minimal 1 identifier
  // Identifier ditandai: "is_identifier": true
}
```

**Error Example:**

```
Class 'Mahasiswa' has no identifier attribute
Fix: Mark at least one attribute with 'is_identifier': true
```

#### 6. **Referential Attributes (Rule 10)**

```javascript
validateReferentialAttributes() {
  // Referential attribute harus punya relationship label
  // Format: "referential": "R1"
}
```

#### 7. **Domain Type Matching (Rule 11)**

```javascript
validateReferentialTypeMatching() {
  // Tipe referential attribute = tipe attribute yang direferensikan
  // Contoh: Person_ID (unique_ID) → Person.Person_ID (unique_ID)
}
```

**Error Example:**

```
Referential attribute 'Person_ID' type 'string' doesn't match referenced attribute type 'unique_ID'
Fix: Change type to 'unique_ID' to match referenced attribute
```

#### 8. **Relationship Composition (Rule 12)**

```javascript
validateRelationshipComposition() {
  // Relationship yang di-compose harus exist
  // Format: "composition": "R1+R2"
}
```

#### 9. **Relationship Consistency**

```javascript
validateRelationshipReferences() {
  // KeyLetter dalam relationship harus exist
  // - Subtype: superclass, subclasses[]
  // - Associative: one_side, other_side, association_class
  // - Simple: one_side, other_side
}
```

**Error Example:**

```
Relationship 'R1' references unknown class 'DEPT'
Available classes: MHS, DSN, MK, PRS
Fix: Use valid KeyLetters from defined classes
```

#### 10. **Unique Relationship Labels (Rule 9 Extension)**

```javascript
validateUniqueRelationshipLabels() {
  // Label relationship harus unik (R1, R2, R3)
  // Label tidak boleh kosong atau whitespace
}
```

#### 11. **Unique State Names (Rule 18)**

```javascript
validateUniqueStateNames() {
  // State names harus unik dalam satu state model
}
```

#### 12. **Unique State Numbers (Rule 19)**

```javascript
validateUniqueStateNumbers() {
  // State numbers harus unik (1, 2, 3, ...)
}
```

#### 13. **Current_State Attribute (Rule 38 Part 1)**

```javascript
validateCurrentStateAttribute() {
  // Class dengan state model HARUS punya attribute Current_State
  // Tipe: state<KeyLetter> (contoh: state<MHS>)
}
```

**Error Example:**

```
Class 'Mahasiswa' has state model but missing 'Current_State' attribute
Fix: Add attribute: { "name": "Current_State", "type": "state<MHS>" }
```

---

## 📋 PHASE 3: SEMANTIC ANALYSIS (OAL & Logic Validation)

**Files**:

- `src/features/parsers/utils/validators/semantic-validator.js`
- `src/features/parsers/utils/validators/phase-3-semantic/oal-validators/*.js`

### ✅ Fitur yang Diimplementasikan:

#### 1. **Initial State Validation**

```javascript
validateInitialState() {
  // Initial state harus ada dalam daftar states
}
```

#### 2. **Event Format Validation (Rule 26, 27)**

**File**: `event-validator.js`

```javascript
validateEventFormat() {
  // Label format: <KeyLetter><Number> (MHS1, MHS2)
  // Harus punya 'meaning' atau 'description'
  // Parameters harus array
}
```

**Error Example:**

```
Event label 'ajukanCuti' doesn't follow format 'MHS<number>'
Fix: Use format: MHS1, MHS2, MHS3, etc.
```

#### 3. **Event Data Consistency (Rule 29)**

```javascript
validateEventDataConsistency() {
  // Event yang transisi ke state sama harus punya parameter identik
}
```

**Error Example:**

```
Event 'MHS2' parameters differ from 'MHS1' but both transition to state 'Aktif'
Fix: All events transitioning to the same state must have identical parameter structure
```

#### 4. **Transition Validation**

```javascript
validateTransitions() {
  // from_state harus exist
  // to_state harus exist
  // event harus terdefinisi
}
```

#### 5. **Current_State Update (Rule 38 Part 2)**

**File**: `current-state-validator.js`

```javascript
validateCurrentStateUpdate() {
  // Setiap state action harus update Current_State
  // Pattern: self.Current_State = "StateName"
}
```

**Warning Example:**

```
State 'Aktif' action doesn't update Current_State
Fix: Add: self.Current_State = "Aktif";
```

#### 6. **Bridge Call Validation (Rule 20, 21)**

**File**: `bridge-call-validator.js`

```javascript
validateBridgeCalls() {
  // Format: KEY::Method
  // KeyLetter harus UPPERCASE
  // External Entity harus exist
  // Bridge method harus exist
  // TIM reserved untuk Timer
}
```

**Error Example:**

```
Unknown External Entity: 'XYZ' (Rule 20 Shlaer-Mellor violation)
Available External Entities: LOG, TIM

Unknown bridge method: 'TIM::unknown_method'
Available bridges for TIM: current_time, timer_start, get_days_diff
```

#### 7. **Self-Reference Validation**

**File**: `self-reference-validator.js`

```javascript
validateSelfReferences() {
  // 'self' harus diikuti '.' untuk property access
  // Valid: self.Current_State
  // Invalid: self (standalone)
}
```

**Error Example:**

```
Invalid self reference: 'self' must be followed by property access (self.attribute or self->relationship)
Fix: Use 'self.Current_State' or 'self->Person[R1]'
```

#### 8. **Create Instance Validation**

**File**: `create-instance-validator.js`

```javascript
validateCreateInstance() {
  // Syntax: create object instance <var> of <ClassName>
  // ClassName harus exist
}
```

#### 9. **Select Statement Validation**

**File**: `select-statement-validator.js`

```javascript
validateSelectStatements() {
  // select one/many <var> related by self-><Class>[<Rel>]
  // Class dan Relationship harus exist
}
```

#### 10. **Delete Instance Validation**

**File**: `delete-instance-validator.js`

```javascript
validateDeleteInstance() {
  // Syntax: delete object instance <var>
}
```

#### 11. **Relate/Unrelate Validation**

**File**: `relate-instance-validator.js`

```javascript
validateRelateStatements() {
  // relate <var1> to <var2> across <Rel>
  // Relationship harus exist
}
```

#### 12. **Conditional Validation**

**File**: `conditional-validator.js`

```javascript
validateConditionals() {
  // if/elif/else/end if structure
  // not_empty/empty checks
}
```

#### 13. **Loop Validation**

**File**: `loop-validator.js`

```javascript
validateLoops() {
  // for each <var> in <collection>
  // end for structure
}
```

---

## 📋 PHASE 4: INTERMEDIATE REPRESENTATION

**File**: `src/features/translations/utils/typescript-translator.js`

### ✅ Fitur yang Diimplementasikan:

#### 1. **Model Parsing**

```javascript
parseModel() {
  // Parse subsystems
  // Collect external entities → Map<KeyLetter, Entity>
  // Collect classes → Map<KeyLetter, Class>
  // Collect relationships → Map<Label, Relationship>
}
```

#### 2. **Type Mapping**

**File**: `src/features/translations/utils/generators/type-mapper.js`

```javascript
mapToTS(xtumlType) {
  // unique_ID → string
  // integer → number
  // real → number
  // boolean → boolean
  // string → string
  // date → Date
  // state<X> → XState (union type)
}
```

#### 3. **Relationship Analysis**

```javascript
getRelationshipsForClass(keyLetter) {
  // Find all relationships involving this class
  // Types: Simple, Associative, Subtype
}
```

#### 4. **Navigation Properties**

```javascript
getNavigationProperties(cls) {
  // Generate navigation properties based on relationships:
  // - one-to-one: property: Class | null
  // - one-to-many: propertyList: Class[]
  // - Subtype: supertype property (getPerson())
}
```

---

## 📋 PHASE 5: OAL TRANSFORMATION

**File**: `src/features/translations/utils/transformers/oal-transformer.js`

### ✅ Transformations yang Diimplementasikan:

#### 1. **Bridge Calls → Static Method Calls**

```javascript
transformBridgeCalls(oal) {
  // LOG::LogInfo(message: "Test")
  // ↓
  // LOG.LogInfo({ message: "Test" })
}
```

**Features:**

- Converts `::` to `.`
- Wraps parameters in object literal `{}`
- Handles named parameters: `param: value` → `param: value`
- Multi-line formatting for readability

#### 2. **Create Instance → Type Assertion**

```javascript
transformCreateInstance(oal) {
  // create object instance wisuda of Wisuda
  // ↓
  // let wisuda = {} as Wisuda
}
```

#### 3. **Select Statements → Navigation Calls**

```javascript
transformSelectStatements(oal) {
  // select one person related by self->PRS[R1]
  // ↓
  // let person = this.getPerson()

  // select many krs related by self->KRS[R2]
  // ↓
  // let krs = this.getKRSList()

  // select many krs related by self->KRS[R2] where selected.Status == "Lulus"
  // ↓
  // let krs = this.getKRSList().filter(selected => selected.Status === "Lulus")
}
```

#### 4. **Delete Instance → Comment**

```javascript
transformDeleteInstance(oal) {
  // delete object instance self
  // ↓
  // /* Runtime: delete this instance */
}
```

#### 5. **Relate/Unrelate → Setter Calls**

```javascript
transformRelateInstances(oal) {
  // relate mahasiswa to person across R1
  // ↓
  // mahasiswa.setPerson(person)

  // unrelate mahasiswa from person across R1
  // ↓
  // mahasiswa.setPerson(null)
}
```

#### 6. **Conditionals → TypeScript If/Else**

```javascript
transformConditionals(oal) {
  // if (condition)
  //   statements
  // elif (condition2)
  //   statements
  // else
  //   statements
  // end if
  // ↓
  // if (condition) {
  //   statements
  // } else if (condition2) {
  //   statements
  // } else {
  //   statements
  // }
}
```

**Special Conditions:**

- `not_empty x` → `x !== null && x !== undefined`
- `empty x` → `x === null || x === undefined`

#### 7. **Loops → For-Of Loops**

```javascript
transformLoops(oal) {
  // for each krs in krs_list
  //   statements
  // end for
  // ↓
  // for (const krs of krs_list) {
  //   statements
  // }
}
```

#### 8. **Operators → JavaScript Operators**

```javascript
transformOperators(oal) {
  // AND → &&
  // OR → ||
  // NOT → !
  // == → ===
  // != → !==
}
```

#### 9. **Self Keyword → This**

```javascript
transformSelfKeyword(oal) {
  // self.Current_State
  // ↓
  // this.Current_State
}
```

#### 10. **Event Parameters → Params Object**

```javascript
transformEventParameters(oal) {
  // param.alasan
  // ↓
  // params.alasan
}
```

#### 11. **Variable Declarations → Let Declarations**

```javascript
detectVariableAssignments(oal) {
  // Pre-scan: detect all variable names
}

addVariableDeclarations(oal, variables) {
  // selisih = TIM.get_days_diff(...)
  // ↓
  // let selisih = TIM.get_days_diff(...)
}
```

**Features:**

- Two-phase approach: pre-scan before formatting, add declarations after
- Handles multi-line assignments (bridge calls)
- Skips: `this.x`, `params.x`, property access
- Only adds `let` once per variable

---

## 📋 PHASE 6: CODE GENERATION

**Files**:

- `src/features/translations/utils/typescript-translator.js`
- `src/features/translations/utils/generators/*.js`

### ✅ Components yang Di-generate:

#### 1. **Header & Metadata**

**File**: `header-generator.js`

```typescript
// ============================================================================
// Generated TypeScript Code
// System: Sistem Informasi Akademik
// Version: 3.1.0-oal-bpal97
// Generated: 2025-12-28T07:00:00.000Z
// ============================================================================
```

#### 2. **Runtime Library (External Entities)**

**File**: `runtime-shim-generator.js`

```typescript
/**
 * External Entity: Logging (LOG)
 * System Logger
 */
class LOG {
  static LogInfo(params: { message: string }): void {
    console.log(`[INFO]: ${params.message}`);
  }

  static LogError(params: { message: string }): void {
    console.error(`[ERROR]: ${params.message}`);
  }
}

/**
 * External Entity: Timer (TIM)
 * Time Utility
 */
class TIM {
  static current_time(params?: any): Date {
    return new Date();
  }

  static get_days_diff(params?: any): number {
    const date1 = new Date(params.date1);
    const date2 = new Date(params.date2);
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return date2 > date1 ? diffDays : -diffDays;
  }

  static timer_start(params?: any): number {
    // Timer implementation
  }
}
```

**Features:**

- Only generates used External Entities
- TIM methods accept `params?: any` for flexibility
- Implements actual runtime behavior

#### 3. **Type Definitions**

```typescript
type UniqueID = string;
type inst_ref<T> = T; // Instance reference type
type nama_orang = string;
type MahasiswaState = "Aktif" | "Cuti" | "Lulus";
```

#### 4. **Event Parameter Interfaces**

```typescript
interface MHS1EventParams {
  alasan: string;
}

interface MHS2EventParams {
  tanggalAktif: Date;
}
```

#### 5. **Class Generation**

**Components:**

##### a. **Attributes**

```typescript
export class Mahasiswa extends Person {
  public MHS_ID: UniqueID;
  public NIM: string;
  public Current_State: MahasiswaState;
  public Total_SKS: number;
  public IPK: number;
```

**Features:**

- All attributes are `public` (not `private`)
- Referential attributes nullable: `UniqueID | null`
- Subtype classes extend superclass
- Skip duplicate attributes from supertype

##### b. **Constructor**

```typescript
constructor(
  Person_ID: UniqueID,
  Nama: string,
  Email: string,
  MHS_ID: UniqueID,
  NIM: string,
  Current_State: MahasiswaState,
  Total_SKS: number,
  IPK: number
) {
  super(Person_ID, Nama, Email);
  this.MHS_ID = MHS_ID;
  this.NIM = NIM;
  this.Current_State = Current_State;
  this.Total_SKS = Total_SKS;
  this.IPK = IPK;
}
```

**Features:**

- Required parameters first, optional parameters last
- Subtype calls `super()` with supertype params
- Initializes navigation properties: `this.kRSList = []`

##### c. **Getters**

```typescript
getMHS_ID(): UniqueID {
  return this.MHS_ID;
}

getCurrent_State(): MahasiswaState {
  return this.Current_State;
}
```

##### d. **Setters**

```typescript
setCurrent_State(Current_State: MahasiswaState): void {
  this.Current_State = Current_State;
}

setTotal_SKS(Total_SKS: number): void {
  this.Total_SKS = Total_SKS;
}
```

##### e. **Navigation Methods**

**For One-to-One:**

```typescript
getPerson(): Person | null {
  return this.person;
}

setPerson(item: Person | null): void {
  this.person = item;
}
```

**For One-to-Many:**

```typescript
getKRSList(): KRS[] {
  return this.kRSList;
}

addKRS(item: KRS): void {
  if (this.kRSList.indexOf(item) === -1) {
    this.kRSList.push(item);
  }
}

removeKRS(item: KRS): void {
  const index = this.kRSList.indexOf(item);
  if (index > -1) {
    this.kRSList.splice(index, 1);
  }
}
```

**Features:**

- Generates based on relationship analysis
- Handles Simple, Associative, Subtype relationships
- Prevents duplicate additions in arrays

##### f. **State Methods (Event Handlers)**

```typescript
ajukanCuti(params: MHS1EventParams): void {
  if (this.Current_State === "Aktif") {
    // Transformed OAL code here
    this.Current_State = "Cuti";
    let log_cuti = {} as LogCuti;
    log_cuti.MHS_ID = this.MHS_ID;
    log_cuti.Alasan = params.alasan;
    log_cuti.Tanggal = TIM.current_time();

    let person = this.getPerson();
    if (person !== null && person !== undefined) {
      LOG.LogInfo({ message: "Email: " + person.Email });
    }

    this.Current_State = "Cuti";
  } else {
    throw new Error(`Invalid state transition from ${this.Current_State}`);
  }
}
```

**Features:**

- Method name: camelCase from event meaning
- Parameters: interface type from event
- State guard: validates `from_state` matches `Current_State`
- OAL fully transformed to TypeScript
- Updates `Current_State` to `to_state`

---

## 📊 Statistik Implementasi

### Validation Rules (20/72 implemented = 27.8%)

| Category          | Total | Implemented | %     |
| ----------------- | ----- | ----------- | ----- |
| Subsystems        | 4     | 1           | 25%   |
| Information Model | 10    | 6           | 60%   |
| State Models      | 8     | 5           | 62.5% |
| Events & Timers   | 10    | 4           | 40%   |
| Relationships     | 5     | 3           | 60%   |
| Object Actions    | 8     | 2           | 25%   |
| External Entities | 3     | 2           | 66.7% |

### OAL Transformations (11/11 = 100%)

| Transformation        | Status |
| --------------------- | ------ |
| Bridge Calls          | ✅     |
| Create Instance       | ✅     |
| Select Statements     | ✅     |
| Delete Instance       | ✅     |
| Relate/Unrelate       | ✅     |
| Conditionals          | ✅     |
| Loops                 | ✅     |
| Self Keyword          | ✅     |
| Event Parameters      | ✅     |
| Variable Declarations | ✅     |
| Operators             | ✅     |

### Code Generation Components (7/7 = 100%)

| Component          | Status |
| ------------------ | ------ |
| Header             | ✅     |
| Runtime Library    | ✅     |
| Type Definitions   | ✅     |
| Event Interfaces   | ✅     |
| Class Structure    | ✅     |
| Navigation Methods | ✅     |
| State Methods      | ✅     |

---

## 🎯 Usage Examples

### 1. **Parse & Validate Model**

```javascript
import { XtUMLParser } from "./src/features/parsers/utils/xtuml-validator.js";
import fs from "fs";

const model = JSON.parse(fs.readFileSync("./model.json", "utf8"));
const parser = new XtUMLParser();
const errors = parser.parse(model);

if (errors.length === 0) {
  console.log("✅ Model is valid!");
} else {
  errors.forEach((err) => {
    console.log(`[${err.severity}] ${err.message}`);
    console.log(`  Path: ${err.path}`);
    console.log(`  Fix: ${err.fix}`);
  });
}
```

### 2. **Generate TypeScript Code**

```javascript
import { TypeScriptTranslator } from "./src/features/translations/utils/typescript-translator.js";
import fs from "fs";

const model = JSON.parse(fs.readFileSync("./model.json", "utf8"));
const translator = new TypeScriptTranslator(model);
const output = translator.translate();

fs.writeFileSync("./output.ts", output, "utf8");
console.log("✅ Code generated successfully!");
```

### 3. **Full Pipeline**

```javascript
import { XtUMLParser } from "./src/features/parsers/utils/xtuml-validator.js";
import { TypeScriptTranslator } from "./src/features/translations/utils/typescript-translator.js";
import fs from "fs";

// Phase 1-3: Parse & Validate
const model = JSON.parse(fs.readFileSync("./model.json", "utf8"));
const parser = new XtUMLParser();
const errors = parser.parse(model);

if (errors.length > 0) {
  console.error("❌ Validation failed!");
  process.exit(1);
}

// Phase 4-6: Translate to TypeScript
const translator = new TypeScriptTranslator(model);
const output = translator.translate();

fs.writeFileSync("./output.ts", output, "utf8");
console.log("✅ Compilation successful!");
```

---

## 🔧 Configuration & Customization

### 1. **Add New External Entity**

**Step 1:** Define in JSON model:

```json
{
  "external_entities": [
    {
      "name": "Database",
      "key_letter": "DB",
      "description": "Database operations",
      "bridges": [
        {
          "name": "query",
          "parameters": [{ "name": "sql", "type": "string" }],
          "return_type": "array"
        }
      ]
    }
  ]
}
```

**Step 2:** Add implementation in `runtime-shim-generator.js`:

```javascript
if (eeKeyLetter === "DB") {
  if (bridge.name === "query") {
    code += `    // Execute SQL query\n`;
    code += `    console.log(\`[DB]: Executing: \${params.sql}\`);\n`;
    code += `    return [];\n`;
  }
}
```

### 2. **Add New OAL Transformation**

In `oal-transformer.js`:

```javascript
transformCustomSyntax(oal) {
  // Your transformation logic
  return oal.replace(/pattern/, 'replacement');
}

// Add to transform() method
transform(oal) {
  // ...
  transformed = this.transformCustomSyntax(transformed);
  // ...
}
```

### 3. **Add New Validation Rule**

Create new validator in `src/features/parsers/utils/validators/phase-3-semantic/oal-validators/`:

```javascript
export class CustomValidator {
  constructor(errorManager) {
    this.errorManager = errorManager;
  }

  validate(oal, path, context) {
    // Your validation logic
    if (error) {
      this.errorManager.addError(
        "Error message",
        path,
        "Fix suggestion",
        "error",
        3
      );
    }
  }
}
```

Add to `semantic-validator.js`:

```javascript
import { CustomValidator } from "./oal-validators/custom-validator.js";

// In constructor:
this.customValidator = new CustomValidator(this.errorManager);

// In validateOAL():
this.customValidator.validate(oal, path, context);
```

---

## 📁 Project Structure

```
kompiler-model/
├── src/
│   └── features/
│       ├── parsers/
│       │   └── utils/
│       │       ├── validators/
│       │       │   ├── schema-validator.js           # Phase 1
│       │       │   ├── consistency-validator.js      # Phase 2
│       │       │   ├── semantic-validator.js         # Phase 3
│       │       │   └── phase-3-semantic/
│       │       │       └── oal-validators/
│       │       │           ├── bridge-call-validator.js
│       │       │           ├── create-instance-validator.js
│       │       │           ├── current-state-validator.js
│       │       │           ├── event-validator.js
│       │       │           ├── self-reference-validator.js
│       │       │           └── ...
│       │       ├── xtuml-validator.js               # Main parser
│       │       ├── tokenizer.js                     # OAL tokenizer
│       │       └── schema.js                        # JSON schema
│       └── translations/
│           └── utils/
│               ├── typescript-translator.js         # Main translator
│               ├── transformers/
│               │   └── oal-transformer.js          # OAL transformations
│               └── generators/
│                   ├── header-generator.js
│                   ├── runtime-shim-generator.js
│                   ├── type-mapper.js
│                   └── ...
├── models/                                         # Test models
│   ├── model-oal-complete.json
│   ├── model-test copy.json
│   └── output-*.ts                                # Generated code
├── test-suite/                                     # Validation tests
├── docs/                                           # Documentation
│   ├── COMPILER_FLOW_DOCUMENTATION.md             # This file
│   ├── RULE_PARSING_YANG_TELAH_DIIMPLEMENTASIKAN.md
│   ├── TRANSFORMATION_FIXES_V4.md
│   └── EXTERNAL_ENTITIES_GUIDE.md
└── test-*.js                                      # Test scripts
```

---

## 🚀 Performance & Optimizations

### 1. **Lazy Loading**

- External Entities only loaded when used (tracked via Set)
- Relationship analysis cached

### 2. **Two-Phase Variable Detection**

- Pre-scan before formatting (Phase 1)
- Add declarations after formatting (Phase 2)
- Prevents re-parsing during transformation

### 3. **Map-Based Lookups**

- Classes: `Map<KeyLetter, Class>` - O(1) lookup
- Relationships: `Map<Label, Relationship>` - O(1) lookup
- External Entities: `Map<KeyLetter, Entity>` - O(1) lookup

### 4. **Single-Pass Transformations**

- Each OAL transformation processes text once
- No backtracking or re-parsing

---

## ⚠️ Known Limitations

### 1. **Runtime Limitations**

- Instance deletion not implemented (commented out)
- No actual event queue/dispatcher
- Timer operations are stubs

### 2. **Validation Gaps**

- Process Models (ADFD) not supported
- Access Models not validated
- Advanced timer operations (cancel, remaining time) not validated

### 3. **OAL Limitations**

- No support for expressions in create statements
- Limited arithmetic expressions
- No function/method definitions in OAL

### 4. **Code Generation**

- No optimization passes
- Generated code not minified
- No source maps

---

## 🔮 Future Enhancements

### Short Term:

- [ ] Add more External Entities (DB, HTTP, FILE)
- [ ] Implement actual event dispatcher
- [ ] Add unit test framework integration
- [ ] Generate JSDoc comments

### Medium Term:

- [ ] Support for Action Data Flow Diagrams (ADFD)
- [ ] Runtime instance management
- [ ] Debugger integration
- [ ] Performance profiling

### Long Term:

- [ ] Multi-language output (Python, Java, C++)
- [ ] Visual model editor
- [ ] Incremental compilation
- [ ] Cloud deployment support

---

## 📚 References

**Standards:**

- Shlaer-Mellor Object Oriented Analysis (ACM Press, 1993)
- XT-UML Specification (xtuml.org)
- BridgePoint UML Suite

**Related Docs:**

- `docs/RULE_PARSING_YANG_TELAH_DIIMPLEMENTASIKAN.md` - Validation rules
- `docs/TRANSFORMATION_FIXES_V4.md` - OAL transformation details
- `docs/EXTERNAL_ENTITIES_GUIDE.md` - External entity implementation
- `docs/XTUML_RULES_COMPLIANCE.md` - Compliance checklist

---

## 👥 Contributors

**Project**: Kompiler Model - XT-UML Parser  
**Organization**: Kelompok 6 - PPPL  
**Institution**: UIN Sunan Kalijaga Yogyakarta  
**Year**: 2025

---

## 📝 License

Educational purposes only.

---

**Document Version**: 1.0  
**Last Updated**: 28 Desember 2025  
**Status**: Complete ✅
