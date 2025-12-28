// ============================================================================
// PRIORITY 1: Type Definitions & Enums
// ============================================================================

type UniqueID = string;
type NamaOrang = string;
type KodeMK = string;
type SKSType = number;
type Tanggal = Date;

// State types untuk Mahasiswa
type MahasiswaState = "Aktif" | "Cuti" | "Lulus";

// State types untuk Dosen
type DosenState = string;

// Event parameter types
interface MHS1EventParams {
  alasan: string;
}

interface MHS2EventParams {
  tanggalAktif: Tanggal;
}

interface MHS3EventParams {
  tanggalLulus: Tanggal;
}

// ============================================================================
// PRIORITY 3: Base Classes (Supertype - No Dependencies)
// ============================================================================

/**
 * Class: Person (PRS)
 * Base class untuk Mahasiswa dan Dosen
 * Relationship: R1 (Supertype)
 */
export class Person {
  private Person_ID: UniqueID;
  private Nama: NamaOrang;
  private Email: string;

  constructor(Person_ID: UniqueID, Nama: NamaOrang, Email: string) {
    this.Person_ID = Person_ID;
    this.Nama = Nama;
    this.Email = Email;
  }

  // Getters
  getPersonID(): UniqueID {
    return this.Person_ID;
  }

  getNama(): NamaOrang {
    return this.Nama;
  }

  getEmail(): string {
    return this.Email;
  }

  // Setters
  setNama(nama: NamaOrang): void {
    this.Nama = nama;
  }

  setEmail(email: string): void {
    this.Email = email;
  }
}

// ============================================================================
// PRIORITY 4: Independent Classes (No Foreign Keys or Dependencies)
// ============================================================================

/**
 * Class: Ruangan (RNG)
 * Independent class - no relationships dependencies
 */
export class Ruangan {
  private RNG_ID: UniqueID;
  private NamaRuangan: string;
  private Kapasitas: SKSType;

  // Navigation: R5 - Ruangan digunakan untuk Jadwal (One-to-Many)
  private jadwalList: Jadwal[] = [];

  constructor(RNG_ID: UniqueID, NamaRuangan: string, Kapasitas: SKSType) {
    this.RNG_ID = RNG_ID;
    this.NamaRuangan = NamaRuangan;
    this.Kapasitas = Kapasitas;
  }

  // Getters
  getRuanganID(): UniqueID {
    return this.RNG_ID;
  }

  getNamaRuangan(): string {
    return this.NamaRuangan;
  }

  getKapasitas(): SKSType {
    return this.Kapasitas;
  }

  // R5 Navigation
  getJadwalList(): Jadwal[] {
    return this.jadwalList;
  }

  addJadwal(jadwal: Jadwal): void {
    if (!this.jadwalList.includes(jadwal)) {
      this.jadwalList.push(jadwal);
    }
  }

  removeJadwal(jadwal: Jadwal): void {
    const index = this.jadwalList.indexOf(jadwal);
    if (index > -1) {
      this.jadwalList.splice(index, 1);
    }
  }

  // Setters
  setNamaRuangan(nama: string): void {
    this.NamaRuangan = nama;
  }

  setKapasitas(kapasitas: SKSType): void {
    this.Kapasitas = kapasitas;
  }
}

// ============================================================================
// PRIORITY 5: Subtype Classes (Inheritance - R1)
// ============================================================================

/**
 * Class: Mahasiswa (MHS)
 * Subtype of Person (R1)
 * Has state model with lifecycle management
 */
export class Mahasiswa extends Person {
  private MHS_ID: UniqueID;
  private NIM: string;
  private Current_State: MahasiswaState;

  // Navigation: R2 - Mahasiswa mengambil MataKuliah (Many-to-Many via KRS)
  private krsList: KRS[] = [];

  constructor(MHS_ID: UniqueID, Person_ID: UniqueID, Nama: NamaOrang, Email: string, NIM: string) {
    super(Person_ID, Nama, Email);
    this.MHS_ID = MHS_ID;
    this.NIM = NIM;
    this.Current_State = "Aktif"; // Initial state
  }

  // Getters
  getMahasiswaID(): UniqueID {
    return this.MHS_ID;
  }

  getNIM(): string {
    return this.NIM;
  }

  getCurrentState(): MahasiswaState {
    return this.Current_State;
  }

  // R2 Navigation
  getKRSList(): KRS[] {
    return this.krsList;
  }

