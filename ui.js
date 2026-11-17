/**
 * ===================================================================
 * MODUL UI (js/ui.js) — SIMAS-UPB
 * Mengelola manipulasi DOM, rendering tabel data, kartu statistik,
 * visualisasi distribusi grade, sistem toast notifikasi, dan modal.
 * ===================================================================
 */

import { evaluasiNilai } from "./logic.js";

// Cache Elemen DOM Utama
export const el = {
  form: document.getElementById("formMahasiswa"),
  inputNama: document.getElementById("nama"),
  inputNim: document.getElementById("nim"),
  inputProdi: document.getElementById("prodi"),
  inputMatkul: document.getElementById("matkul"),
  inputNilai: document.getElementById("nilai"),
  previewGrade: document.getElementById("previewGrade"),
  tombolSimpan: document.getElementById("tombolSimpan"),
  tombolBatal: document.getElementById("tombolBatal"),
  pesan: document.getElementById("pesan"),

  // Pencarian & Filter
  inputCari: document.getElementById("cari"),
  filterStatus: document.getElementById("filterStatus"),
  filterProdi: document.getElementById("filterProdi"),
  filterGrade: document.getElementById("filterGrade"),
  urutkanData: document.getElementById("urutkanData"),
  btnResetFilter: document.getElementById("btnResetFilter"),

  // Tabel
  tabelBody: document.getElementById("daftarMahasiswa"),
  infoJumlahTampil: document.getElementById("infoJumlahTampil"),

  // Kartu Ringkasan
  jumlahTotal: document.getElementById("jumlahTotal"),
  jumlahLulus: document.getElementById("jumlahLulus"),
  jumlahBelum: document.getElementById("jumlahBelum"),
  rataRataNilai: document.getElementById("rataRataNilai"),
  nilaiTertinggi: document.getElementById("nilaiTertinggi"),
  nilaiTerendah: document.getElementById("nilaiTerendah"),
  persenLulus: document.getElementById("persenLulus"),
  persenBelum: document.getElementById("persenBelum"),
  distribusiGradeBar: document.getElementById("distribusiGradeBar"),

  // Modal & Toast
  modalKonfirmasi: document.getElementById("modalKonfirmasi"),
  modalJudul: document.getElementById("modalJudul"),
  modalTeks: document.getElementById("modalTeks"),
  modalTombolYa: document.getElementById("modalTombolYa"),
  modalTombolBatal: document.getElementById("modalTombolBatal"),
  kontainerToast: document.getElementById("kontainerToast"),

  // Aksi Tambahan
  btnEksporCSV: document.getElementById("btnEksporCSV"),
  btnCetakLaporan: document.getElementById("btnCetakLaporan"),
  btnMuatContoh: document.getElementById("btnMuatContoh"),
  btnHapusSemua: document.getElementById("btnHapusSemua")
};

let callbackKonfirmasi = null;

