// Import semua class dari file hasil generate Anda
// Asumsi nama file generate-nya adalah "SistemAkademik.ts"
import { Mahasiswa, MataKuliah, KRS } from "../backup/output-oal-complete.js";

// ==========================================
// HELPER: Fungsi Assert Sederhana (Pengganti Jest)
// ==========================================
function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
  } else {
    console.error(`❌ FAIL: ${testName}`);
    // Opsional: Throw error jika ingin stop testing saat fail
    // throw new Error(`Test Failed: ${testName}`);
  }
}

function printHeader(title: string) {
  console.log(`\n==========================================`);
  console.log(`SCENARIO: ${title}`);
  console.log(`==========================================`);
}

// ==========================================
// MAIN TEST SCENARIO
// ==========================================
try {
  // ---------------------------------------------------------
  // 1. SETUP DATA MASTER
  // ---------------------------------------------------------
  printHeader("1. Setup Data (Mahasiswa & Mata Kuliah)");

  // Buat Mahasiswa: Budi
  // ID: MHS-001, NIM: 10110, State Awal: Aktif
  const budi = new Mahasiswa(
    "P-001",
    "Budi Santoso",
    "budi@univ.ac.id", // Person Data
    "MHS-001",
    "10110",
    "Aktif",
    0,
    0 // Mahasiswa Data
  );

  // Buat 3 Mata Kuliah
  const mkWeb = new MataKuliah("MK-01", "IF-101", "Pemrograman Web", 3);
  const mkAI = new MataKuliah("MK-02", "IF-102", "Artificial Intelligence", 3);
  const mkDB = new MataKuliah("MK-03", "IF-103", "Basis Data", 2);

  assert(budi.getNama() === "Budi Santoso", "Nama Mahasiswa tercatat benar");
  assert(mkWeb.getSKS() === 3, "SKS MK Web benar (3 SKS)");

  // ---------------------------------------------------------
  // 2. KRS & RELASI OBJEK (Linking)
  // ---------------------------------------------------------
  printHeader("2. Pengisian KRS (Linking Objects)");

  // Budi mengambil 3 Mata Kuliah tersebut
  // Kita buat objek KRS (Linker)
  const krs1 = new KRS("KRS-01", 1, "", "Diambil", 3); // Web
  const krs2 = new KRS("KRS-02", 1, "", "Diambil", 3); // AI
  const krs3 = new KRS("KRS-03", 1, "", "Diambil", 2); // DB

  // --- MENGHUBUNGKAN RELASI (Simulasi Controller) ---
  // Hubungkan KRS1 (Web) ke Budi
  budi.addKRS(krs1); // Sisi Mahasiswa
  krs1.setMahasiswa(budi); // Sisi KRS
  mkWeb.addKRS(krs1); // Sisi MK
  krs1.setMataKuliah(mkWeb); // Sisi KRS

  // Hubungkan KRS2 (AI) ke Budi
  budi.addKRS(krs2);
  krs2.setMahasiswa(budi);
  mkAI.addKRS(krs2);
  krs2.setMataKuliah(mkAI);

  // Hubungkan KRS3 (DB) ke Budi
  budi.addKRS(krs3);
  krs3.setMahasiswa(budi);
  mkDB.addKRS(krs3);
  krs3.setMataKuliah(mkDB);

  // Verifikasi Link
  assert(budi.getKRSList().length === 3, "Budi memiliki 3 KRS di list");
  assert(krs1.getMahasiswa()?.getNama() === "Budi Santoso", "KRS1 terhubung balik ke Budi");
  assert(krs1.getMataKuliah()?.getNama() === "Pemrograman Web", "KRS1 terhubung ke MK Web");

  // ---------------------------------------------------------
  // 3. PENGUJIAN LOGIKA CUTI (State Transition)
  // ---------------------------------------------------------
  printHeader("3. Mahasiswa Mengajukan Cuti");

  // Logic: ajukanCuti akan menghitung Total SKS dari KRS yang statusnya "Diambil"
  // Total SKS Harapan: 3 + 3 + 2 = 8 SKS

  budi.ajukanCuti({ alasan: "Sakit Tipes" });

  // Assert State berubah
  assert(budi.getCurrent_State() === "Cuti", "State berubah menjadi 'Cuti'");

  // Assert Action Language (Hitung SKS) berjalan
  assert(budi.getTotal_SKS() === 8, `Total SKS terhitung benar (Expected: 8, Got: ${budi.getTotal_SKS()})`);

  // Test Guard: Coba cuti lagi (Harusnya Error)
  try {
    console.log("   > Mencoba mengajukan cuti lagi saat status Cuti...");
    budi.ajukanCuti({ alasan: "Mau cuti dobel" });
    assert(false, "Guard check gagal (Seharusnya throw error)");
  } catch (e) {
    assert(true, "Guard check berhasil (Throw error transition invalid)");
  }

  // ---------------------------------------------------------
  // 4. PENGUJIAN AKTIF KEMBALI
  // ---------------------------------------------------------
  printHeader("4. Mahasiswa Aktif Kembali");

  budi.aktifkanKembali({ tanggalAktif: new Date() });

  assert(budi.getCurrent_State() === "Aktif", "State kembali menjadi 'Aktif'");
  assert(budi.getTotal_SKS() === 0, "Total SKS di-reset jadi 0 saat aktif kembali");

  // ---------------------------------------------------------
  // 5. PENGUJIAN KELULUSAN & IPK (Complex Logic)
  // ---------------------------------------------------------
  printHeader("5. Penilaian & Kelulusan");

  // Simulasi Dosen memberi nilai
  // KRS1 (Web, 3 SKS) -> A (Nilai 4) -> Poin 12
  krs1.setNilai("A");
  krs1.setStatus("Lulus");

  // KRS2 (AI, 3 SKS) -> B (Nilai 3) -> Poin 9
  krs2.setNilai("B");
  krs2.setStatus("Lulus");

  // KRS3 (DB, 2 SKS) -> A (Nilai 4) -> Poin 8
  krs3.setNilai("A");
  krs3.setStatus("Lulus");

  // Total Poin = 12 + 9 + 8 = 29
  // Total SKS  = 3 + 3 + 2 = 8
  // IPK = 29 / 8 = 3.625

  // Trigger Event Lulus
  console.log("   > Memicu event dinyatakanLulus...");
  budi.dinyatakanLulus({ tanggalLulus: new Date() });

  // Assert State Akhir
  assert(budi.getCurrent_State() === "Lulus", "State berubah menjadi 'Lulus'");

  // Assert Kalkulasi IPK
  const expectedIPK = 3.625;
  assert(budi.getIPK() === expectedIPK, `IPK terhitung akurat (Expected: ${expectedIPK}, Got: ${budi.getIPK()})`);

  // Assert Total SKS Lulus
  assert(budi.getTotal_SKS() === 8, "Total SKS Lulus tersimpan benar");

  console.log("\n✅ SEMUA TEST BERHASIL DIJALANKAN.");
} catch (e) {
  console.error("\n❌ TERJADI CRASH PADA TEST RUNNER:");
  console.error(e);
}
