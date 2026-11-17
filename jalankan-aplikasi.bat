@echo off
title Menjalankan Aplikasi Data Mahasiswa Modular
echo ===================================================================
echo     APLIKASI DATA MAHASISWA MODULAR (ES6 MODULES)
echo     Universitas Pelita Bangsa - Pemrograman Visual Desktop
echo ===================================================================
echo.
echo Sedang menyiapkan server lokal (HTTP Server)...
echo Karena menggunakan arsitektur ES6 Modules (import/export),
echo aplikasi memerlukan server lokal untuk menghindari pembatasan CORS browser.
echo.

:: Cek ketersediaan Python
python --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Python terdeteksi. Membuka browser di http://localhost:8080 ...
    start http://localhost:8080
    python -m http.server 8080
    goto selesai
)

:: Jika python tidak tersedia, coba py
py --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Python terdeteksi. Membuka browser di http://localhost:8080 ...
    start http://localhost:8080
    py -m http.server 8080
    goto selesai
)

:: Jika tidak ada Python, coba buka langsung file HTML
echo [Peringatan] Python tidak terdeteksi. Membuka index.html langsung di browser...
echo Tips: Anda juga bisa menggunakan ekstensi 'Live Server' di VS Code.
start index.html

:selesai
pause
