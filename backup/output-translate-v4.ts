// ============================================================================
// Generated TypeScript Code
// System: Sistem Informasi Akademik - OAL Complete
// Version: 3.1.0-oal-bpal97
// Generated: 2025-12-28T06:06:44.561Z
// ============================================================================

// ============================================================================
// RUNTIME STANDARD LIBRARY
// External Entities Implementation (Shlaer-Mellor Rule 20)
// Only includes entities that are actually used in the model
// ============================================================================

/**
 * External Entity: Logging (LOG)
 * External Entity for logging operations
 */
class LOG {
  /**
   * Log informational message
   * @param message - string
   * @returns void
   */
  static LogInfo(params: { message: string }): void {
    console.log(`[INFO]: ${params.message}`);
  }

  /**
   * Log error message
   * @param message - string
   * @returns void
   */
  static LogError(params: { message: string }): void {
    console.error(`[ERROR]: ${params.message}`);
  }

}

/**
 * External Entity: Timer (TIM)
 * External Entity for timer operations
 */
class TIM {
  /**
   * Get current timestamp
   * @returns date
   */
  static current_time(params?: any): Date {
    return new Date();
  }

  /**
   * Start a timer
   * @param microseconds - integer
   * @param event_inst - inst_ref<Event>
   * @returns integer
   */
  static timer_start(params?: any): number {
    console.log(`[TIM]: Timer started for ${params.microseconds}μs`);
    const timerId = setTimeout(() => {
      console.log("[TIM]: Timer expired, generating event");
      // Event generation logic would go here
    }, params.microseconds / 1000);
    return timerId as unknown as number;
  }

}

// Type Definitions
type UniqueID = string;
type inst_ref<T> = T; // Instance reference type for events
type nama_orang = string;
type kode_mk = string;
type sks_type = number;
type tanggal = Date;
type state<MHS> = string;
type MahasiswaState = "Aktif" | "Cuti" | "Lulus";

interface MHS1EventParams {
  alasan: string;
}

interface MHS2EventParams {
  tanggalAktif: Date;
}

interface MHS3EventParams {
  tanggalLulus: Date;
}

export class Person {
  public Person_ID: UniqueID;
  public Nama: string;
  public Email: string;

  constructor(Person_ID: UniqueID, Nama: string, Email: string) {
    this.Person_ID = Person_ID;
    this.Nama = Nama;
    this.Email = Email;
  }

  getPerson_ID(): UniqueID {
    return this.Person_ID;
  }

  getNama(): string {
    return this.Nama;
  }

  getEmail(): string {
    return this.Email;
  }

  setNama(Nama: string): void {
    this.Nama = Nama;
  }

  setEmail(Email: string): void {
    this.Email = Email;
  }

}

export class MataKuliah {
  public MK_ID: UniqueID;
  public Kode: string;
  public Nama: string;
  public SKS: number;
  public kRSList: KRS[];

  constructor(MK_ID: UniqueID, Kode: string, Nama: string, SKS: number) {
    this.MK_ID = MK_ID;
    this.Kode = Kode;
    this.Nama = Nama;
    this.SKS = SKS;
    this.kRSList = [];
  }

  getMK_ID(): UniqueID {
    return this.MK_ID;
  }

  getKode(): string {
    return this.Kode;
  }

  getNama(): string {
    return this.Nama;
  }

  getSKS(): number {
    return this.SKS;
  }

  setKode(Kode: string): void {
    this.Kode = Kode;
  }

  setNama(Nama: string): void {
    this.Nama = Nama;
  }

  setSKS(SKS: number): void {
    this.SKS = SKS;
  }

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

}

export class LogCuti {
  public Log_ID: UniqueID;
  public MHS_ID: UniqueID;
  public Alasan: string;
  public Tanggal: Date;

  constructor(Log_ID: UniqueID, MHS_ID: UniqueID, Alasan: string, Tanggal: Date) {
    this.Log_ID = Log_ID;
    this.MHS_ID = MHS_ID;
    this.Alasan = Alasan;
    this.Tanggal = Tanggal;
  }

  getLog_ID(): UniqueID {
    return this.Log_ID;
  }

  getMHS_ID(): UniqueID {
    return this.MHS_ID;
  }

  getAlasan(): string {
    return this.Alasan;
  }

  getTanggal(): Date {
    return this.Tanggal;
  }

  setMHS_ID(MHS_ID: UniqueID): void {
    this.MHS_ID = MHS_ID;
  }

  setAlasan(Alasan: string): void {
    this.Alasan = Alasan;
  }

