// ============================================================================
// Generated TypeScript Code
// System: Sistem Informasi Perpustakaan Digital
// Version: 1.0-lib-test
// Generated: 2025-12-28T14:11:00.248Z
// ============================================================================

// ============================================================================
// RUNTIME STANDARD LIBRARY
// External Entities Implementation (Shlaer-Mellor Rule 20)
// Only includes entities that are actually used in the model
// ============================================================================

/**
 * External Entity: Logging (LOG)
 * System Logger
 */
class LOG {
  /**
   * LogInfo
   * @param message - string
   * @returns void
   */
  static LogInfo(params: { message: string }): void {
    console.log(`[INFO]: ${params.message}`);
  }
}

/**
 * External Entity: Timer (TIM)
 * Time Utility
 */
class TIM {
  /**
   * current_time
   * @returns date
   */
  static current_time(_params?: any): Date {
    return new Date();
  }

  /**
   * get_days_diff
   * @param date1 - date
   * @param date2 - date
   * @returns integer
   */
  static get_days_diff(params?: any): number {
    // Calculate difference in days between two dates
    const date1 = new Date(params.date1);
    const date2 = new Date(params.date2);
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return date2 > date1 ? diffDays : -diffDays;
  }
}

// Type Definitions
type inst_ref<T> = T | null; // Instance reference (nullable)
type inst_ref_set<T> = T[]; // Instance reference set (array)
type unique_ID = string;
type judul_buku = string;
type status_pinjam = string;
type jumlah = number;
type tanggal = Date;
type PeminjamanState = "Dipinjam" | "Dikembalikan";

interface PNJ1EventParams {
  tgl_kembali: Date;
}

export class Anggota {
  public Anggota_ID: unique_ID;
  public Nama: string;
  public Email: string;
  public Total_Denda: number;
  public peminjamanList: inst_ref_set<Peminjaman>;

  constructor(
    Anggota_ID: unique_ID,
    Nama: string,
    Email: string,
    Total_Denda: number
  ) {
    this.Anggota_ID = Anggota_ID;
    this.Nama = Nama;
    this.Email = Email;
    this.Total_Denda = Total_Denda;
    this.peminjamanList = [];
  }

  getAnggota_ID(): unique_ID {
    return this.Anggota_ID;
  }

  getNama(): string {
    return this.Nama;
  }

  getEmail(): string {
    return this.Email;
  }

  getTotal_Denda(): number {
    return this.Total_Denda;
  }

  setNama(Nama: string): void {
    this.Nama = Nama;
  }

  setEmail(Email: string): void {
    this.Email = Email;
  }

  setTotal_Denda(Total_Denda: number): void {
    this.Total_Denda = Total_Denda;
  }

  getPeminjamanList(): Peminjaman[] {
    return this.peminjamanList;
  }

  addPeminjaman(item: Peminjaman): void {
    if (this.peminjamanList.indexOf(item) === -1) {
      this.peminjamanList.push(item);
    }
  }

  removePeminjaman(item: Peminjaman): void {
    const index = this.peminjamanList.indexOf(item);
    if (index > -1) {
      this.peminjamanList.splice(index, 1);
    }
  }
}

export class Buku {
  public Buku_ID: unique_ID;
  public Judul: string;
  public Stok: number;
  public peminjamanList: inst_ref_set<Peminjaman>;

  constructor(Buku_ID: unique_ID, Judul: string, Stok: number) {
    this.Buku_ID = Buku_ID;
    this.Judul = Judul;
    this.Stok = Stok;
    this.peminjamanList = [];
  }

  getBuku_ID(): unique_ID {
    return this.Buku_ID;
  }

  getJudul(): string {
    return this.Judul;
  }

  getStok(): number {
    return this.Stok;
  }

  setJudul(Judul: string): void {
    this.Judul = Judul;
  }

  setStok(Stok: number): void {
    this.Stok = Stok;
  }

  getPeminjamanList(): Peminjaman[] {
    return this.peminjamanList;
  }

  addPeminjaman(item: Peminjaman): void {
    if (this.peminjamanList.indexOf(item) === -1) {
      this.peminjamanList.push(item);
    }
  }