  addKRS(krs: KRS): void {
    if (!this.krsList.includes(krs)) {
      this.krsList.push(krs);
    }
  }

  removeKRS(krs: KRS): void {
    const index = this.krsList.indexOf(krs);
    if (index > -1) {
      this.krsList.splice(index, 1);
    }
  }

  getMataKuliahList(): MataKuliah[] {
    return this.krsList.map((krs) => krs.getMataKuliah());
  }

  // State Model Events

  /**
   * Event: MHS1 - Ajukan Cuti
   * Transition: Aktif -> Cuti
   */
  ajukanCuti(params: MHS1EventParams): void {
    if (this.Current_State === "Aktif") {
      // Entry Action State Cuti
      console.log(`Mahasiswa cuti: ${params.alasan}`);
      this.Current_State = "Cuti";
    } else {
      throw new Error(`Cannot ajukanCuti from state ${this.Current_State}`);
    }
  }

  /**
   * Event: MHS2 - Aktifkan Kembali
   * Transition: Cuti -> Aktif
   */
  aktifkanKembali(params: MHS2EventParams): void {
    if (this.Current_State === "Cuti") {
      // Entry Action State Aktif
      this.Current_State = "Aktif";
    } else {
      throw new Error(`Cannot aktifkanKembali from state ${this.Current_State}`);
    }
  }

  /**
   * Event: MHS3 - Dinyatakan Lulus
   * Transition: Aktif -> Lulus
   */
  dinyatakanLulus(params: MHS3EventParams): void {
    if (this.Current_State === "Aktif") {
      // Entry Action State Lulus

      console.log("Mahasiswa telah lulus.");
      this.Current_State = "Lulus";
    } else {
      throw new Error(`Cannot dinyatakanLulus from state ${this.Current_State}`);
    }
  }

  // Setters
  setNIM(nim: string): void {
    this.NIM = nim;
  }
}

/**
 * Class: Dosen (DSN)
 * Subtype of Person (R1)
 */
export class Dosen extends Person {
  private DSN_ID: UniqueID;
  private NIP: string;
  private Current_State: DosenState;

  // Navigation: R3 - Dosen mengajar MataKuliah (One-to-Many)
  private mataKuliahList: MataKuliah[] = [];

  constructor(DSN_ID: UniqueID, Person_ID: UniqueID, Nama: NamaOrang, Email: string, NIP: string) {
    super(Person_ID, Nama, Email);
    this.DSN_ID = DSN_ID;
    this.NIP = NIP;
    this.Current_State = "";
  }

  // Getters
  getDosenID(): UniqueID {
    return this.DSN_ID;
  }

  getNIP(): string {
    return this.NIP;
  }

  getCurrentState(): DosenState {
    return this.Current_State;
  }

  // R3 Navigation
  getMataKuliahList(): MataKuliah[] {
    return this.mataKuliahList;
  }

  addMataKuliah(mk: MataKuliah): void {
    if (!this.mataKuliahList.includes(mk)) {
      this.mataKuliahList.push(mk);
      mk.setDosen(this);
    }
  }

  removeMataKuliah(mk: MataKuliah): void {
    const index = this.mataKuliahList.indexOf(mk);
    if (index > -1) {
      this.mataKuliahList.splice(index, 1);
    }
  }

  // Setters
  setNIP(nip: string): void {
    this.NIP = nip;
  }

  setCurrentState(state: DosenState): void {
    this.Current_State = state;
  }
}

// ============================================================================
// PRIORITY 6: Classes with Simple Relationships (Foreign Keys)
// ============================================================================

/**
 * Class: MataKuliah (MK)
 * Relationships:
 * - R3: Dosen mengajar MataKuliah (Many-to-One)
 * - R2: Mahasiswa mengambil MataKuliah via KRS (Many-to-Many)
 * - R4: MataKuliah memiliki Jadwal (One-to-Many)
 */
export class MataKuliah {
  private MK_ID: UniqueID;
  private KodeMK: KodeMK;
  private NamaMK: string;
  private SKS: SKSType;
  private DSN_ID: UniqueID; // R3: Foreign key to Dosen

  // Navigation: R3 - diajar oleh Dosen
  private dosen: Dosen | null = null;

  // Navigation: R2 - diambil oleh Mahasiswa via KRS
  private krsList: KRS[] = [];

  // Navigation: R4 - memiliki Jadwal
  private jadwalList: Jadwal[] = [];

