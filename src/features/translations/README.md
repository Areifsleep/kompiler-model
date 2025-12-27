# XtUML to TypeScript Translator

Translator untuk mengkonversi model xtUML JSON menjadi TypeScript code yang clean dan production-ready.

## Fitur Utama

### 1. Type Definitions
- Generate type aliases dari data types model
- State types untuk state machines
- Event parameter interfaces

### 2. Class Generation
- Full TypeScript class dengan proper typing
- Constructor dengan required dan optional parameters
- Private attributes dengan getter/setter methods

### 3. Relationship Implementation

#### A. R1: Generalization (Inheritance)
```typescript
class Person { ... }
class Mahasiswa extends Person { ... }
class Dosen extends Person { ... }
```

#### B. R2: Many-to-Many (Associative)
```typescript
// Mahasiswa ↔ MataKuliah via KRS
class KRS {
  constructor(MHS_ID: string, MK_ID: string, ...) { ... }
  getMahasiswa(): Mahasiswa { ... }
  getMataKuliah(): MataKuliah { ... }
}
```

#### C. R3-R5: One-to-Many (Simple)
```typescript
class Dosen {
  private mataKuliahList: MataKuliah[] = [];
  
  getMataKuliahList(): MataKuliah[] { ... }
  addMataKuliah(item: MataKuliah): void { ... }
  removeMataKuliah(item: MataKuliah): void { ... }
}
```

#### D. R6: Composition (Strong Ownership)
```typescript
class Person {
  private alamat: Alamat | null = null;
  
  setAlamat(item: Alamat): void { ... }
  
  // Cascade delete
  delete(): void {
    if (this.alamat) {
      this.alamat.delete();
      this.alamat = null;
    }
  }
}
```

#### E. R7: Aggregation (Weak Ownership)
```typescript
// MataKuliah ↔ Buku via ReferensiBuku
class ReferensiBuku {
  // Association class tanpa cascade delete
  setMataKuliah(mk: MataKuliah): void { ... }
  setBuku(buku: Buku): void { ... }
}
```

#### F. R8: Reflexive (Self-Referencing)
```typescript
class Mahasiswa {
  private mentor: Mahasiswa | null = null;
  private menteeList: Mahasiswa[] = [];
  
  getMentor(): Mahasiswa | null { ... }
  setMentor(mentor: Mahasiswa): void { ... }
  
  getMenteeList(): Mahasiswa[] { ... }
  addMentee(mentee: Mahasiswa): void { ... }
}
```

### 4. State Model Support
```typescript
class Mahasiswa {
  private currentState: MahasiswaState = "Aktif";
  
  // Event: MHS1 - AjukanCuti
  ajukanCuti(params: MHS1EventParams): void {
    if (this.currentState === "Aktif") {
      this.currentState = "Cuti";
      console.log(`[${this.getNIM()}] State: Aktif → Cuti`);
    }
  }
}
```

## Class Ordering Strategy

TypeScriptTranslator mengatur urutan class untuk menghindari "undefined" references:

1. **Independent Classes** - Class tanpa dependencies (e.g., Buku, Ruangan)
2. **Base Classes** - Supertype dalam generalization (e.g., Person)
3. **Subtype Classes** - Classes yang extends base (e.g., Mahasiswa, Dosen)
4. **Dependent Classes** - Class lain dengan dependencies (e.g., KRS, Jadwal)

## API Usage

```javascript
import { TypeScriptTranslator } from './utils/typescript-translator';

const modelJson = JSON.parse(modelString);
const translator = new TypeScriptTranslator(modelJson);
const tsCode = translator.translate();
```

## Features

### ✅ Supported Relationship Types
- [x] R1: Generalization/Inheritance
- [x] R2: Many-to-Many Associative
- [x] R3-R5: One-to-Many Simple
- [x] R6: Composition (cascade delete)
- [x] R7: Aggregation (weak ownership)
- [x] R8: Reflexive/Self-referencing

### ✅ Code Quality
- Clean TypeScript dengan proper typing
- Camel case untuk properties dan methods
- Pascal case untuk class names
- No example usage code in output
- Proper null checks dan array operations

### ✅ Navigation Methods
- Getter methods untuk semua relationships
- Add/Remove methods untuk one-to-many
- Setter methods untuk one-to-one
- Bidirectional relationship sync

## Testing

Untuk test translator:

1. Load `models/model-lengkap(2).json` di Parsing page
2. Navigate ke Translation page
3. Verify output includes:
   - 10 classes (Person, Mahasiswa, Dosen, MataKuliah, KRS, Jadwal, Ruangan, Alamat, Buku, ReferensiBuku)
   - 8 relationships (R1-R8)
   - State machine untuk Mahasiswa (3 states, 3 events)
   - Proper navigation methods

## File Structure

```
src/features/translations/
├── README.md                          # This file
├── pages/
│   └── translation-page.jsx           # UI page
└── utils/
    └── typescript-translator.js       # Core translator
```

## Error Handling

Translator includes comprehensive error handling:

```javascript
try {
  const code = translator.translate();
  // Success
} catch (error) {
  // Shows user-friendly error message
  console.error('Translation failed:', error.message);
}
```

Common errors:
- Invalid model structure
- Missing required fields
- Invalid relationship references
- Malformed state models