  setTanggal(Tanggal: Date): void {
    this.Tanggal = Tanggal;
  }

}

export class Wisuda {
  public Wisuda_ID: UniqueID;
  public MHS_ID: UniqueID;
  public Tanggal: Date;
  public IPK: number;

  constructor(Wisuda_ID: UniqueID, MHS_ID: UniqueID, Tanggal: Date, IPK: number) {
    this.Wisuda_ID = Wisuda_ID;
    this.MHS_ID = MHS_ID;
    this.Tanggal = Tanggal;
    this.IPK = IPK;
  }

  getWisuda_ID(): UniqueID {
    return this.Wisuda_ID;
  }

  getMHS_ID(): UniqueID {
    return this.MHS_ID;
  }

  getTanggal(): Date {
    return this.Tanggal;
  }

  getIPK(): number {
    return this.IPK;
  }

  setMHS_ID(MHS_ID: UniqueID): void {
    this.MHS_ID = MHS_ID;
  }

  setTanggal(Tanggal: Date): void {
    this.Tanggal = Tanggal;
  }

  setIPK(IPK: number): void {
    this.IPK = IPK;
  }

}

export class Mahasiswa extends Person {
  public MHS_ID: UniqueID;
  public NIM: string;
  public Current_State: MahasiswaState;
  public Total_SKS: number;
  public IPK: number;
  public person: Person | null;
  public kRSList: KRS[];

  constructor(Person_ID: UniqueID, Nama: string, Email: string, MHS_ID: UniqueID, NIM: string, Current_State: MahasiswaState, Total_SKS: number, IPK: number) {
    super(Person_ID, Nama, Email);
    this.MHS_ID = MHS_ID;
    this.NIM = NIM;
    this.Current_State = Current_State;
    this.Total_SKS = Total_SKS;
    this.IPK = IPK;
    this.person = null;
    this.kRSList = [];
  }

  getMHS_ID(): UniqueID {
    return this.MHS_ID;
  }

  getNIM(): string {
    return this.NIM;
  }

  getCurrent_State(): MahasiswaState {
    return this.Current_State;
  }

  getTotal_SKS(): number {
    return this.Total_SKS;
  }

  getIPK(): number {
    return this.IPK;
  }

  setCurrent_State(Current_State: MahasiswaState): void {
    this.Current_State = Current_State;
  }

  setTotal_SKS(Total_SKS: number): void {
    this.Total_SKS = Total_SKS;
  }

  setIPK(IPK: number): void {
    this.IPK = IPK;
  }

  getPerson(): Person | null {
    return this.person;
  }

  setPerson(item: Person | null): void {
    this.person = item;
  }

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

  ajukanCuti(params: MHS1EventParams): void {
    if (this.Current_State === "Aktif") {
      // OAL Demo: State Cuti - Complete BPAL97 Features
      // Parameter: params.alasan (string)
      // 1. Create instance (P2.1)
      let log_cuti = {} as LogCuti;
      log_cuti.MHS_ID = this.MHS_ID;
      log_cuti.Alasan = params.alasan;
      log_cuti.Tanggal = TIM.current_time();
      // 2. Select statements (P2.2)
      let person = this.getPerson();
      let krs_list = this.getKRSList();
      // 3. Conditional (P4.1)
      if (person !== null && person !== undefined && person.Email !== "") {
        LOG.LogInfo({ message: "Email notif ke: " + person.Email });
      } else if (person === null || person === undefined) {
        LOG.LogError({ message: "Person tidak ditemukan!" });
      } else {
        LOG.LogInfo({ message: "Email kosong, skip notifikasi" });
      }
      // 4. Iteration (P4.2)
      let total_sks = 0;
      for (const krs of krs_list) {
        if (krs.Status === "Diambil") {
          total_sks = total_sks + krs.SKS;
        }
      }
      this.Total_SKS = total_sks;
      // 5. Update state
      this.Current_State = "Cuti";
      LOG.LogInfo({ message: "Mahasiswa cuti. Total SKS: " + total_sks });
      this.Current_State = "Cuti";
    } else {
      throw new Error(`Invalid state transition from ${this.Current_State}`);
    }
  }

  aktifkanKembali(params: MHS2EventParams): void {
    if (this.Current_State === "Cuti") {
      // OAL Demo: State Aktif
      // 1. Basic assignment
      this.Current_State = "Aktif";
      this.Total_SKS = 0;
      // 2. Bridge invocation
      LOG.LogInfo({ message: "Mahasiswa baru aktif dengan NIM: " + this.NIM });
      // 3. Relationship navigation
      let person = this.getPerson();
      if (person !== null && person !== undefined) {
        LOG.LogInfo({ message: "Nama: " + person.Nama });
      }
      this.Current_State = "Aktif";
    } else {
      throw new Error(`Invalid state transition from ${this.Current_State}`);
    }
  }

