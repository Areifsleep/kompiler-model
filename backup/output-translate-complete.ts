// ============================================================================
// COMPLETE xTUML MODEL TRANSLATION
// System: Sistem Informasi Akademik v3.0.0
// Generated from: model-lengkap(2).json
// ============================================================================

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
// PRIORITY 2: Independent Classes (No Dependencies)
// ============================================================================

/**
 * Class: Buku (BKU)
 * Independent class - can exist without MataKuliah
 * Part of R7 Aggregation relationship
 */
class Buku {
  private BKU_ID: UniqueID;
  private ISBN: string;
  private Judul: string;
  private Pengarang: string;

  // Navigation: R7 - digunakan oleh MataKuliah (Many-to-Many via ReferensiBuku)
  private referensiList: ReferensiBuku[] = [];

  constructor(
    BKU_ID: UniqueID,
    ISBN: string,
    Judul: string,
    Pengarang: string
  ) {
    this.BKU_ID = BKU_ID;
    this.ISBN = ISBN;
    this.Judul = Judul;
    this.Pengarang = Pengarang;
  }

  // Getters
  getBukuID(): UniqueID {
    return this.BKU_ID;
  }

  getISBN(): string {
    return this.ISBN;
  }

  getJudul(): string {
    return this.Judul;
  }

  getPengarang(): string {
    return this.Pengarang;
  }

  // R7 Navigation
  getReferensiList(): ReferensiBuku[] {
    return this.referensiList;
  }

  addReferensi(referensi: ReferensiBuku): void {
    if (this.referensiList.indexOf(referensi) === -1) {
      this.referensiList.push(referensi);
    }
  }

  removeReferensi(referensi: ReferensiBuku): void {
    const index = this.referensiList.indexOf(referensi);
    if (index > -1) {
      this.referensiList.splice(index, 1);
    }
  }

  getMataKuliahList(): MataKuliah[] {
    return this.referensiList.map((ref) => ref.getMataKuliah());
  }

  // Setters
  setISBN(isbn: string): void {
    this.ISBN = isbn;
  }

  setJudul(judul: string): void {
    this.Judul = judul;
  }

  setPengarang(pengarang: string): void {
    this.Pengarang = pengarang;
  }
}

/**
 * Class: Ruangan (RNG)
 * Independent class - no relationship dependencies
 */
