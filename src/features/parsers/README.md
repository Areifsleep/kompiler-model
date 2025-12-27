# XtUML Parser & Validator

Parser dan validator untuk model xtUML dengan tampilan error yang informatif seperti compiler bahasa pemrograman.

## Fitur

### 1. Validasi Struktur JSON

- Memvalidasi struktur dasar model xtUML
- Memeriksa keberadaan elemen wajib (system_model, subsystems, dll)
- Validasi tipe data untuk setiap field

### 2. Validasi KeyLetter

- **Aturan SMOOA93**: KeyLetter harus unik di seluruh model
- Mendeteksi duplikasi KeyLetter antara:
  - Class dengan Class lain
  - Class dengan External Entity
  - External Entity dengan External Entity lain

### 3. Validasi OAL (Object Action Language)

Validator memeriksa syntax OAL di dalam action_oal pada state model:

#### a. Penggunaan `self`

**Aturan**: Keyword `self` harus selalu diikuti titik (`.`)

```oal
✓ Benar:   select one user related by self.Profile[R1];
✗ Salah:   select one user related by selfProfile[R1];
```

#### b. Bridge Call (::)

**Aturan**: Format bridge call harus `KEYLETTER::FunctionName`

- KeyLetter harus uppercase
- Menggunakan separator `::`

```oal
✓ Benar:   LOG::LogInfo(message: "test");
✗ Salah:   log::LogInfo(message: "test");
✗ Salah:   logger::write(message: "test");
```

### 4. Validasi Relationships

- Memvalidasi referensi ke class yang ada
- Memeriksa struktur Subtype dan Associative relationship
- Memastikan class yang direferensikan ada di model

### 5. Validasi Attributes

- **Warning**: Class sebaiknya memiliki setidaknya satu identifier attribute
- Memeriksa keberadaan `is_identifier: true`

## Tampilan Error

Error ditampilkan dengan format seperti compiler, mencakup:

### Informasi Error

- **Severity Level**: Error, Warning, Info
- **Line Number**: Nomor baris di JSON (jika tersedia)
- **Context**: Lokasi error (Class, State, dll)
- **Message**: Deskripsi error yang jelas

### Code Preview

Menampilkan cuplikan kode di sekitar error dengan:

- 2 baris sebelum error
- Baris dengan error (highlighted)
- 2 baris setelah error
- Line numbers
- Tanda panah (→) menunjuk ke baris error

### Contoh Tampilan

```
ERROR Line 25
Duplikasi KeyLetter terdeteksi: 'USR'
Context: Subsystem[0]: Main -> Class[1]: UserProfile

   23    "name": "User",
   24    "key_letter": "USR",
   25  → "class_number": 1,
   26    "attributes": [
   27      { "name": "User_ID", ... }
```

## Struktur Model yang Valid

```json
{
  "system_model": {
    "system_name": "Nama Sistem",
    "version": "1.0.0",
    "subsystems": [
      {
        "name": "Nama Subsystem",
        "prefix": "PREFIX",
        "classes": [
          {
            "name": "NamaClass",
            "key_letter": "CLS",
            "class_number": 1,
            "attributes": [
              {
                "name": "ID",
                "type": "unique_ID",
                "is_identifier": true
              }
            ],
            "state_model": {
              "states": [
                {
                  "name": "StateName",
                  "state_number": 1,
                  "action_oal": "// OAL code here"
                }
              ]
            }
          }
        ],
        "external_entities": [
          {
            "key_letter": "EE",
            "name": "External Entity Name",
            "bridges": [...]
          }
        ],
        "relationships": [...]
      }
    ]
  }
}
```

## Cara Menggunakan

1. **Input Model**: Paste JSON model atau load dari file
2. **Parse & Validasi**: Klik tombol "Parse & Validasi"
3. **Review Errors**: Lihat daftar error dengan detail
4. **Perbaiki**: Fix error berdasarkan informasi yang diberikan
5. **Validasi Ulang**: Parse lagi sampai tidak ada error
6. **Lanjutkan**: Klik "Lanjut ke Visualisasi"

## Test Cases

Lihat file `TEST_CASES.md` untuk contoh-contoh test case lengkap dengan expected results.

## Komponen

### XtUMLParser (`utils/xtuml-validator.js`)

Parser utama yang melakukan validasi model.

**Methods:**

- `parse(modelJson, rawText)`: Parse dan validasi model
- `checkKeyLetter(kl, context, line)`: Validasi KeyLetter
- `validateOAL(oal, context, startLine)`: Validasi OAL syntax

### ErrorDisplay (`components/ErrorDisplay.jsx`)

Komponen React untuk menampilkan error dengan format yang rapi.

**Props:**

- `errors`: Array of error objects dengan struktur:
  ```js
  {
    message: string,
    context: string,
    line: number | null,
    severity: 'error' | 'warning' | 'info',
    codePreview: Array<{lineNumber, content, isError}>
  }
  ```

## Referensi

- **SMOOA93**: Shlaer-Mellor Object-Oriented Analysis Rules
- **OAL Syntax**: Object Action Language Specification
- Model structure based on xtUML metamodel