export function tampilkanNotifikasi(teks, jenis = "sukses", durasi = 3500) {
  if (el.pesan) {
    el.pesan.textContent = teks;
    el.pesan.className = teks ? jenis : "";
  }

  if (!el.kontainerToast) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${jenis}`;

  const ikonMap = { sukses: "✓", error: "✕", warning: "⚠", info: "ℹ" };

  toast.innerHTML = `
    <span class="toast-ikon">${ikonMap[jenis] || "ℹ"}</span>
    <div class="toast-konten">
      <p class="toast-pesan">${escapeHTML(teks)}</p>
    </div>
    <button type="button" class="toast-tutup" aria-label="Tutup">&times;</button>
  `;

  const tombolTutup = toast.querySelector(".toast-tutup");
  const hapusToast = () => {
    toast.classList.add("toast-keluar");
    setTimeout(() => {
      if (toast.parentElement) toast.parentElement.removeChild(toast);
    }, 250);
  };

  tombolTutup.addEventListener("click", hapusToast);
  el.kontainerToast.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("toast-aktif"));
  setTimeout(hapusToast, durasi);
}

export function bukaModalKonfirmasi(judul, pesan, onSetuju, teksTombol = "Hapus") {
  if (!el.modalKonfirmasi) {
    if (confirm(`${judul}\n\n${pesan}`)) onSetuju();
    return;
  }

  el.modalJudul.textContent = judul;
  el.modalTeks.textContent = pesan;
  el.modalTombolYa.textContent = teksTombol;
  callbackKonfirmasi = onSetuju;

  el.modalKonfirmasi.classList.add("tampil");
}

export function tutupModalKonfirmasi() {
  if (el.modalKonfirmasi) {
    el.modalKonfirmasi.classList.remove("tampil");
  }
  callbackKonfirmasi = null;
}

if (el.modalTombolBatal) {
  el.modalTombolBatal.addEventListener("click", tutupModalKonfirmasi);
}
if (el.modalTombolYa) {
  el.modalTombolYa.addEventListener("click", () => {
    if (callbackKonfirmasi) callbackKonfirmasi();
    tutupModalKonfirmasi();
  });
}
if (el.modalKonfirmasi) {
  el.modalKonfirmasi.addEventListener("click", (e) => {
    if (e.target === el.modalKonfirmasi) tutupModalKonfirmasi();
  });
}

export function perbaruiRingkasan(statistik) {
  if (el.jumlahTotal) el.jumlahTotal.textContent = statistik.total;
  if (el.jumlahLulus) el.jumlahLulus.textContent = statistik.lulus;
  if (el.jumlahBelum) el.jumlahBelum.textContent = statistik.belum;
  if (el.persenLulus) el.persenLulus.textContent = `(${statistik.persenLulus})`;
  if (el.persenBelum) el.persenBelum.textContent = `(${statistik.persenBelum})`;

  if (el.rataRataNilai) el.rataRataNilai.textContent = statistik.rataRata;
  if (el.nilaiTertinggi) el.nilaiTertinggi.textContent = statistik.total > 0 ? statistik.tertinggi : "-";
  if (el.nilaiTerendah) el.nilaiTerendah.textContent = statistik.total > 0 ? statistik.terendah : "-";

  if (el.distribusiGradeBar) {
    el.distribusiGradeBar.innerHTML = "";
    const grades = ["A", "B", "C", "D", "E"];
    const total = statistik.total || 1;

    grades.forEach((g) => {
      const jml = statistik.distribusiGrade[g] || 0;
      const persentase = statistik.total > 0 ? Math.round((jml / total) * 100) : 0;

      const item = document.createElement("div");
      item.className = "dist-item";
      item.innerHTML = `
        <div class="dist-header">
          <span class="dist-label">Grade ${g}</span>
          <span class="dist-val">${jml} mhs (${persentase}%)</span>
        </div>
        <div class="dist-bar-track">
          <div class="dist-bar-fill fill-${g.toLowerCase()}" style="width: ${persentase}%"></div>
        </div>
      `;
      el.distribusiGradeBar.appendChild(item);
    });
  }
}

export function renderTabel(daftar, { onEdit, onHapus }, totalSemua = 0) {
  if (!el.tabelBody) return;
  el.tabelBody.innerHTML = "";

  if (el.infoJumlahTampil) {
    el.infoJumlahTampil.textContent = `Menampilkan ${daftar.length} dari ${totalSemua} mahasiswa`;
  }

  if (daftar.length === 0) {
    const tr = document.createElement("tr");
    tr.className = "baris-kosong";
    tr.innerHTML = `
      <td colspan="8" class="kosong">
        <div class="kosong-konten">
          <span class="kosong-ikon">📋</span>
          <p class="kosong-judul">${totalSemua === 0 ? "Belum ada data mahasiswa." : "Data tidak cocok dengan pencarian / filter."}</p>
          <small class="kosong-sub">${totalSemua === 0 ? "Gunakan formulir di atas atau klik 'Data Demo' untuk memulai." : "Coba ubah kata kunci atau bersihkan pilihan filter."}</small>
        </div>
      </td>
    `;
    el.tabelBody.appendChild(tr);
    return;
  }

  daftar.forEach((m, indeks) => {
    const evaluasi = evaluasiNilai(m.nilai);
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td class="kolom-no">${indeks + 1}</td>
      <td class="kolom-nim"><strong>${escapeHTML(m.nim)}</strong></td>
      <td class="kolom-nama">
        <div class="mhs-nama">${escapeHTML(m.nama)}</div>
        <div class="mhs-matkul">📚 ${escapeHTML(m.matkul || "Pemrograman Visual Desktop")}</div>
      </td>
      <td class="kolom-prodi">
        <span class="tag-prodi">${escapeHTML(m.prodi || "Teknik Informatika")}</span>
      </td>
      <td class="kolom-nilai">
        <span class="skor-angka">${m.nilai}</span>
      </td>
      <td class="kolom-grade">
        <span class="badge-grade ${evaluasi.kelasWarna}">
          ${evaluasi.grade} (${evaluasi.bobot.toFixed(1)})
        </span>
      </td>
      <td class="kolom-status">
        <span class="badge ${evaluasi.status === "Lulus" ? "badge-lulus" : "badge-belum"}">
          ${evaluasi.status === "Lulus" ? "✓ Lulus" : "✕ Belum Lulus"}
        </span>
      </td>
      <td class="kolom-aksi">
        <div class="grup-aksi">
          <button type="button" class="btn-aksi btn-edit" title="Edit data">✏️ Ubah</button>
          <button type="button" class="btn-aksi btn-hapus" title="Hapus data">🗑️ Hapus</button>
        </div>
      </td>
    `;

    tr.querySelector(".btn-edit").addEventListener("click", () => onEdit(m));
    tr.querySelector(".btn-hapus").addEventListener("click", () => onHapus(m));
    el.tabelBody.appendChild(tr);
  });
}