  removePeminjaman(item: Peminjaman): void {
    const index = this.peminjamanList.indexOf(item);
    if (index > -1) {
      this.peminjamanList.splice(index, 1);
    }
  }
}

export class Peminjaman {
  public Pinjam_ID: unique_ID;
  public Current_State: PeminjamanState;
  public Anggota_ID: unique_ID | null;
  public Buku_ID: unique_ID | null;
  public Tgl_Pinjam: Date;
  public Tgl_Harus_Kembali: Date;
  public Status: status_pinjam;
  public Denda: number;
  public anggota: inst_ref<Anggota>;
  public buku: inst_ref<Buku>;

  constructor(
    Pinjam_ID: unique_ID,
    Current_State: PeminjamanState,
    Tgl_Pinjam: Date,
    Tgl_Harus_Kembali: Date,
    Status: status_pinjam,
    Denda: number,
    Anggota_ID?: unique_ID,
    Buku_ID?: unique_ID
  ) {
    this.Pinjam_ID = Pinjam_ID;
    this.Current_State = Current_State;
    this.Anggota_ID = Anggota_ID || null;
    this.Buku_ID = Buku_ID || null;
    this.Tgl_Pinjam = Tgl_Pinjam;
    this.Tgl_Harus_Kembali = Tgl_Harus_Kembali;
    this.Status = Status;
    this.Denda = Denda;
    this.anggota = null;
    this.buku = null;
  }

  getPinjam_ID(): unique_ID {
    return this.Pinjam_ID;
  }

  getCurrent_State(): PeminjamanState {
    return this.Current_State;
  }

  getAnggota_ID(): unique_ID | null {
    return this.Anggota_ID;
  }

  getBuku_ID(): unique_ID | null {
    return this.Buku_ID;
  }

  getTgl_Pinjam(): Date {
    return this.Tgl_Pinjam;
  }

  getTgl_Harus_Kembali(): Date {
    return this.Tgl_Harus_Kembali;
  }

  getStatus(): status_pinjam {
    return this.Status;
  }

  getDenda(): number {
    return this.Denda;
  }

  setCurrent_State(Current_State: PeminjamanState): void {
    this.Current_State = Current_State;
  }

  setAnggota_ID(Anggota_ID: unique_ID): void {
    this.Anggota_ID = Anggota_ID;
  }

  setBuku_ID(Buku_ID: unique_ID): void {
    this.Buku_ID = Buku_ID;
  }

  setTgl_Pinjam(Tgl_Pinjam: Date): void {
    this.Tgl_Pinjam = Tgl_Pinjam;
  }

  setTgl_Harus_Kembali(Tgl_Harus_Kembali: Date): void {
    this.Tgl_Harus_Kembali = Tgl_Harus_Kembali;
  }

  setStatus(Status: status_pinjam): void {
    this.Status = Status;
  }

  setDenda(Denda: number): void {
    this.Denda = Denda;
  }

  getAnggota(): Anggota | null {
    return this.anggota;
  }

  setAnggota(item: Anggota): void {
    this.anggota = item;
  }

  getBuku(): Buku | null {
    return this.buku;
  }

  setBuku(item: Buku): void {
    this.buku = item;
  }

  kembalikanBuku(params: PNJ1EventParams): void {
    if (this.Current_State === "Dipinjam") {
      this.Current_State = "Dikembalikan";
      let selisih = TIM.get_days_diff({
        date1: this.Tgl_Harus_Kembali,
        date2: params.tgl_kembali,
      });
      let denda_per_hari = 1000;
      let total_denda = 0;
      if (selisih > 0) {
        total_denda = selisih * denda_per_hari;
        LOG.LogInfo({
          message: "Terlambat " + selisih + " hari. Denda: " + total_denda,
        });
      } else {
        LOG.LogInfo({ message: "Tepat waktu. Terima kasih." });
      }
      this.Denda = total_denda;
      this.Status = "Dikembalikan";
      let agt = this.getAnggota();
      if (agt !== null && agt !== undefined) {
        agt.Total_Denda = agt.Total_Denda + total_denda;
        LOG.LogInfo({
          message: "Total denda anggota diupdate: " + agt.Total_Denda,
        });
      }
      this.Current_State = "Dikembalikan";
    } else {
      throw new Error(`Invalid state transition from ${this.Current_State}`);
    }
  }
}
