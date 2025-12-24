# Dokumentasi Rule XT-UML Parser

## 📌 Ringkasan

Parser XT-UML telah berhasil mengimplementasikan **18 dari 72 rules** dari Shlaer-Mellor Object Oriented Analysis.

---

## ✅ Rule yang Berhasil Diimplementasikan

### 1. SUBSYSTEM (1 rule)

#### **Rule 2: Nama Subsystem Unik**

- Setiap subsystem harus memiliki nama yang unik
- Divalidasi di: `consistency-validator.js`
- Error jika ada nama subsystem yang sama

**Contoh Error:**

```
Duplicate subsystem name 'Manajemen Akademik'
```

---

### 2. INFORMATION MODEL (6 rules)

#### **Rule 6: Nama dan Nomor Class Unik**

- Setiap class dalam subsystem harus punya nama dan nomor unik
- Divalidasi secara implisit melalui class map

#### **Rule 7: KeyLetter Unik**

- Setiap class/external entity harus punya KeyLetter unik
- Format: 3-4 huruf kapital (contoh: MHS, DSN, PRS)
- Divalidasi di: `consistency-validator.js`

**Contoh Error:**

```
Duplicate KeyLetter 'MHS'
```

#### **Rule 8: Nama Attribute Unik**

- Setiap attribute dalam satu class harus punya nama unik
- Divalidasi di: `consistency-validator.js`

**Contoh Error:**

```
Duplicate attribute name 'SKS' in class 'MataKuliah' (first defined at attributes[3])
Fix: Use unique attribute names within each class
```

**Contoh JSON Invalid:**

```json
{
  "name": "MataKuliah",
  "attributes": [
    { "name": "SKS", "type": "integer" },
    { "name": "SKS", "type": "integer" } // ❌ Duplicate!
  ]
}
```

#### **Rule 9: Minimal Satu Identifier**

- Setiap class harus punya minimal satu attribute sebagai identifier
- Attribute harus ditandai dengan `"is_identifier": true`
- Divalidasi di: `consistency-validator.js`

**Contoh Error:**

```
Class 'Mahasiswa' has no identifier attribute
Fix: Mark at least one attribute with 'is_identifier': true
```

#### **Rule 10: Referential Attributes**

- Referential attribute harus mencantumkan label relationship
- Format 1: `"referential": "R1"`
- Format 2: `"referential": {"relationship_label": "R1"}`
- Divalidasi di: `consistency-validator.js`

**Contoh Error:**

```
Referential attribute 'Person_ID' has empty relationship label
```

#### **Rule 11: Pencocokan Tipe Domain** ⭐ _BARU_

- Tipe referential attribute harus sama dengan tipe attribute yang direferensikan
- Divalidasi di: `consistency-validator.js`

**Contoh Error:**

```
Referential attribute 'Person_ID' type 'string' doesn't match referenced attribute type 'unique_ID'
Fix: Change type to 'unique_ID' to match referenced attribute
```

---

### 3. RELATIONSHIPS (3 rules)

#### **Rule 9 (Note): Label Relationship Unik**

- Setiap relationship harus punya label unik (R1, R2, R3, dst)
- Label tidak boleh kosong atau hanya whitespace
- Divalidasi di: `consistency-validator.js`

**Contoh Error (Label Kosong):**

```
Relationship missing or has empty label
Fix: Provide a valid relationship label (e.g., 'R1', 'R2', 'R3')
```

**Contoh Error (Label Duplikat):**

```
Duplicate relationship label 'R1'
Fix: Use unique labels (R1, R2, R3, etc.)
```

**Contoh JSON Invalid:**

```json
{
  "relationships": [
    {
      "label": "", // ❌ Empty label
      "type": "Subtype"
    },
    {
      "label": "R1",
      "type": "Associative"
    },
    {
      "label": "R1", // ❌ Duplicate
      "type": "Simple"
    }
  ]
}
```

#### **Rule 12: Komposisi Relationship** ⭐ _BARU_

- Relationship yang dibentuk dari komposisi harus mencantumkan formula
- Format: `"composition": "R1+R2"`
- Kedua relationship yang di-compose harus exist
- Divalidasi di: `consistency-validator.js`

**Contoh JSON:**

```json
{
  "label": "R3",
  "type": "Associative",
  "composition": "R1+R2"
}
```

**Contoh Error:**

