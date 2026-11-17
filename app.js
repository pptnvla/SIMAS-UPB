/**
 * ===================================================================
 * MODUL APP (js/app.js) — SIMAS-UPB
 * Entry point utama aplikasi berbasis ES6 Modules.
 * Menghubungkan seluruh modul (DATA, LOGIC, UI) dan mengatur
 * alur interaksi pengguna (Event Listeners & Orchestration).
 * ===================================================================
 */

import {
  muatDariStorage,
  ambilSemuaMahasiswa,
  tambahData,
  ubahData,
  hapusData,
  hapusSemuaData,
  resetKeDataContoh,
  eksporKeCSV
} from "./data.js";

import {
  validasiMahasiswa,
  nimSudahAda,
  evaluasiNilai,
  saringMahasiswa,
  urutkanMahasiswa,
  hitungStatistik
} from "./logic.js";

import {
  el,
  tampilkanNotifikasi,
  bukaModalKonfirmasi,
  perbaruiRingkasan,
  renderTabel,
  updatePreviewGrade,
  setModeEdit,
  resetForm
} from "./ui.js";

let nimSedangDiedit = null;
let filterAktif = {
  kataKunci: "",
  status: "semua",
  prodi: "semua",
  grade: "semua"
};
let pengurutanAktif = "nama-asc";

function perbaruiTampilan() {
  const semuaMahasiswa = ambilSemuaMahasiswa();
  const statistik = hitungStatistik(semuaMahasiswa);
  perbaruiRingkasan(statistik);

  const hasilSaring = saringMahasiswa(semuaMahasiswa, filterAktif);
  const hasilUrut = urutkanMahasiswa(hasilSaring, pengurutanAktif);

  renderTabel(
    hasilUrut,
    {
      onEdit: mulaiEdit,
      onHapus: konfirmasiHapusSatu
    },
    semuaMahasiswa.length
  );
}

function mulaiEdit(mahasiswa) {
  nimSedangDiedit = mahasiswa.nim;
  setModeEdit(mahasiswa);
}

function batalkanEdit() {
  nimSedangDiedit = null;
  resetForm();
  tampilkanNotifikasi("Proses edit mahasiswa dibatalkan.", "info");
}

function konfirmasiHapusSatu(mahasiswa) {
  bukaModalKonfirmasi(
    "Konfirmasi Hapus Mahasiswa",
    `Apakah Anda yakin ingin menghapus data "${mahasiswa.nama}" (NIM: ${mahasiswa.nim})? Tindakan ini tidak dapat dibatalkan.`,
    () => {
      const berhasil = hapusData(mahasiswa.nim);
      if (berhasil) {
        if (nimSedangDiedit === mahasiswa.nim) {
          nimSedangDiedit = null;
          resetForm();
        }
        perbaruiTampilan();
        tampilkanNotifikasi(`Data mahasiswa "${mahasiswa.nama}" berhasil dihapus.`, "sukses");
      } else {
        tampilkanNotifikasi("Gagal menghapus data.", "error");
      }
    },
    "Ya, Hapus Data"
  );
}

