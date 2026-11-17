/**
 * ===================================================================
 * MODUL DATA (js/data.js) — SIMAS-UPB
 * Mengelola state data mahasiswa dan persistensi ke Web LocalStorage.
 * Mendukung operasi CRUD, inisialisasi data contoh, serta ekspor CSV.
 * ===================================================================
 */

const KUNCI_STORAGE = "dataMahasiswaModular_v3";
const KUNCI_LAMA = "dataMahasiswaModular";

// Data awal/contoh untuk demonstrasi akademik resmi
export const DATA_CONTOH = [
  {
    nim: "312410470",
    nama: "Puput Novela",
    prodi: "Teknik Informatika",
    matkul: "Pemrograman Visual Desktop",
    nilai: 92
  },
  {
    nim: "312410001",
    nama: "Ayu Lestari",
    prodi: "Teknik Informatika",
    matkul: "Pemrograman Visual Desktop",
    nilai: 85
  },
  {
    nim: "312410015",
    nama: "Budi Santoso",
    prodi: "Sistem Informasi",
    matkul: "Basis Data Lanjut",
    nilai: 74
  },
  {
    nim: "312410042",
    nama: "Siti Rahmawati",
    prodi: "Teknik Informatika",
    matkul: "Pemrograman Visual Desktop",
    nilai: 65
  },
  {
    nim: "312410088",
    nama: "Rizky Pratama",
    prodi: "Teknik Industri",
    matkul: "Statistik Komputasi",
    nilai: 52
  },
  {
    nim: "312410103",
    nama: "Dewi Anggraini",
    prodi: "Sistem Informasi",
    matkul: "Rekayasa Perangkat Lunak",
    nilai: 40
  }
];

let daftarMahasiswa = [];

export function muatDariStorage() {
  try {
    let mentah = localStorage.getItem(KUNCI_STORAGE);
    if (!mentah) {
      mentah = localStorage.getItem("dataMahasiswaModular_v2") || localStorage.getItem(KUNCI_LAMA);
    }

    if (mentah) {
      const hasil = JSON.parse(mentah);
      if (Array.isArray(hasil) && hasil.length > 0) {
        daftarMahasiswa = hasil.map((m) => ({
          nim: String(m.nim || "").trim(),
          nama: String(m.nama || "").trim(),
          prodi: m.prodi || "Teknik Informatika",
          matkul: m.matkul || "Pemrograman Visual Desktop",
          nilai: Number(m.nilai || 0)
        }));
        return daftarMahasiswa;
      }
    }
  } catch (error) {
    console.warn("Gagal membaca localStorage:", error);
  }

  daftarMahasiswa = JSON.parse(JSON.stringify(DATA_CONTOH));
  simpanKeStorage();
  return daftarMahasiswa;
}

export function simpanKeStorage() {
  try {
    localStorage.setItem(KUNCI_STORAGE, JSON.stringify(daftarMahasiswa));
  } catch (error) {
    console.warn("localStorage tidak dapat digunakan:", error);
  }
}

export function ambilSemuaMahasiswa() {
  return daftarMahasiswa;
}

export function ambilMahasiswaByNim(nim) {
  return daftarMahasiswa.find((m) => m.nim === String(nim).trim()) || null;
}

export function tambahData(mahasiswa) {
  daftarMahasiswa.push({
    nim: String(mahasiswa.nim).trim(),
    nama: String(mahasiswa.nama).trim(),
    prodi: mahasiswa.prodi || "Teknik Informatika",
    matkul: mahasiswa.matkul || "Pemrograman Visual Desktop",
    nilai: Number(mahasiswa.nilai)
  });
  simpanKeStorage();
  return true;
}

export function ubahData(nim, nama, prodi, matkul, nilai) {
  const m = daftarMahasiswa.find((item) => item.nim === String(nim).trim());
  if (!m) return false;

  m.nama = String(nama).trim();
  m.prodi = prodi || m.prodi;
  m.matkul = matkul || m.matkul;
  m.nilai = Number(nilai);

  simpanKeStorage();
  return true;
}

export function hapusData(nim) {
  const index = daftarMahasiswa.findIndex((m) => m.nim === String(nim).trim());
  if (index !== -1) {
    daftarMahasiswa.splice(index, 1);
    simpanKeStorage();
    return true;
  }
  return false;
}

export function hapusSemuaData() {
  daftarMahasiswa = [];
  simpanKeStorage();
}

export function resetKeDataContoh() {
  daftarMahasiswa = JSON.parse(JSON.stringify(DATA_CONTOH));
  simpanKeStorage();
  return daftarMahasiswa;
}

export function eksporKeCSV(daftar = daftarMahasiswa, fungsiEvaluasi) {
  if (!daftar || daftar.length === 0) {
    throw new Error("Tidak ada data mahasiswa untuk diekspor.");
  }

  const header = ["No", "NIM", "Nama Lengkap", "Program Studi", "Mata Kuliah", "Nilai Angka", "Grade", "Bobot", "Predikat", "Status Kelulusan"];
  const baris = [header.join(",")];

  daftar.forEach((m, i) => {
    const ev = fungsiEvaluasi ? fungsiEvaluasi(m.nilai) : { grade: "-", bobot: 0, predikat: "-", status: "-" };
    const row = [
      i + 1,
      `"${m.nim}"`,
      `"${m.nama.replace(/"/g, '""')}"`,
      `"${m.prodi.replace(/"/g, '""')}"`,
      `"${(m.matkul || "Pemrograman Visual Desktop").replace(/"/g, '""')}"`,
      m.nilai,
      `"${ev.grade}"`,
      ev.bobot.toFixed(1),
      `"${ev.predikat}"`,
      `"${ev.status}"`
    ];
    baris.push(row.join(","));
  });

  const kontenCSV = "\uFEFF" + baris.join("\r\n");
  const blob = new Blob([kontenCSV], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const tautan = document.createElement("a");
  tautan.href = url;
  const tanggal = new Date().toISOString().slice(0, 10);
  tautan.download = `SIMAS_UPB_Rekap_Nilai_${tanggal}.csv`;
  document.body.appendChild(tautan);
  tautan.click();
  document.body.removeChild(tautan);
  URL.revokeObjectURL(url);
}