```
Composition references undefined relationship 'R5'
```

#### **Konsistensi Relationship**

- Validasi bahwa KeyLetter yang direferensikan dalam relationship benar-benar exist
- Untuk Subtype: superclass & subclasses
- Untuk Associative: one_side, other_side, association_class
- Untuk Simple: one_side, other_side

---

### 4. STATE MODELS (5 rules)

#### **Rule 17: KeyLetter State Model Unik** ⭐ _BARU_

- Setiap state model harus punya KeyLetter unik yang match dengan class
- Divalidasi di: `consistency-validator.js`

#### **Rule 18: Nama State Unik**

- Setiap state dalam state model harus punya nama unik
- Divalidasi di: `consistency-validator.js`

**Contoh Error:**

```
Duplicate state name 'Aktif' (first defined at states[0])
Fix: Use unique state names within each state model
```

**Contoh JSON Invalid:**

```json
{
  "state_model": {
    "states": [
      { "name": "Aktif", "state_number": 1 },
      { "name": "Aktif", "state_number": 2 } // ❌ Duplicate name!
    ]
  }
}
```

#### **Rule 19: Nomor State Unik** ⭐ _BARU_

- Setiap state harus punya `state_number` yang unik
- Divalidasi di: `consistency-validator.js`

**Contoh Error:**

```
Duplicate state number 2 (first used by 'Cuti')
Fix: Assign unique state numbers (1, 2, 3, ...)
```

#### **Validasi Initial State**

- Initial state harus ada dalam daftar states
- Divalidasi di: `semantic-validator.js`

**Contoh Error:**

```
Initial state 'NonExistent' not found in states
```

#### **Validasi Transition**

- `from_state` dan `to_state` harus exist
- `event` harus terdefinisi dalam events
- Divalidasi di: `semantic-validator.js`

---

### 5. EVENTS & TIMERS (4 rules)

#### **Rule 26: Format Label Event (KLi)** ⭐ _BARU_

- Event label harus mengikuti format: `<KeyLetter><Nomor>`
- Contoh: MHS1, MHS2, DSN1, PRS1
- Divalidasi di: `semantic-validator.js`

**Contoh Error:**

```
Event label 'ajukanCuti' doesn't follow format 'MHS<number>'
Fix: Use format: MHS1, MHS2, MHS3, etc.
```

#### **Rule 27: Format Event** ⭐ _BARU_

- Event harus punya field `meaning` atau `description`
- Parameters harus dalam format array
- Divalidasi di: `semantic-validator.js`

**Contoh JSON:**

```json
{
  "label": "MHS1",
  "meaning": "Ajukan Cuti",
  "parameters": [{ "name": "alasan", "type": "string" }]
}
```

#### **Rule 29: Konsistensi Event Data** ⭐ _BARU_

- Semua event yang transisi ke state yang sama harus punya parameter identik
- Divalidasi di: `semantic-validator.js`

**Contoh Error:**

```
Event 'MHS2' parameters differ from 'MHS1' but both transition to state 'Aktif'
Fix: All events transitioning to the same state must have identical parameter structure
```

#### **Rule 24: Target Event**

- Event diarahkan ke satu state model
- Divalidasi melalui struktur transitions

---

### 6. OBJECT ACTIONS (2 rules)

#### **Rule 38: Update Current_State** ⭐ _BARU_

**Part 1: Attribute Existence**

- Class dengan state model harus punya attribute `Current_State`
- Tipe: `state<KeyLetter>` (contoh: `state<MHS>`)
- Divalidasi di: `consistency-validator.js`

**Contoh Attribute:**

```json
{
  "name": "Current_State",
  "type": "state<MHS>",
  "is_identifier": false
}
```

**Part 2: OAL Update**

- Setiap state action harus update `Current_State` (kecuali deletion states)
- Divalidasi di: `semantic-validator.js`

**Contoh OAL:**

```javascript
// State Aktif
self.Current_State = "Aktif";
```

**Contoh Warning:**

```
State 'Aktif' action doesn't update Current_State
Fix: Add: self.Current_State = "Aktif";
```

#### **Validasi Sintaks OAL**

- `self` harus diikuti oleh `.`
- Bridge call format: `KEYLETTER::FunctionName`

**Contoh OAL Valid:**