  dinyatakanLulus(params: MHS3EventParams): void {
    if (this.Current_State === "Aktif") {
      // OAL Demo: State Lulus - Graduate Logic
      // Parameter: params.tanggalLulus (date)
      // 1. Query all KRS (P2.2)
      let krs_completed = this.getKRSList().filter(selected => selected.Status === "Lulus");
      // 2. Calculate final statistics (P4.2)
      let total_nilai = 0;
      let total_sks = 0;
      for (const krs of krs_completed) {
        // ✅ BENAR: Deklarasikan variabel di awal loop
        let nilai_angka = 0;
        // Convert grade to points
        if (krs.Nilai === "A") {
          nilai_angka = 4;
        } else if (krs.Nilai === "B") {
          nilai_angka = 3;
        } else if (krs.Nilai === "C") {
          nilai_angka = 2;
        } else {
          nilai_angka = 1;
        }
        total_nilai = total_nilai + (nilai_angka * krs.SKS);
        total_sks = total_sks + krs.SKS;
      }
      // 3. Calculate GPA
      if (total_sks > 0) {
        let ipk = total_nilai / total_sks;
        this.IPK = ipk;
        this.Total_SKS = total_sks;
      } else {
        this.IPK = 0.0;
      }
      // 4. Create graduation record
      let wisuda = {} as Wisuda;
      wisuda.MHS_ID = this.MHS_ID;
      wisuda.Tanggal = params.tanggalLulus;
      wisuda.IPK = this.IPK;
      // 5. Update state
      this.Current_State = "Lulus";
      LOG.LogInfo({ message: "Mahasiswa lulus! IPK: " + this.IPK + ", Total SKS: " + total_sks });
      // 6. Notify related entities
      let person = this.getPerson();
      if (person !== null && person !== undefined) {
        LOG.LogInfo({ message: "Selamat kepada " + person.Nama + " yang telah lulus!" });
      }
      this.Current_State = "Lulus";
    } else {
      throw new Error(`Invalid state transition from ${this.Current_State}`);
    }
  }

}

export class KRS {
  public KRS_ID: UniqueID;
  public MHS_ID: UniqueID | null;
  public MK_ID: UniqueID | null;
  public Semester: number;
  public Nilai: string;
  public Status: string;
  public SKS: number;
  public mahasiswa: Mahasiswa | null;
  public mataKuliah: MataKuliah | null;

  constructor(KRS_ID: UniqueID, Semester: number, Nilai: string, Status: string, SKS: number, MHS_ID?: UniqueID, MK_ID?: UniqueID) {
    this.KRS_ID = KRS_ID;
    this.MHS_ID = MHS_ID || null;
    this.MK_ID = MK_ID || null;
    this.Semester = Semester;
    this.Nilai = Nilai;
    this.Status = Status;
    this.SKS = SKS;
    this.mahasiswa = null;
    this.mataKuliah = null;
  }

  getKRS_ID(): UniqueID {
    return this.KRS_ID;
  }

  getMHS_ID(): UniqueID | null {
    return this.MHS_ID;
  }

  getMK_ID(): UniqueID | null {
    return this.MK_ID;
  }

  getSemester(): number {
    return this.Semester;
  }

  getNilai(): string {
    return this.Nilai;
  }

  getStatus(): string {
    return this.Status;
  }

  getSKS(): number {
    return this.SKS;
  }

  setMHS_ID(MHS_ID: UniqueID): void {
    this.MHS_ID = MHS_ID;
  }

  setMK_ID(MK_ID: UniqueID): void {
    this.MK_ID = MK_ID;
  }

  setSemester(Semester: number): void {
    this.Semester = Semester;
  }

  setNilai(Nilai: string): void {
    this.Nilai = Nilai;
  }

  setStatus(Status: string): void {
    this.Status = Status;
  }

  setSKS(SKS: number): void {
    this.SKS = SKS;
  }

  getMahasiswa(): Mahasiswa | null {
    return this.mahasiswa;
  }

  setMahasiswa(item: Mahasiswa): void {
    this.mahasiswa = item;
  }

  getMataKuliah(): MataKuliah | null {
    return this.mataKuliah;
  }

  setMataKuliah(item: MataKuliah): void {
    this.mataKuliah = item;
  }

}