class Ruangan {
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
    if (this.jadwalList.indexOf(jadwal) === -1) {
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
// PRIORITY 3: Base Classes (Supertype - R1)
// ============================================================================

/**
 * Class: Person (PRS)
 * Base class untuk Mahasiswa dan Dosen
 * Relationship: R1 (Supertype/Generalization)
 * Relationship: R6 (Composition with Alamat)
 */
class Person {
  private Person_ID: UniqueID;
  private Nama: NamaOrang;
  private Email: string;

  // Navigation: R6 - Person memiliki Alamat (One-to-One Composition)
  private alamat: Alamat | null = null;

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

  // R6 Navigation (Composition)
  getAlamat(): Alamat | null {
    return this.alamat;
  }

  setAlamat(alamat: Alamat): void {
    this.alamat = alamat;
    alamat.setPerson(this);
  }

  // Composition: When Person is deleted, Alamat should also be deleted
  delete(): void {
    if (this.alamat) {
      // Delete composed Alamat
      this.alamat = null;
    }
  }

  // Setters
  setNama(nama: NamaOrang): void {
    this.Nama = nama;
  }

  setEmail(email: string): void {
    this.Email = email;
  }
}

/**
 * Class: Alamat (ALM)
 * Composition component - cannot exist without Person
 * Relationship: R6 (Composition - owned by Person)
 */
class Alamat {
  private ALM_ID: UniqueID;
  private Person_ID: UniqueID; // R6: Foreign key to Person (Mandatory)
  private Jalan: string;
  private Kota: string;
  private KodePos: string;

  // Navigation: R6 - dimiliki oleh Person (mandatory)
  private person: Person | null = null;

  constructor(
    ALM_ID: UniqueID,
    Person_ID: UniqueID,
    Jalan: string,
    Kota: string,
    KodePos: string
  ) {
    this.ALM_ID = ALM_ID;
    this.Person_ID = Person_ID;
    this.Jalan = Jalan;
    this.Kota = Kota;
    this.KodePos = KodePos;
  }

  // Getters
  getAlamatID(): UniqueID {
    return this.ALM_ID;
  }

  getPersonID(): UniqueID {
    return this.Person_ID;
  }

  getJalan(): string {
    return this.Jalan;
  }

  getKota(): string {
    return this.Kota;
  }

  getKodePos(): string {
    return this.KodePos;
  }

  // R6 Navigation
  getPerson(): Person {
    if (!this.person) {
      throw new Error("Alamat must be owned by a Person (Composition)");
    }
    return this.person;
  }

  setPerson(person: Person): void {
    this.person = person;
    this.Person_ID = person.getPersonID();
  }

  // Setters
  setJalan(jalan: string): void {
    this.Jalan = jalan;
  }

  setKota(kota: string): void {
    this.Kota = kota;
  }

  setKodePos(kodePos: string): void {
    this.KodePos = kodePos;
  }
}

// ============================================================================
// PRIORITY 4: Subtype Classes (Inheritance - R1)
// ============================================================================

/**
 * Class: Mahasiswa (MHS)
 * Subtype of Person (R1 - Generalization)
 * Has state model with lifecycle management
 * Relationship: R8 (Reflexive - Self-referencing Mentoring)
 */
class Mahasiswa extends Person {
  private MHS_ID: UniqueID;
  private NIM: string;
  private Current_State: MahasiswaState;
  private Mentor_MHS_ID: UniqueID | null = null; // R8: Foreign key to Mentor (Self-referencing)

  // Navigation: R2 - Mahasiswa mengambil MataKuliah (Many-to-Many via KRS)
  private krsList: KRS[] = [];

  // Navigation: R8 - Reflexive Mentoring (Self-referencing)
  private mentor: Mahasiswa | null = null; // Senior yang membimbing
  private mentees: Mahasiswa[] = []; // Junior yang dibimbing

  constructor(
    MHS_ID: UniqueID,
    Person_ID: UniqueID,
    Nama: NamaOrang,
    Email: string,
    NIM: string
  ) {
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

  getMentorMahasiswaID(): UniqueID | null {
    return this.Mentor_MHS_ID;
  }

  // R2 Navigation
  getKRSList(): KRS[] {
    return this.krsList;
  }

  addKRS(krs: KRS): void {
    if (this.krsList.indexOf(krs) === -1) {
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

  // R8 Navigation (Reflexive - Self-referencing)
  getMentor(): Mahasiswa | null {
    return this.mentor;
  }

  setMentor(mentor: Mahasiswa): void {
    this.mentor = mentor;
    this.Mentor_MHS_ID = mentor.getMahasiswaID();
    mentor.addMentee(this);
  }

  removeMentor(): void {
    if (this.mentor) {
      this.mentor.removeMentee(this);
      this.mentor = null;
      this.Mentor_MHS_ID = null;
    }
  }

  getMentees(): Mahasiswa[] {
    return this.mentees;
  }

  addMentee(mentee: Mahasiswa): void {
    if (this.mentees.indexOf(mentee) === -1) {
      this.mentees.push(mentee);
    }
  }

  removeMentee(mentee: Mahasiswa): void {
    const index = this.mentees.indexOf(mentee);
    if (index > -1) {
      this.mentees.splice(index, 1);
    }
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
      console.log(`Mahasiswa aktif kembali pada ${params.tanggalAktif}`);
      this.Current_State = "Aktif";
    } else {
      throw new Error(
        `Cannot aktifkanKembali from state ${this.Current_State}`
      );
    }
  }

  /**
   * Event: MHS3 - Dinyatakan Lulus
   * Transition: Aktif -> Lulus
   */
  dinyatakanLulus(params: MHS3EventParams): void {
    if (this.Current_State === "Aktif") {
      // Entry Action State Lulus
      console.log(`Mahasiswa telah lulus pada ${params.tanggalLulus}`);
      this.Current_State = "Lulus";
    } else {
      throw new Error(
        `Cannot dinyatakanLulus from state ${this.Current_State}`
      );
    }
  }

  // Setters
  setNIM(nim: string): void {
    this.NIM = nim;
  }
}

/**
 * Class: Dosen (DSN)
 * Subtype of Person (R1 - Generalization)
 */
class Dosen extends Person {
  private DSN_ID: UniqueID;
  private NIP: string;
  private Current_State: DosenState;

  // Navigation: R3 - Dosen mengajar MataKuliah (One-to-Many)
  private mataKuliahList: MataKuliah[] = [];

  constructor(
    DSN_ID: UniqueID,
    Person_ID: UniqueID,
    Nama: NamaOrang,
    Email: string,
    NIP: string
  ) {
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
    if (this.mataKuliahList.indexOf(mk) === -1) {
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
// PRIORITY 5: Classes with Relationships
// ============================================================================

/**
 * Class: MataKuliah (MK)
 * Relationships:
 * - R3: Dosen mengajar MataKuliah (Many-to-One)
 * - R2: Mahasiswa mengambil MataKuliah via KRS (Many-to-Many)
 * - R4: MataKuliah memiliki Jadwal (One-to-Many)
 * - R7: MataKuliah menggunakan Buku (Many-to-Many Aggregation via ReferensiBuku)
 */
class MataKuliah {
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

  // Navigation: R7 - menggunakan Buku (Aggregation - weak ownership)
  private referensiBukuList: ReferensiBuku[] = [];

  constructor(
    MK_ID: UniqueID,
    KodeMK: KodeMK,
    NamaMK: string,
    SKS: SKSType,
    DSN_ID: UniqueID
  ) {
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
    if (this.krsList.indexOf(krs) === -1) {
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
    if (this.jadwalList.indexOf(jadwal) === -1) {
      this.jadwalList.push(jadwal);
    }
  }

  removeJadwal(jadwal: Jadwal): void {
    const index = this.jadwalList.indexOf(jadwal);
    if (index > -1) {
      this.jadwalList.splice(index, 1);
    }
  }

  // R7 Navigation (Aggregation)
  getReferensiBukuList(): ReferensiBuku[] {
    return this.referensiBukuList;
  }

  addReferensiBuku(referensi: ReferensiBuku): void {
    if (this.referensiBukuList.indexOf(referensi) === -1) {
      this.referensiBukuList.push(referensi);
    }
  }

  removeReferensiBuku(referensi: ReferensiBuku): void {
    const index = this.referensiBukuList.indexOf(referensi);
    if (index > -1) {
      this.referensiBukuList.splice(index, 1);
    }
  }

  getBukuList(): Buku[] {
    return this.referensiBukuList.map((ref) => ref.getBuku());
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
class Jadwal {
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

  constructor(
    JDW_ID: UniqueID,
    MK_ID: UniqueID,
    RNG_ID: UniqueID,
    Hari: string,
    JamMulai: string,
    JamSelesai: string
  ) {
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
// PRIORITY 6: Association Classes (Many-to-Many)
// ============================================================================

/**
 * Class: KRS (Association Class)
 * Relationship: R2 - Mahasiswa mengambil MataKuliah
 * Formalizes Many-to-Many relationship between Mahasiswa and MataKuliah
 */
class KRS {
  private MHS_ID: UniqueID; // R2: Foreign key to Mahasiswa
  private MK_ID: UniqueID; // R2: Foreign key to MataKuliah
  private Semester: string;
  private Nilai: string;

  // Navigation: R2 references
  private mahasiswa: Mahasiswa | null = null;
  private mataKuliah: MataKuliah | null = null;

  constructor(
    MHS_ID: UniqueID,
    MK_ID: UniqueID,
    Semester: string,
    Nilai: string = ""
  ) {
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

/**
 * Class: ReferensiBuku (RFB) - Association Class
 * Relationship: R7 - MataKuliah menggunakan Buku (Aggregation)
 * Formalizes Many-to-Many Aggregation between MataKuliah and Buku
 */
class ReferensiBuku {
  private MK_ID: UniqueID; // R7: Foreign key to MataKuliah
  private BKU_ID: UniqueID; // R7: Foreign key to Buku
  private TipeReferensi: string; // e.g., "Utama", "Pendukung", "Referensi"

  // Navigation: R7 references
  private mataKuliah: MataKuliah | null = null;
  private buku: Buku | null = null;

  constructor(MK_ID: UniqueID, BKU_ID: UniqueID, TipeReferensi: string) {
    this.MK_ID = MK_ID;
    this.BKU_ID = BKU_ID;
    this.TipeReferensi = TipeReferensi;
  }

  // Getters
  getMataKuliahID(): UniqueID {
    return this.MK_ID;
  }

  getBukuID(): UniqueID {
    return this.BKU_ID;
  }

  getTipeReferensi(): string {
    return this.TipeReferensi;
  }

  // R7 Navigation
  getMataKuliah(): MataKuliah {
    if (!this.mataKuliah) {
      throw new Error("MataKuliah reference not set in ReferensiBuku");
    }
    return this.mataKuliah;
  }

  setMataKuliah(mk: MataKuliah): void {
    this.mataKuliah = mk;
    this.MK_ID = mk.getMataKuliahID();
    mk.addReferensiBuku(this);
  }

  getBuku(): Buku {
    if (!this.buku) {
      throw new Error("Buku reference not set in ReferensiBuku");
    }
    return this.buku;
  }

  setBuku(buku: Buku): void {
    this.buku = buku;
    this.BKU_ID = buku.getBukuID();
    buku.addReferensi(this);
  }

  // Setters
  setTipeReferensi(tipe: string): void {
    this.TipeReferensi = tipe;
  }
}