```javascript
// Access attribute
self.Current_State = "Aktif";

// Bridge call
LOG::LogInfo(message: "Test");
```

---

## 🎯 3 Fase Validasi

### **Phase 1: Schema Validation**

File: `schema-validator.js`

**Apa yang divalidasi:**

- Struktur JSON benar
- Field required ada
- Tipe data sesuai (string, integer, array, object)
- Tidak ada field yang tidak dikenal

### **Phase 2: Consistency Validation**

File: `consistency-validator.js`

**Rule yang divalidasi:**

- Rule 2: Unique subsystem names
- Rule 6, 7, 8: Unique classes & attributes
- Rule 9: At least one identifier
- Rule 10, 11: Referential attributes & type matching
- Rule 12: Relationship composition
- Rule 17, 19: State model & state numbers
- Rule 38 (Part 1): Current_State attribute
- Relationship consistency

### **Phase 3: Semantic Validation**

File: `semantic-validator.js`

**Rule yang divalidasi:**

- Initial state validation
- Rule 26, 27: Event format
- Rule 29: Event data consistency
- Rule 38 (Part 2): Current_State update
- Transition validation
- OAL syntax validation

---

## 📊 Statistik Implementasi

| Kategori              | Total Rules | Implemented | Percentage |
| --------------------- | ----------- | ----------- | ---------- |
| Subsystems            | 4           | 1           | 25%        |
| Information Model     | 10          | 6           | 60%        |
| State Models          | 8           | 5           | 62.5%      |
| Events & Timers       | 10          | 4           | 40%        |
| Relationships         | 5           | 3           | 60%        |
| Object Actions        | 8           | 2           | 25%        |
| Process Models        | 21          | 0           | 0%         |
| Process Decomposition | 9           | 0           | 0%         |
| Access Models         | 3           | 0           | 0%         |
| **TOTAL**             | **72**      | **18**      | **25%**    |

---

## 🚀 Cara Menggunakan

### Import Parser:

```javascript
import { XtUMLParser } from "./src/features/parsers/utils/xtuml-validator.js";
```

### Parse Model:

```javascript
const parser = new XtUMLParser();
const errors = parser.parse(jsonModel);

if (errors.length === 0) {
  console.log("✅ Model valid!");
} else {
  console.log(`❌ Found ${errors.length} errors`);
  errors.forEach((error) => {
    console.log(`[${error.severity}] ${error.message}`);
    console.log(`  Path: ${error.path}`);
    console.log(`  Fix: ${error.fix}`);
  });
}
```

### Error Object Structure:

```javascript
{
  message: "Error description",
  path: "$.system_model.subsystems[0].classes[1]",
  fix: "Suggestion to fix",
  severity: "error" | "warning",
  phase: 1 | 2 | 3
}
```

---

## ⭐ Update Terbaru (Version 2.0)

### Rule Baru yang Ditambahkan:

1. ✅ **Rule 2**: Unique subsystem names
2. ✅ **Rule 11**: Domain type matching untuk referential attributes
3. ✅ **Rule 12**: Relationship composition validation
4. ✅ **Rule 17**: Unique state model KeyLetter
5. ✅ **Rule 19**: Unique state numbers
6. ✅ **Rule 26**: Event label format (KLi)
7. ✅ **Rule 27**: Event format validation
8. ✅ **Rule 29**: Event data consistency
9. ✅ **Rule 38**: Current_State attribute & update validation

### Total Rule Baru: **9 rules**

---

## 📝 Rule yang Belum Diimplementasikan

**54 rules** belum diimplementasikan, termasuk:

### Tidak Applicable untuk JSON Model:

- Object Communication Model (OCM)
- Process Models (ADFD)
- Access & Communication Models
- TIMER object formalism

### Memerlukan Runtime Validation:

- Instance creation/deletion
- Action consistency & instance management
- Relationship consistency runtime

### Memerlukan Struktur Data Tambahan:

- External entity details
- Assigner state models
- Timer events & operations

---

## 📖 Referensi

**Sumber Rule**: Shlaer-Mellor Object Oriented Analysis Rules  
**Publikasi**: Software Engineering Notes, ACM Press, Volume 18, Number 1, January 1993  
**File Rule**: `models/rule-xt-uml.txt`

---

**Versi**: 2.0.0  
**Tanggal Update**: 24 Desember 2025  
**Project**: Kompiler Model - XT-UML Parser
