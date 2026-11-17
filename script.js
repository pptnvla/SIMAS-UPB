// ===================================================================
// SIMAS-UPB — Sistem Informasi Manajemen Akademik Mahasiswa
// Universitas Pelita Bangsa — Fakultas Teknik & Ilmu Komputer
// Arsitektur Terstruktur: 1. DATA, 2. LOGIC, 3. UI, 4. APP
// ===================================================================

(function () {
  "use strict";

  // ===================================================================
  // BAGIAN 1: DATA (MANAJEMEN DATA & LOCALSTORAGE)
  // ===================================================================
  const KUNCI_STORAGE = "dataMahasiswaModular_v3";
  const KUNCI_LAMA = "dataMahasiswaModular";

  // Dataset resmi awal untuk demonstrasi akademik
  const DATA_CONTOH = [
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

  function muatDariStorage() {
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
    } catch (e) {
      console.warn("Gagal membaca localStorage:", e);
    }

    daftarMahasiswa = JSON.parse(JSON.stringify(DATA_CONTOH));
    simpanKeStorage();
    return daftarMahasiswa;
  }

  function simpanKeStorage() {
    try {
      localStorage.setItem(KUNCI_STORAGE, JSON.stringify(daftarMahasiswa));
    } catch (e) {
      console.warn("localStorage tidak dapat digunakan:", e);
    }
  }

  function ambilSemua() {
    return daftarMahasiswa;
  }

  function tambahData(mhs) {
    daftarMahasiswa.push({
      nim: String(mhs.nim).trim(),
      nama: String(mhs.nama).trim(),
      prodi: mhs.prodi || "Teknik Informatika",
      matkul: mhs.matkul || "Pemrograman Visual Desktop",
      nilai: Number(mhs.nilai)
    });
    simpanKeStorage();
  }

  function ubahData(nim, nama, prodi, matkul, nilai) {
    const target = daftarMahasiswa.find((m) => m.nim === String(nim).trim());
    if (!target) return false;
    target.nama = String(nama).trim();
    target.prodi = prodi || target.prodi;
    target.matkul = matkul || target.matkul;
    target.nilai = Number(nilai);
    simpanKeStorage();
    return true;
  }

  function hapusData(nim) {
    const idx = daftarMahasiswa.findIndex((m) => m.nim === String(nim).trim());
    if (idx !== -1) {
      daftarMahasiswa.splice(idx, 1);
      simpanKeStorage();
      return true;
    }
    return false;
  }

  function hapusSemua() {
    daftarMahasiswa = [];
    simpanKeStorage();
  }

  function resetDataContoh() {
    daftarMahasiswa = JSON.parse(JSON.stringify(DATA_CONTOH));
    simpanKeStorage();
    return daftarMahasiswa;
  }

  function eksporKeCSV() {
    if (!daftarMahasiswa || daftarMahasiswa.length === 0) {
      throw new Error("Tidak ada data mahasiswa untuk diekspor.");
    }

    const header = ["No", "NIM", "Nama Lengkap", "Program Studi", "Mata Kuliah", "Nilai Angka", "Grade", "Bobot", "Predikat", "Status Kelulusan"];
    const baris = [header.join(",")];

    daftarMahasiswa.forEach((m, i) => {
      const ev = evaluasiNilai(m.nilai);
      const row = [
        i + 1,
        `"${m.nim}"`,
        `"${m.nama.replace(/"/g, '""')}"`,
        `"${m.prodi.replace(/"/g, '""')}"`,
        `"${m.matkul.replace(/"/g, '""')}"`,
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
    const link = document.createElement("a");
    link.href = url;
    const tgl = new Date().toISOString().slice(0, 10);
    link.download = `SIMAS_UPB_Rekap_Nilai_${tgl}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // ===================================================================
  // BAGIAN 2: LOGIC (ATURAN AKADEMIK & VALIDASI)
  // ===================================================================
  function validasiMahasiswa(nama, nim, nilai) {
    const namaBersih = String(nama || "").trim();
    const nimBersih = String(nim || "").trim();

    if (!namaBersih || !nimBersih || nilai === "" || nilai === null || nilai === undefined) {
      return "Semua bidang (NIM, Nama, Nilai) wajib diisi.";
    }

    if (namaBersih.length < 2) {
      return "Nama mahasiswa minimal terdiri dari 2 karakter.";
    }

    if (!/^\d+$/.test(nimBersih)) {
      return "NIM hanya boleh berisi digit angka.";
    }

    if (nimBersih.length < 4 || nimBersih.length > 20) {
      return "NIM harus memiliki panjang 4 sampai 20 digit angka.";
    }

    const angka = Number(nilai);
    if (!Number.isFinite(angka) || angka < 0 || angka > 100) {
      return "Nilai harus berupa angka dalam rentang 0 sampai 100.";
    }

    return "";
  }

  function nimSudahAda(daftar, nim, kecualiNim = null) {
    const target = String(nim).trim();
    return daftar.some((m) => m.nim === target && m.nim !== kecualiNim);
  }

  function evaluasiNilai(nilai) {
    const skor = Number(nilai);
    if (skor >= 85) {
      return { grade: "A", bobot: 4.0, status: "Lulus", predikat: "Sangat Memuaskan", kelasWarna: "grade-a" };
    } else if (skor >= 75) {
      return { grade: "B", bobot: 3.0, status: "Lulus", predikat: "Memuaskan", kelasWarna: "grade-b" };
    } else if (skor >= 60) {
      return { grade: "C", bobot: 2.0, status: "Lulus", predikat: "Cukup", kelasWarna: "grade-c" };
    } else if (skor >= 45) {
      return { grade: "D", bobot: 1.0, status: "Belum Lulus", predikat: "Kurang", kelasWarna: "grade-d" };
    } else {
      return { grade: "E", bobot: 0.0, status: "Belum Lulus", predikat: "Sangat Kurang", kelasWarna: "grade-e" };
    }
  }

  function saringMahasiswa(daftar, { kataKunci = "", status = "semua", prodi = "semua", grade = "semua" }) {
    const kunci = kataKunci.trim().toLowerCase();

    return daftar.filter((m) => {
      const cocokKunci =
        !kunci ||
        m.nama.toLowerCase().includes(kunci) ||
        m.nim.toLowerCase().includes(kunci) ||
        (m.matkul && m.matkul.toLowerCase().includes(kunci));

      if (!cocokKunci) return false;

      const ev = evaluasiNilai(m.nilai);
      if (status !== "semua" && ev.status !== status) return false;
      if (prodi !== "semua" && m.prodi !== prodi) return false;
      if (grade !== "semua" && ev.grade !== grade) return false;

      return true;
    });
  }

  function urutkanMahasiswa(daftar, kriteria = "nama-asc") {
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

  function hitungStatistik(daftar) {
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

    let sum = 0, maks = -Infinity, min = Infinity, lulus = 0;
    const distribusi = { A: 0, B: 0, C: 0, D: 0, E: 0 };

    daftar.forEach((m) => {
      const v = Number(m.nilai);
      sum += v;
      if (v > maks) maks = v;
      if (v < min) min = v;
      const ev = evaluasiNilai(v);
      if (ev.status === "Lulus") lulus++;
      if (distribusi[ev.grade] !== undefined) distribusi[ev.grade]++;
    });

    const belum = total - lulus;
    return {
      total,
      lulus,
      belum,
      persenLulus: ((lulus / total) * 100).toFixed(1) + "%",
      persenBelum: ((belum / total) * 100).toFixed(1) + "%",
      rataRata: (sum / total).toFixed(1),
      tertinggi: maks === -Infinity ? 0 : maks,
      terendah: min === Infinity ? 0 : min,
      distribusiGrade: distribusi
    };
  }

  // ===================================================================
  // BAGIAN 3: UI (MANIPULASI DOM, RENDER & NOTIFIKASI)
  // ===================================================================
  let el = {};
  let callbackKonfirmasi = null;

  function ambilElemenDOM() {
    el = {
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

      inputCari: document.getElementById("cari"),
      filterStatus: document.getElementById("filterStatus"),
      filterProdi: document.getElementById("filterProdi"),
      filterGrade: document.getElementById("filterGrade"),
      urutkanData: document.getElementById("urutkanData"),
      btnResetFilter: document.getElementById("btnResetFilter"),

      tabelBody: document.getElementById("daftarMahasiswa"),
      infoJumlahTampil: document.getElementById("infoJumlahTampil"),

      jumlahTotal: document.getElementById("jumlahTotal"),
      jumlahLulus: document.getElementById("jumlahLulus"),
      jumlahBelum: document.getElementById("jumlahBelum"),
      persenLulus: document.getElementById("persenLulus"),
      persenBelum: document.getElementById("persenBelum"),
      rataRataNilai: document.getElementById("rataRataNilai"),
      nilaiTertinggi: document.getElementById("nilaiTertinggi"),
      nilaiTerendah: document.getElementById("nilaiTerendah"),
      distribusiGradeBar: document.getElementById("distribusiGradeBar"),

      modalKonfirmasi: document.getElementById("modalKonfirmasi"),
      modalJudul: document.getElementById("modalJudul"),
      modalTeks: document.getElementById("modalTeks"),
      modalTombolYa: document.getElementById("modalTombolYa"),
      modalTombolBatal: document.getElementById("modalTombolBatal"),
      kontainerToast: document.getElementById("kontainerToast"),

      btnEksporCSV: document.getElementById("btnEksporCSV"),
      btnCetakLaporan: document.getElementById("btnCetakLaporan"),
      btnMuatContoh: document.getElementById("btnMuatContoh"),
      btnHapusSemua: document.getElementById("btnHapusSemua")
    };
  }

  function tampilkanNotifikasi(teks, jenis = "sukses", durasi = 3500) {
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

    const tutup = () => {
      toast.classList.add("toast-keluar");
      setTimeout(() => {
        if (toast.parentElement) toast.parentElement.removeChild(toast);
      }, 250);
    };

    toast.querySelector(".toast-tutup").addEventListener("click", tutup);
    el.kontainerToast.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("toast-aktif"));
    setTimeout(tutup, durasi);
  }

  function bukaModal(judul, teks, onYa, teksTombol = "Hapus") {
    if (!el.modalKonfirmasi) {
      if (confirm(`${judul}\n\n${teks}`)) onYa();
      return;
    }
    el.modalJudul.textContent = judul;
    el.modalTeks.textContent = teks;
    el.modalTombolYa.textContent = teksTombol;
    callbackKonfirmasi = onYa;
    el.modalKonfirmasi.classList.add("tampil");
  }

  function tutupModal() {
    if (el.modalKonfirmasi) {
      el.modalKonfirmasi.classList.remove("tampil");
    }
    callbackKonfirmasi = null;
  }

  function perbaruiRingkasan(stat) {
    if (el.jumlahTotal) el.jumlahTotal.textContent = stat.total;
    if (el.jumlahLulus) el.jumlahLulus.textContent = stat.lulus;
    if (el.jumlahBelum) el.jumlahBelum.textContent = stat.belum;
    if (el.persenLulus) el.persenLulus.textContent = `(${stat.persenLulus})`;
    if (el.persenBelum) el.persenBelum.textContent = `(${stat.persenBelum})`;
    if (el.rataRataNilai) el.rataRataNilai.textContent = stat.rataRata;
    if (el.nilaiTertinggi) el.nilaiTertinggi.textContent = stat.total > 0 ? stat.tertinggi : "-";
    if (el.nilaiTerendah) el.nilaiTerendah.textContent = stat.total > 0 ? stat.terendah : "-";

    if (el.distribusiGradeBar) {
      el.distribusiGradeBar.innerHTML = "";
      const grades = ["A", "B", "C", "D", "E"];
      const total = stat.total || 1;

      grades.forEach((g) => {
        const jml = stat.distribusiGrade[g] || 0;
        const persen = stat.total > 0 ? Math.round((jml / total) * 100) : 0;
        const item = document.createElement("div");
        item.className = "dist-item";
        item.innerHTML = `
          <div class="dist-header">
            <span class="dist-label">Grade ${g}</span>
            <span class="dist-val">${jml} mhs (${persen}%)</span>
          </div>
          <div class="dist-bar-track">
            <div class="dist-bar-fill fill-${g.toLowerCase()}" style="width: ${persen}%"></div>
          </div>
        `;
        el.distribusiGradeBar.appendChild(item);
      });
    }
  }

  function renderTabel(daftar, { onEdit, onHapus }, totalSemua) {
    if (!el.tabelBody) return;
    el.tabelBody.innerHTML = "";

    if (el.infoJumlahTampil) {
      el.infoJumlahTampil.textContent = `Menampilkan ${daftar.length} dari ${totalSemua} mahasiswa`;
    }

    if (daftar.length === 0) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td colspan="8" class="kosong">
          <div class="kosong-konten">
            <span class="kosong-ikon">📋</span>
            <p class="kosong-judul">${totalSemua === 0 ? "Belum ada data mahasiswa terdaftar." : "Tidak ada mahasiswa yang cocok dengan kriteria pencarian/filter."}</p>
            <small class="kosong-sub">${totalSemua === 0 ? "Gunakan formulir di atas atau klik tombol 'Data Demo' untuk memulai." : "Silakan sesuaikan kata kunci pencarian atau klik tombol Reset Filter."}</small>
          </div>
        </td>
      `;
      el.tabelBody.appendChild(tr);
      return;
    }

    daftar.forEach((m, idx) => {
      const ev = evaluasiNilai(m.nilai);
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td class="kolom-no">${idx + 1}</td>
        <td class="kolom-nim"><strong>${escapeHTML(m.nim)}</strong></td>
        <td>
          <div class="mhs-nama">${escapeHTML(m.nama)}</div>
          <div class="mhs-matkul">📚 ${escapeHTML(m.matkul || "Pemrograman Visual Desktop")}</div>
        </td>
        <td>
          <span class="tag-prodi">${escapeHTML(m.prodi || "Teknik Informatika")}</span>
        </td>
        <td>
          <span class="skor-angka">${m.nilai}</span>
        </td>
        <td>
          <span class="badge-grade ${ev.kelasWarna}">
            ${ev.grade} (${ev.bobot.toFixed(1)})
          </span>
        </td>
        <td>
          <span class="badge ${ev.status === "Lulus" ? "badge-lulus" : "badge-belum"}">
            ${ev.status === "Lulus" ? "✓ Lulus" : "✕ Belum Lulus"}
          </span>
        </td>
        <td class="kolom-aksi">
          <div class="grup-aksi">
            <button type="button" class="btn-aksi btn-edit" title="Edit data mahasiswa">✏️ Ubah</button>
            <button type="button" class="btn-aksi btn-hapus" title="Hapus data mahasiswa">🗑️ Hapus</button>
          </div>
        </td>
      `;

      tr.querySelector(".btn-edit").addEventListener("click", () => onEdit(m));
      tr.querySelector(".btn-hapus").addEventListener("click", () => onHapus(m));
      el.tabelBody.appendChild(tr);
    });
  }

  function setModeEdit(m) {
    el.inputNama.value = m.nama;
    el.inputNim.value = m.nim;
    el.inputNim.readOnly = true;
    if (el.inputProdi) el.inputProdi.value = m.prodi || "Teknik Informatika";
    if (el.inputMatkul) el.inputMatkul.value = m.matkul || "Pemrograman Visual Desktop";
    el.inputNilai.value = m.nilai;

    el.tombolSimpan.innerHTML = "💾 Simpan Perubahan";
    el.tombolSimpan.classList.add("mode-simpan-edit");
    el.tombolBatal.hidden = false;
    el.form.classList.add("form-aktif-edit");
    el.inputNama.focus();

    updatePreviewGrade(m.nilai);
    tampilkanNotifikasi(`Mode edit aktif untuk mahasiswa: ${m.nama}`, "info");
  }

  function resetForm() {
    el.form.reset();
    el.inputNim.readOnly = false;
    if (el.inputMatkul) el.inputMatkul.value = "Pemrograman Visual Desktop";
    el.tombolSimpan.innerHTML = "➕ Simpan Data Mahasiswa";
    el.tombolSimpan.classList.remove("mode-simpan-edit");
    el.tombolBatal.hidden = true;
    el.form.classList.remove("form-aktif-edit");
    if (el.previewGrade) el.previewGrade.hidden = true;
  }

  function updatePreviewGrade(nilai) {
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

  function escapeHTML(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // ===================================================================
  // BAGIAN 4: APP (ORKESTRASI EVENT & INTERAKSI PENGGUNA)
  // ===================================================================
  let nimSedangDiedit = null;
  let filterAktif = {
    kataKunci: "",
    status: "semua",
    prodi: "semua",
    grade: "semua"
  };
  let pengurutanAktif = "nama-asc";

  function perbaruiTampilan() {
    const semua = ambilSemua();
    const stat = hitungStatistik(semua);
    perbaruiRingkasan(stat);

    const disaring = saringMahasiswa(semua, filterAktif);
    const diurutkan = urutkanMahasiswa(disaring, pengurutanAktif);

    renderTabel(
      diurutkan,
      {
        onEdit: (m) => {
          nimSedangDiedit = m.nim;
          setModeEdit(m);
        },
        onHapus: (m) => {
          bukaModal(
            "Konfirmasi Hapus Data Mahasiswa",
            `Apakah Anda yakin ingin menghapus data akademik atas nama "${m.nama}" (NIM: ${m.nim})? Data yang telah dihapus tidak dapat dipulihkan.`,
            () => {
              hapusData(m.nim);
              if (nimSedangDiedit === m.nim) {
                nimSedangDiedit = null;
                resetForm();
              }
              perbaruiTampilan();
              tampilkanNotifikasi(`Data mahasiswa "${m.nama}" berhasil dihapus.`, "sukses");
            },
            "Ya, Hapus Data"
          );
        }
      },
      semua.length
    );
  }

  function inisialisasi() {
    ambilElemenDOM();
    muatDariStorage();

    // 1. Submit Formulir
    if (el.form) {
      el.form.addEventListener("submit", (e) => {
        e.preventDefault();
        const nama = el.inputNama.value;
        const nim = el.inputNim.value;
        const prodi = el.inputProdi ? el.inputProdi.value : "Teknik Informatika";
        const matkul = el.inputMatkul ? el.inputMatkul.value : "Pemrograman Visual Desktop";
        const nilai = el.inputNilai.value;

        const err = validasiMahasiswa(nama, nim, nilai);
        if (err) {
          tampilkanNotifikasi(err, "error");
          return;
        }

        if (nimSedangDiedit !== null) {
          ubahData(nimSedangDiedit, nama, prodi, matkul, nilai);
          nimSedangDiedit = null;
          resetForm();
          perbaruiTampilan();
          tampilkanNotifikasi("Data hasil studi mahasiswa berhasil diperbarui!", "sukses");
        } else {
          const semua = ambilSemua();
          if (nimSudahAda(semua, nim)) {
            tampilkanNotifikasi(`NIM ${nim} sudah terdaftar. Silakan gunakan fitur 'Ubah' jika ingin mengedit nilai.`, "warning");
            return;
          }
          tambahData({ nama, nim, prodi, matkul, nilai });
          resetForm();
          perbaruiTampilan();
          tampilkanNotifikasi(`Mahasiswa "${nama.trim()}" berhasil didaftarkan!`, "sukses");
        }
      });
    }

    // 2. Tombol Batal Edit
    if (el.tombolBatal) {
      el.tombolBatal.addEventListener("click", () => {
        nimSedangDiedit = null;
        resetForm();
        tampilkanNotifikasi("Edit data mahasiswa dibatalkan.", "info");
      });
    }

    // 3. Realtime Preview Grade saat mengetik nilai
    if (el.inputNilai) {
      el.inputNilai.addEventListener("input", (e) => {
        updatePreviewGrade(e.target.value);
      });
    }

    // 4. Pencarian Live
    if (el.inputCari) {
      el.inputCari.addEventListener("input", (e) => {
        filterAktif.kataKunci = e.target.value;
        perbaruiTampilan();
      });
    }

    // 5. Dropdown Filter
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

    // 6. Urutkan Data
    if (el.urutkanData) {
      el.urutkanData.addEventListener("change", (e) => {
        pengurutanAktif = e.target.value;
        perbaruiTampilan();
      });
    }

    // 7. Reset Filter
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
        tampilkanNotifikasi("Semua parameter filter telah direset.", "info");
      });
    }

    // 8. Ekspor CSV
    if (el.btnEksporCSV) {
      el.btnEksporCSV.addEventListener("click", () => {
        try {
          eksporKeCSV();
          tampilkanNotifikasi("Data rekapitulasi mahasiswa berhasil diunduh (CSV)!", "sukses");
        } catch (err) {
          tampilkanNotifikasi(err.message, "error");
        }
      });
    }

    // 9. Cetak Laporan / PDF
    if (el.btnCetakLaporan) {
      el.btnCetakLaporan.addEventListener("click", () => {
        const tglStr = new Date().toLocaleDateString("id-ID", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric"
        });
        const cetakTanggal = document.getElementById("cetakTanggal");
        const cetakTanggalTtd = document.getElementById("cetakTanggalTtd");
        if (cetakTanggal) cetakTanggal.textContent = tglStr;
        if (cetakTanggalTtd) cetakTanggalTtd.textContent = tglStr;
        window.print();
      });
    }

    // 10. Muat Data Demo
    if (el.btnMuatContoh) {
      el.btnMuatContoh.addEventListener("click", () => {
        bukaModal(
          "Muat Ulang Data Contoh Demo",
          "Tindakan ini akan mengembalikan data ke sampel awal resmi (Puput Novela, Ayu, Budi, dll). Lanjutkan?",
          () => {
            resetDataContoh();
            nimSedangDiedit = null;
            resetForm();
            perbaruiTampilan();
            tampilkanNotifikasi("Data demo akademik berhasil dimuat ulang!", "sukses");
          },
          "Muat Data"
        );
      });
    }

    // 11. Kosongkan Data
    if (el.btnHapusSemua) {
      el.btnHapusSemua.addEventListener("click", () => {
        bukaModal(
          "Kosongkan Seluruh Database Mahasiswa",
          "Peringatan: Seluruh data mahasiswa yang tersimpan di sistem akan dihapus total. Apakah Anda yakin?",
          () => {
            hapusSemua();
            nimSedangDiedit = null;
            resetForm();
            perbaruiTampilan();
            tampilkanNotifikasi("Seluruh database mahasiswa telah dikosongkan.", "warning");
          },
          "Ya, Kosongkan Semua"
        );
      });
    }

    // 12. Modal Buttons
    if (el.modalTombolBatal) el.modalTombolBatal.addEventListener("click", tutupModal);
    if (el.modalTombolYa) {
      el.modalTombolYa.addEventListener("click", () => {
        if (callbackKonfirmasi) callbackKonfirmasi();
        tutupModal();
      });
    }
    if (el.modalKonfirmasi) {
      el.modalKonfirmasi.addEventListener("click", (e) => {
        if (e.target === el.modalKonfirmasi) tutupModal();
      });
    }

    // Tampilkan data awal
    perbaruiTampilan();
    console.log("🎓 SIMAS-UPB berhasil dijalankan.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inisialisasi);
  } else {
    inisialisasi();
  }
})();