function pasangEventListener() {
  if (el.form) {
    el.form.addEventListener("submit", (e) => {
      e.preventDefault();

      const nama = el.inputNama.value;
      const nim = el.inputNim.value;
      const prodi = el.inputProdi ? el.inputProdi.value : "Teknik Informatika";
      const matkul = el.inputMatkul ? el.inputMatkul.value : "Pemrograman Visual Desktop";
      const nilai = el.inputNilai.value;

      const pesanError = validasiMahasiswa(nama, nim, nilai);
      if (pesanError) {
        tampilkanNotifikasi(pesanError, "error");
        return;
      }

      if (nimSedangDiedit !== null) {
        ubahData(nimSedangDiedit, nama, prodi, matkul, nilai);
        nimSedangDiedit = null;
        resetForm();
        perbaruiTampilan();
        tampilkanNotifikasi("Perubahan data mahasiswa berhasil disimpan!", "sukses");
      } else {
        const semua = ambilSemuaMahasiswa();
        if (nimSudahAda(semua, nim)) {
          tampilkanNotifikasi(`NIM ${nim} sudah terdaftar dalam sistem. Gunakan fitur edit bila ingin mengubah.`, "warning");
          return;
        }

        tambahData({ nama, nim, prodi, matkul, nilai });
        resetForm();
        perbaruiTampilan();
        tampilkanNotifikasi(`Mahasiswa "${nama.trim()}" berhasil ditambahkan!`, "sukses");
      }
    });
  }

  if (el.tombolBatal) {
    el.tombolBatal.addEventListener("click", batalkanEdit);
  }

  if (el.inputNilai) {
    el.inputNilai.addEventListener("input", (e) => {
      updatePreviewGrade(e.target.value);
    });
  }

  if (el.inputCari) {
    el.inputCari.addEventListener("input", (e) => {
      filterAktif.kataKunci = e.target.value;
      perbaruiTampilan();
    });
  }

  if (el.filterStatus) {
    el.filterStatus.addEventListener("change", (e) => {
      filterAktif.status = e.target.value;
      perbaruiTampilan();
    });
  }

  if (el.filterProdi) {
    el.filterProdi.addEventListener("change", (e) => {
      filterAktif.prodi = e.target.value;
      perbaruiTampilan();
    });
  }

  if (el.filterGrade) {
    el.filterGrade.addEventListener("change", (e) => {
      filterAktif.grade = e.target.value;
      perbaruiTampilan();
    });
  }

  if (el.urutkanData) {
    el.urutkanData.addEventListener("change", (e) => {
      pengurutanAktif = e.target.value;
      perbaruiTampilan();
    });
  }

  if (el.btnResetFilter) {
    el.btnResetFilter.addEventListener("click", () => {
      filterAktif = { kataKunci: "", status: "semua", prodi: "semua", grade: "semua" };
      pengurutanAktif = "nama-asc";

      if (el.inputCari) el.inputCari.value = "";
      if (el.filterStatus) el.filterStatus.value = "semua";
      if (el.filterProdi) el.filterProdi.value = "semua";
      if (el.filterGrade) el.filterGrade.value = "semua";
      if (el.urutkanData) el.urutkanData.value = "nama-asc";

      perbaruiTampilan();
      tampilkanNotifikasi("Semua filter pencarian telah direset.", "info");
    });
  }

  if (el.btnEksporCSV) {
    el.btnEksporCSV.addEventListener("click", () => {
      try {
        const semua = ambilSemuaMahasiswa();
        eksporKeCSV(semua, evaluasiNilai);
        tampilkanNotifikasi("Data mahasiswa berhasil diekspor ke format CSV!", "sukses");
      } catch (err) {
        tampilkanNotifikasi(err.message, "error");
      }
    });
  }

  if (el.btnCetakLaporan) {
    el.btnCetakLaporan.addEventListener("click", () => {
      const tgl = new Date().toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      });
      const tglCetakEl = document.getElementById("cetakTanggal");
      const tglCetakTtd = document.getElementById("cetakTanggalTtd");
      if (tglCetakEl) tglCetakEl.textContent = tgl;
      if (tglCetakTtd) tglCetakTtd.textContent = tgl;

      window.print();
    });
  }

  if (el.btnMuatContoh) {
    el.btnMuatContoh.addEventListener("click", () => {
      bukaModalKonfirmasi(
        "Muat Data Contoh",
        "Aksi ini akan menyetel ulang data ke daftar contoh mahasiswa (Puput Novela, Ayu, Budi, dll). Lanjutkan?",
        () => {
          resetKeDataContoh();
          nimSedangDiedit = null;
          resetForm();
          perbaruiTampilan();
          tampilkanNotifikasi("Data contoh berhasil dimuat!", "sukses");
        },
        "Muat Data"
      );
    });
  }

  if (el.btnHapusSemua) {
    el.btnHapusSemua.addEventListener("click", () => {
      bukaModalKonfirmasi(
        "Hapus Seluruh Data Mahasiswa",
        "Peringatan: Seluruh data mahasiswa yang tersimpan di memori lokal akan dihapus secara permanen. Apakah Anda yakin?",
        () => {
          hapusSemuaData();
          nimSedangDiedit = null;
          resetForm();
          perbaruiTampilan();
          tampilkanNotifikasi("Seluruh data mahasiswa telah dikosongkan.", "warning");
        },
        "Ya, Kosongkan Semua"
      );
    });
  }
}

function init() {
  muatDariStorage();
  pasangEventListener();
  perbaruiTampilan();
  console.log("🚀 SIMAS-UPB ES6 Modules berhasil diinisialisasi.");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
