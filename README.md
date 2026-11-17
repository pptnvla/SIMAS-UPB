# 🎓 SIMAS-UPB — Sistem Informasi Manajemen Akademik Mahasiswa

> **Tugas Praktikum Pemrograman Visual Desktop — Semester 5 (Ganjil 2026/2027)**  
> **Universitas Pelita Bangsa &bull; Fakultas Teknik &bull; Program Studi Teknik Informatika**  
> 
> **Identitas Pengembang:**
> - **Nama Mahasiswa:** Puput Novela
> - **NIM:** 312410470
> - **Kelas:** TI (Teknik Informatika) — Semester 5
> - **Kampus:** Universitas Pelita Bangsa, Cikarang, Jawa Barat

---

## 📌 Ringkasan Proyek
**SIMAS-UPB** (*Sistem Informasi Manajemen Akademik Mahasiswa*) adalah portal akademik resmi berbasis web untuk pengelolaan data nilai dan rekapitulasi hasil studi mahasiswa. Aplikasi ini dibangun dengan standar arsitektur **JavaScript Modular (ES6 Modules)** murni (*Separation of Concerns*) dan didukung oleh identitas visual resmi **Universitas Pelita Bangsa**.

Aplikasi ini mencakup modul lengkap:
1. **Pendaftaran & Penilaian Mahasiswa**: Penginputan NIM, Nama Lengkap, Program Studi, Mata Kuliah, dan Skor Nilai Akhir (0–100).
2. **Evaluasi Akademik Instan**: Konversi otomatis ke Grade Huruf (A, B, C, D, E), Bobot Mutu (4.0 – 0.0), Predikat Kelulusan (*Sangat Memuaskan*, *Memuaskan*, *Cukup*, dll.), dan Status (*Lulus* / *Belum Lulus*).
3. **Prediksi Grade Realtime**: Umpan balik visual langsung saat mengetik nilai pada formulir.
4. **Analisis Statistik Kumulatif**: Total Mahasiswa, Jumlah & Rasio Lulus/Belum Lulus, Rata-Rata Nilai (Mean), Rentang Skor (Maks/Min), dan Diagram Batang Distribusi Grade.
5. **Pencarian, Multi-Filter & Pengurutan Data**: Pencarian cepat nama/NIM/matkul, filter status kelulusan, program studi, dan grade, serta opsi sorting.
6. **Ekspor CSV/Excel**: Unduhan file rekapitulasi data mahasiswa dengan BOM UTF-8 yang rapi di Microsoft Excel.
7. **Lembar Cetak Resmi (Print / Save PDF)**: Memuat **Logo Resmi Universitas Pelita Bangsa**, Kop Surat Fakultas Teknik, format tabel formal, tanggal cetak, dan lembar tanda tangan Ketua Program Studi serta Dosen Pengampu.

---

## 📁 Struktur Berkas Proyek

```text
Aplikasi-Data-Mahasiswa-Modular/
├── assets/
│   └── img/
│       └── logo-pelita-bangsa.png   # Logo Resmi Universitas Pelita Bangsa
├── css/
│   └── style.css                    # Desain UI Akademis Modern & Print Layout
├── js/
│   ├── data.js                      # [MODUL 1: DATA] State data, LocalStorage CRUD, dan ekspor CSV
│   ├── logic.js                     # [MODUL 2: LOGIC] Validasi input, konversi grade/bobot, filter, sorting, statistik
│   ├── ui.js                        # [MODUL 3: UI] Render DOM tabel, statistik, toast & modal dialog
│   └── app.js                       # [MODUL 4: APP] Entry point utama modul ES6
├── index.html                       # Antarmuka web utama berstandar HTML5
├── script.js                        # Mesin terintegrasi siap jalan (kompatibel penuh dengan protokol file:// dan http://)
├── style.css                        # Salinan stylesheet utama di root
├── jalankan-aplikasi.bat            # Skrip 1-klik menjalankan local server otomatis
└── README.md                        # Dokumentasi teknis & panduan akademik
```

---

## ⚡ Arsitektur Modul (*Separation of Concerns*)

| Modul | Nama Berkas | Tanggung Jawab Utama |
|---|---|---|
| **DATA** | `js/data.js` | Mengelola *array state*, persistensi data ke `localStorage`, inisialisasi data demo awal, dan pembentukan file CSV. |
| **LOGIC** | `js/logic.js` | Fungsi murni (*pure functions*) untuk validasi input, konversi skor ke Grade (A–E) dan Bobot (4.0–0.0), algoritma multi-filter, sorting, dan kalkulasi statistik kelas. |
| **UI** | `js/ui.js` | Manipulasi DOM, render tabel dinamis, pembaruan kartu ringkasan, notifikasi *toast* animasi, dan *custom modal dialog*. |
| **APP** | `js/app.js` | *Orchestrator* utama yang menghubungkan event interaksi form, pencarian, tombol aksi, dan sinkronisasi data antar modul. |

---

## 📊 Standar Konversi Nilai Akademik (Universitas Pelita Bangsa)

| Rentang Nilai | Grade | Bobot Mutu | Status Kelulusan | Predikat Akademik |
|:---:|:---:|:---:|:---:|:---:|
| $85 - 100$ | **A** | $4.00$ | **Lulus** | Sangat Memuaskan |
| $75 - 84.9$ | **B** | $3.00$ | **Lulus** | Memuaskan |
| $60 - 74.9$ | **C** | $2.00$ | **Lulus** | Cukup |
| $45 - 59.9$ | **D** | $1.00$ | **Belum Lulus** | Kurang |
| $0 - 44.9$ | **E** | $0.00$ | **Belum Lulus** | Sangat Kurang |

---

## 🚀 Panduan Menjalankan Aplikasi

Aplikasi ini telah dirancang dengan **Dual-Mode Compatibility**:
1. **Langsung Klik Ganda (Tanpa Server)**:
   - Anda cukup membuka file [index.html](file:///d:/TUGAS%20SEM%205/PEMOGRAMAN%20VISUAL%20DESKOP/Aplikasi-Data-Mahasiswa-Modular/index.html) langsung dengan cara klik ganda (*double-click*) di Windows Explorer. Aplikasi akan berjalan 100% tanpa error CORS.
2. **Menggunakan Skrip 1-Klik (`jalankan-aplikasi.bat`)**:
   - Klik ganda [jalankan-aplikasi.bat](file:///d:/TUGAS%20SEM%205/PEMOGRAMAN%20VISUAL%20DESKOP/Aplikasi-Data-Mahasiswa-Modular/jalankan-aplikasi.bat) untuk menjalankan server lokal Python di `http://localhost:8080`.
3. **Menggunakan VS Code Live Server**:
   - Buka folder proyek di VS Code &rarr; klik kanan `index.html` &rarr; pilih **"Open with Live Server"**.

---

## 📝 Hak Cipta & Pengesahan Akademik
Proyek ini dikembangkan secara mandiri untuk memenuhi capaian pembelajaran mata kuliah **Pemrograman Visual Desktop** Program Studi **Teknik Informatika**, **Universitas Pelita Bangsa**.

*Copyright &copy; 2026 Puput Novela (312410470). All rights reserved.*