  constructor(MK_ID: UniqueID, KodeMK: KodeMK, NamaMK: string, SKS: SKSType, DSN_ID: UniqueID) {
    this.MK_ID = MK_ID;
    this.KodeMK = KodeMK;
    this.NamaMK = NamaMK;
    this.SKS = SKS;
    this.DSN_ID = DSN_ID;
  }

  // Getters
  getMataKuliahID(): UniqueID {
    return this.MK_ID;
  }

  getKodeMK(): KodeMK {
    return this.KodeMK;
  }

  getNamaMK(): string {
    return this.NamaMK;
  }

  getSKS(): SKSType {
    return this.SKS;
  }

  getDosenID(): UniqueID {
    return this.DSN_ID;
  }

  // R3 Navigation
  getDosen(): Dosen | null {
    return this.dosen;
  }

  setDosen(dosen: Dosen): void {
    this.dosen = dosen;
    this.DSN_ID = dosen.getDosenID();
  }

  // R2 Navigation
  getKRSList(): KRS[] {
    return this.krsList;
  }

  addKRS(krs: KRS): void {
    if (!this.krsList.includes(krs)) {
      this.krsList.push(krs);
    }
  }

  removeKRS(krs: KRS): void {
    const index = this.krsList.indexOf(krs);
    if (index > -1) {
      this.krsList.splice(index, 1);
    }
  }

  getMahasiswaList(): Mahasiswa[] {
    return this.krsList.map((krs) => krs.getMahasiswa());
  }

  // R4 Navigation
  getJadwalList(): Jadwal[] {
    return this.jadwalList;
  }

  addJadwal(jadwal: Jadwal): void {
    if (!this.jadwalList.includes(jadwal)) {
      this.jadwalList.push(jadwal);
    }
  }

  removeJadwal(jadwal: Jadwal): void {
    const index = this.jadwalList.indexOf(jadwal);
    if (index > -1) {
      this.jadwalList.splice(index, 1);
    }
  }

  // Setters
  setKodeMK(kode: KodeMK): void {
    this.KodeMK = kode;
  }

  setNamaMK(nama: string): void {
    this.NamaMK = nama;
  }

  setSKS(sks: SKSType): void {
    this.SKS = sks;
  }
}

/**
 * Class: Jadwal (JDW)
 * Relationships:
 * - R4: Mata Kuliah memiliki Jadwal (Many-to-One)
 * - R5: Ruangan digunakan untuk Jadwal (Many-to-One)
 */
export class Jadwal {
  private JDW_ID: UniqueID;
  private MK_ID: UniqueID; // R4: Foreign key to MataKuliah
  private RNG_ID: UniqueID; // R5: Foreign key to Ruangan
  private Hari: string;
  private JamMulai: string;
  private JamSelesai: string;

  // Navigation: R4 - untuk MataKuliah
  private mataKuliah: MataKuliah | null = null;

  // Navigation: R5 - menggunakan Ruangan
  private ruangan: Ruangan | null = null;

  constructor(JDW_ID: UniqueID, MK_ID: UniqueID, RNG_ID: UniqueID, Hari: string, JamMulai: string, JamSelesai: string) {
    this.JDW_ID = JDW_ID;
    this.MK_ID = MK_ID;
    this.RNG_ID = RNG_ID;
    this.Hari = Hari;
    this.JamMulai = JamMulai;
    this.JamSelesai = JamSelesai;
  }

  // Getters
  getJadwalID(): UniqueID {
    return this.JDW_ID;
  }

  getMataKuliahID(): UniqueID {
    return this.MK_ID;
  }

  getRuanganID(): UniqueID {
    return this.RNG_ID;
  }

  getHari(): string {
    return this.Hari;
  }

  getJamMulai(): string {
    return this.JamMulai;
  }

  getJamSelesai(): string {
    return this.JamSelesai;
  }

  // R4 Navigation
  getMataKuliah(): MataKuliah | null {
    return this.mataKuliah;
  }

  setMataKuliah(mk: MataKuliah): void {
    this.mataKuliah = mk;
    this.MK_ID = mk.getMataKuliahID();
    mk.addJadwal(this);
  }

  // R5 Navigation
  getRuangan(): Ruangan | null {
    return this.ruangan;
  }

  setRuangan(ruangan: Ruangan): void {
    this.ruangan = ruangan;
    this.RNG_ID = ruangan.getRuanganID();
    ruangan.addJadwal(this);
  }

