#Parsing (class)
alur: input json->parsing-> jika berhasil klik button lanjut

1. Validasi Keunikan (Uniqueness Checks)
   Ini adalah validasi termudah (hanya butuh loop dan Set di JavaScript) tapi paling sering dilanggar saat membuat model.

Nama Objek Unik (Rule 4): Cek apakah ada dua objek dengan nama yang sama. "Each object in a subsystem must have a unique name".

KeyLetter Unik (Rule 6): Cek KeyLetter. Ini sering duplikat jika pengguna melakukan copy-paste objek. "Each object must have a unique KeyLetter".

Nama Atribut Unik per Objek (Rule 7): Dalam satu objek, tidak boleh ada nama atribut ganda. "Each attribute within an object must have a unique name".

Nama State Unik (Rule 18): Dalam satu state model, nama state tidak boleh kembar. "Each state within a state model must have a unique name".

2. Validasi Integritas Atribut (Completeness Checks)
   Memastikan objek tidak "ompong" atau cacat struktur datanya.

Wajib Punya Identifier (Rule 8): Setiap objek harus punya minimal satu atribut yang dijadikan ID (Primary Key). Jika kosong, sistem tidak bisa membedakan instance. "Each object must have at least one identifier".

Format Atribut Referensi (Rule 10): Cek apakah atribut yang dimaksudkan sebagai foreign key memiliki label relasi (misal: Nama_R1). "Referential attributes... are indicated by appending the label of the relationship". Cukup cek suffix string-nya saja.

3. Validasi Link State Model (Consistency Checks)
   Memastikan "mesin" (state model) tersambung ke "mobil" (objek) yang benar.

Kesesuaian KeyLetter (Rule 15): Pastikan KeyLetter pada State Model benar-benar ada di daftar Object. "The KeyLetter of the state model is the KeyLetter of the object". Jika State Model punya KeyLetter 'XYZ' tapi tidak ada Objek 'XYZ', itu error.

=================================================================================================================================

#visualisasi (generate diagram kelas dan relasi dari jsonnya)

#translate (button translate muncul setelah json berhasil diparsing tanpa error)

#tampilan web (ya tampilannya)