export function updatePreviewGrade(nilai) {
  if (!el.previewGrade) return;
  if (nilai === "" || nilai === null || isNaN(nilai)) {
    el.previewGrade.hidden = true;
    return;
  }
  const val = Number(nilai);
  if (val < 0 || val > 100) {
    el.previewGrade.hidden = true;
    return;
  }
  const ev = evaluasiNilai(val);
  el.previewGrade.hidden = false;
  el.previewGrade.innerHTML = `
    <span>Prediksi Hasil:</span>
    <span class="badge-grade ${ev.kelasWarna}">Grade ${ev.grade} (Bobot ${ev.bobot.toFixed(1)})</span>
    <span class="badge ${ev.status === "Lulus" ? "badge-lulus" : "badge-belum"}">${ev.status} &bull; ${ev.predikat}</span>
  `;
}

export function setModeEdit(mahasiswa) {
  el.inputNama.value = mahasiswa.nama;
  el.inputNim.value = mahasiswa.nim;
  el.inputNim.readOnly = true;
  if (el.inputProdi) el.inputProdi.value = mahasiswa.prodi || "Teknik Informatika";
  if (el.inputMatkul) el.inputMatkul.value = mahasiswa.matkul || "Pemrograman Visual Desktop";
  el.inputNilai.value = mahasiswa.nilai;

  el.tombolSimpan.innerHTML = "💾 Simpan Perubahan";
  el.tombolSimpan.classList.add("mode-simpan-edit");
  el.tombolBatal.hidden = false;

  el.form.classList.add("form-aktif-edit");
  el.inputNama.focus();

  updatePreviewGrade(mahasiswa.nilai);
  tampilkanNotifikasi(`Sedang mengedit data mahasiswa: ${mahasiswa.nama}`, "info");
}

export function resetForm() {
  el.form.reset();
  el.inputNim.readOnly = false;
  if (el.inputMatkul) el.inputMatkul.value = "Pemrograman Visual Desktop";
  el.tombolSimpan.innerHTML = "➕ Simpan Data Mahasiswa";
  el.tombolSimpan.classList.remove("mode-simpan-edit");
  el.tombolBatal.hidden = true;
  el.form.classList.remove("form-aktif-edit");
  if (el.previewGrade) el.previewGrade.hidden = true;
}

function escapeHTML(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