  // Setters
  setHari(hari: string): void {
    this.Hari = hari;
  }

  setJamMulai(jam: string): void {
    this.JamMulai = jam;
  }

  setJamSelesai(jam: string): void {
    this.JamSelesai = jam;
  }
}

// ============================================================================
// PRIORITY 7: Association Classes (Many-to-Many)
// ============================================================================

/**
 * Class: KRS (Association Class)
 * Relationship: R2 - Mahasiswa mengambil MataKuliah
 * Formalizes Many-to-Many relationship between Mahasiswa and MataKuliah
 */
export class KRS {
  private MHS_ID: UniqueID; // R2: Foreign key to Mahasiswa
  private MK_ID: UniqueID; // R2: Foreign key to MataKuliah
  private Semester: string;
  private Nilai: string;

  // Navigation: R2 references
  private mahasiswa: Mahasiswa | null = null;
  private mataKuliah: MataKuliah | null = null;

  constructor(MHS_ID: UniqueID, MK_ID: UniqueID, Semester: string, Nilai: string = "") {
    this.MHS_ID = MHS_ID;
    this.MK_ID = MK_ID;
    this.Semester = Semester;
    this.Nilai = Nilai;
  }

  // Getters
  getMahasiswaID(): UniqueID {
    return this.MHS_ID;
  }

  getMataKuliahID(): UniqueID {
    return this.MK_ID;
  }

  getSemester(): string {
    return this.Semester;
  }

  getNilai(): string {
    return this.Nilai;
  }

  // R2 Navigation
  getMahasiswa(): Mahasiswa {
    if (!this.mahasiswa) {
      throw new Error("Mahasiswa reference not set in KRS");
    }
    return this.mahasiswa;
  }

  setMahasiswa(mahasiswa: Mahasiswa): void {
    this.mahasiswa = mahasiswa;
    this.MHS_ID = mahasiswa.getMahasiswaID();
    mahasiswa.addKRS(this);
  }

  getMataKuliah(): MataKuliah {
    if (!this.mataKuliah) {
      throw new Error("MataKuliah reference not set in KRS");
    }
    return this.mataKuliah;
  }

  setMataKuliah(mk: MataKuliah): void {
    this.mataKuliah = mk;
    this.MK_ID = mk.getMataKuliahID();
    mk.addKRS(this);
  }

  // Setters
  setSemester(semester: string): void {
    this.Semester = semester;
  }

  setNilai(nilai: string): void {
    this.Nilai = nilai;
  }
}

// ============================================================================
// Example Usage & Testing
// ============================================================================

// Example: Create instances and establish relationships
function exampleUsage() {
  // Create Dosen
  const dosen1 = new Dosen("DSN001", "PRS001", "Dr. Ahmad", "ahmad@university.ac.id", "197001011998031001");

  // Create MataKuliah
  const mk1 = new MataKuliah("MK001", "IF101", "Pemrograman Dasar", 3, "DSN001");
  mk1.setDosen(dosen1);

  // Create Mahasiswa
  const mhs1 = new Mahasiswa("MHS001", "PRS002", "Budi Santoso", "budi@student.ac.id", "2021110001");

  // Create KRS (Mahasiswa mengambil MataKuliah)
  const krs1 = new KRS("MHS001", "MK001", "2024/2025 Ganjil", "A");
  krs1.setMahasiswa(mhs1);
  krs1.setMataKuliah(mk1);

  // Create Ruangan
  const ruangan1 = new Ruangan("RNG001", "Lab Komputer 1", 40);

  // Create Jadwal
  const jadwal1 = new Jadwal("JDW001", "MK001", "RNG001", "Senin", "08:00", "10:00");
  jadwal1.setMataKuliah(mk1);
  jadwal1.setRuangan(ruangan1);

  // Test state transitions
  console.log(`Status Mahasiswa: ${mhs1.getCurrentState()}`); // Aktif
  mhs1.ajukanCuti({ alasan: "Sakit" });
  console.log(`Status Mahasiswa: ${mhs1.getCurrentState()}`); // Cuti
  mhs1.aktifkanKembali({ tanggalAktif: new Date() });
  console.log(`Status Mahasiswa: ${mhs1.getCurrentState()}`); // Aktif

  return {
    dosen: dosen1,
    mataKuliah: mk1,
    mahasiswa: mhs1,
    krs: krs1,
    ruangan: ruangan1,
    jadwal: jadwal1,
  };
}

exampleUsage();
