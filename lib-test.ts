// Import dari file hasil generate Anda
// Pastikan nama filenya sesuai (misal: LibrarySystem)
import { Anggota, Buku, Peminjaman } from "./models/output-lib.ts";

// ==========================================
// HELPER: Custom Assertion
// ==========================================
function assert(condition: boolean, msg: string) {
  if (condition) console.log(`✅ PASS: ${msg}`);
  else {
    console.error(`❌ FAIL: ${msg}`);
    process.exit(1); // Stop jika error fatal
  }
}

function header(title: string) {
  console.log(`\n=== ${title} ===`);
}

// ==========================================
// MAIN TEST RUNNER
// ==========================================
try {
  // ---------------------------------------------------
  // 1. SETUP DATA (Anggota & Buku)
  // ---------------------------------------------------
  header("SCENARIO 1: Setup Data Master");

  // Buat Anggota: Siti
  // Saldo Denda Awal: 0
  const siti = new Anggota("AGT-01", "Siti Aminah", "siti@lib.com", 0);

  // Buat Buku: Harry Potter
  const bukuHP = new Buku("BKU-01", "Harry Potter", 5);

  assert(siti.getNama() === "Siti Aminah", "Data Anggota Valid");
  assert(bukuHP.getStok() === 5, "Stok Buku Valid");

  // ---------------------------------------------------
  // 2. TRANSAKSI PEMINJAMAN (Linking Objects)
  // ---------------------------------------------------
  header("SCENARIO 2: Peminjaman Buku (Linking)");

  // Tentukan Tanggal:
  // Pinjam: 1 Januari 2025
  // Harus Kembali: 4 Januari 2025 (3 Hari Pinjam)
  const tglPinjam = new Date("2025-01-01");
  const tglJatuhTempo = new Date("2025-01-04");

  const pnj = new Peminjaman(
    "PNJ-001",
    "Dipinjam",
    tglPinjam,
    tglJatuhTempo,
    "Dipinjam",
    0
  );

  // --- PENTING: Menghubungkan Relasi (R10) ---
  // Di xtUML, relasi harus konsisten dua arah

  // 1. Hubungkan Peminjaman ke Anggota
  pnj.setAnggota(siti);
  siti.addPeminjaman(pnj);

  // 2. Hubungkan Peminjaman ke Buku
  pnj.setBuku(bukuHP);
  bukuHP.addPeminjaman(pnj);

  // Assert Links
  assert(
    pnj.getAnggota()?.getNama() === "Siti Aminah",
    "Peminjaman terhubung ke Siti"
  );
  assert(
    pnj.getBuku()?.getJudul() === "Harry Potter",
    "Peminjaman terhubung ke Buku HP"
  );
  assert(
    siti.getPeminjamanList().length === 1,
    "List Peminjaman Siti bertambah"
  );

  // ---------------------------------------------------
  // 3. PENGEMBALIAN TEPAT WAKTU (Tidak Ada Denda)
  // ---------------------------------------------------
  // Kita buat simulasi peminjaman lain untuk tes tepat waktu
  const pnjTepat = new Peminjaman(
    "PNJ-002",
    "Dipinjam",
    tglPinjam,
    tglJatuhTempo,
    "Dipinjam",
    0
  );
  pnjTepat.setAnggota(siti); // Link minimal untuk OAL jalan

  header("SCENARIO 3: Pengembalian Tepat Waktu");

  // Dikembalikan tanggal 3 Jan (Sebelum jatuh tempo tgl 4)
  pnjTepat.kembalikanBuku({ tgl_kembali: new Date("2025-01-03") });

  assert(
    pnjTepat.getDenda() === 0,
    "Tidak ada denda untuk pengembalian tepat waktu"
  );
  assert(
    pnjTepat.getStatus() === "Dikembalikan",
    "Status berubah jadi Dikembalikan"
  );

  // ---------------------------------------------------
  // 4. PENGEMBALIAN TERLAMBAT (Core Logic Test)
  // ---------------------------------------------------
  header("SCENARIO 4: Pengembalian Terlambat (Denda)");

  // Kembali ke Peminjaman PNJ-001 (Jatuh Tempo: 4 Jan)
  // Kita kembalikan tanggal: 6 Jan 2025 (Telat 2 Hari)
  const tglKembaliTelat = new Date("2025-01-06");

  console.log(`   > Jatuh Tempo: ${tglJatuhTempo.toDateString()}`);
  console.log(`   > Dikembalikan: ${tglKembaliTelat.toDateString()}`);
  console.log(`   > Ekspektasi Telat: 2 Hari`);
  console.log(`   > Tarif Denda: 1000/hari`);

  // ACTION: Kembalikan Buku
  pnj.kembalikanBuku({ tgl_kembali: tglKembaliTelat });

  // --- ASSERTIONS ---

  // 1. Cek State & Status
  assert(
    pnj.getCurrent_State() === "Dikembalikan",
    "State State berubah ke 'Dikembalikan'"
  );
  assert(pnj.getStatus() === "Dikembalikan", "Status String berubah");

  // 2. Cek Perhitungan Denda di Peminjaman
  // Rumus: 2 hari * 1000 = 2000
  assert(
    pnj.getDenda() === 2000,
    `Denda Transaksi benar (Exp: 2000, Got: ${pnj.getDenda()})`
  );

  // 3. Cek Update Data Anggota (Siti)
  // OAL Logic: agt.Total_Denda = agt.Total_Denda + total_denda
  assert(
    siti.getTotal_Denda() === 2000,
    `Total Denda Siti terupdate (Exp: 2000, Got: ${siti.getTotal_Denda()})`
  );

  // ---------------------------------------------------
  // 5. GUARD CHECK (Invalid State)
  // ---------------------------------------------------
  header("SCENARIO 5: Invalid State Transition");

  try {
    console.log("   > Mencoba mengembalikan buku yang sudah kembali...");
    pnj.kembalikanBuku({ tgl_kembali: new Date() });
    assert(false, "Seharusnya Error, tapi malah lolos");
  } catch (e) {
    assert(
      true,
      "Berhasil menangkap Error: Buku sudah dikembalikan tidak bisa dikembalikan lagi."
    );
  }

  console.log("\n🎉 SEMUA TEST LULUS.");
} catch (e) {
  console.error("\n❌ TEST CRASHED:");
  console.error(e);
}
