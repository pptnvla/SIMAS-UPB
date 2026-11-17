/**
 * ===================================================================
 * MODUL LOGIC (js/logic.js) — SIMAS-UPB
 * Mengelola aturan bisnis, konversi nilai akademik, validasi form,
 * algoritma filter & pencarian, pengurutan, serta statistik kumulatif.
 * ===================================================================
 */

export function validasiMahasiswa(nama, nim, nilai) {
  const namaBersih = String(nama || "").trim();
  const nimBersih = String(nim || "").trim();

  if (!namaBersih || !nimBersih || nilai === "" || nilai === null || nilai === undefined) {
    return "Semua bidang (NIM, Nama, Nilai) wajib diisi.";
  }

  if (namaBersih.length < 2) {
    return "Nama mahasiswa minimal terdiri dari 2 karakter.";
  }

  if (!/^\d+$/.test(nimBersih)) {
    return "NIM hanya boleh berisi karakter angka.";
  }

  if (nimBersih.length < 4 || nimBersih.length > 20) {
    return "NIM harus memiliki panjang antara 4 sampai 20 digit angka.";
  }

  const angkaNilai = Number(nilai);
  if (!Number.isFinite(angkaNilai) || angkaNilai < 0 || angkaNilai > 100) {
    return "Nilai harus berupa angka dalam rentang 0 sampai 100.";
  }

  return "";
}

export function nimSudahAda(daftar, nim, kecualiNim = null) {
  const nimTarget = String(nim).trim();
  return daftar.some((m) => m.nim === nimTarget && m.nim !== kecualiNim);
}

export function cekKelulusan(nilai) {
  return Number(nilai) >= 60 ? "Lulus" : "Belum Lulus";
}

export function evaluasiNilai(nilai) {
  const skor = Number(nilai);

  if (skor >= 85) {
    return {
      grade: "A",
      bobot: 4.0,
      status: "Lulus",
      predikat: "Sangat Memuaskan",
      kelasWarna: "grade-a"
    };
  } else if (skor >= 75) {
    return {
      grade: "B",
      bobot: 3.0,
      status: "Lulus",
      predikat: "Memuaskan",
      kelasWarna: "grade-b"
    };
  } else if (skor >= 60) {
    return {
      grade: "C",
      bobot: 2.0,
      status: "Lulus",
      predikat: "Cukup",
      kelasWarna: "grade-c"
    };
  } else if (skor >= 45) {
    return {
      grade: "D",
      bobot: 1.0,
      status: "Belum Lulus",
      predikat: "Kurang",
      kelasWarna: "grade-d"
    };
  } else {
    return {
      grade: "E",
      bobot: 0.0,
      status: "Belum Lulus",
      predikat: "Sangat Kurang",
      kelasWarna: "grade-e"
    };
  }
}

export function saringMahasiswa(daftar, { kataKunci = "", status = "semua", prodi = "semua", grade = "semua" } = {}) {
  const kunci = kataKunci.trim().toLowerCase();

  return daftar.filter((m) => {
    const cocokKunci =
      !kunci ||
      m.nama.toLowerCase().includes(kunci) ||
      m.nim.toLowerCase().includes(kunci) ||
      (m.matkul && m.matkul.toLowerCase().includes(kunci));

    if (!cocokKunci) return false;

    const evalMhs = evaluasiNilai(m.nilai);
    if (status !== "semua" && evalMhs.status !== status) {
      return false;
    }

    if (prodi !== "semua" && m.prodi !== prodi) {
      return false;
    }

    if (grade !== "semua" && evalMhs.grade !== grade) {
      return false;
    }

    return true;
  });
}

export function urutkanMahasiswa(daftar, kriteria = "nama-asc") {
  const salinan = [...daftar];

  switch (kriteria) {
    case "nilai-desc":
      return salinan.sort((a, b) => b.nilai - a.nilai);
    case "nilai-asc":
      return salinan.sort((a, b) => a.nilai - b.nilai);
    case "nama-asc":
      return salinan.sort((a, b) => a.nama.localeCompare(b.nama, "id"));
    case "nama-desc":
      return salinan.sort((a, b) => b.nama.localeCompare(a.nama, "id"));
    case "nim-asc":
      return salinan.sort((a, b) => a.nim.localeCompare(b.nim));
    case "nim-desc":
      return salinan.sort((a, b) => b.nim.localeCompare(a.nim));
    default:
      return salinan;
  }
}

export function hitungStatistik(daftar) {
  const total = daftar.length;

  if (total === 0) {
    return {
      total: 0,
      lulus: 0,
      belum: 0,
      persenLulus: "0%",
      persenBelum: "0%",
      rataRata: "0.0",
      tertinggi: 0,
      terendah: 0,
      distribusiGrade: { A: 0, B: 0, C: 0, D: 0, E: 0 }
    };
  }

  let jumlahNilai = 0;
  let tertinggi = -Infinity;
  let terendah = Infinity;
  let lulus = 0;
  const distribusiGrade = { A: 0, B: 0, C: 0, D: 0, E: 0 };

  daftar.forEach((m) => {
    const val = Number(m.nilai);
    jumlahNilai += val;

    if (val > tertinggi) tertinggi = val;
    if (val < terendah) terendah = val;

    const evaluasi = evaluasiNilai(val);
    if (evaluasi.status === "Lulus") {
      lulus++;
    }
    if (distribusiGrade[evaluasi.grade] !== undefined) {
      distribusiGrade[evaluasi.grade]++;
    }
  });

  const belum = total - lulus;
  const persenLulus = ((lulus / total) * 100).toFixed(1) + "%";
  const persenBelum = ((belum / total) * 100).toFixed(1) + "%";
  const rataRata = (jumlahNilai / total).toFixed(1);

  return {
    total,
    lulus,
    belum,
    persenLulus,
    persenBelum,
    rataRata,
    tertinggi: tertinggi === -Infinity ? 0 : tertinggi,
    terendah: terendah === Infinity ? 0 : terendah,
    distribusiGrade
  };
}
