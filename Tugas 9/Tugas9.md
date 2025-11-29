## Tugas 9 – Implementasi Sistem Presensi Mahasiswa Berbasis Web

### Identitas Mahasiswa
- Nama   : Muhammad Array
- NIM    : ..................................
- Kelas  : ..................................
- Mata Kuliah : Pengembangan Aplikasi Web
- Dosen Pengampu : ..................................
- Tanggal Pengumpulan : 29 November 2025

---

### 1. Halaman Presensi (Mahasiswa)

1. **Tampilan Awal Halaman Presensi**
	- Menampilkan navbar dengan menu `Dashboard` dan `Presensi`.
	- Menampilkan nama pengguna yang sedang login pada pojok kanan atas.
	- Halaman utama menunjukkan kartu lokasi dan tombol Check In / Check Out.

	_Screenshot:_
	`![Halaman Presensi – Awal](./presensi-awal.png)`

2. **Check-In Berhasil**
	- Setelah menekan tombol **Check In**, sistem menampilkan notifikasi hijau di bagian atas yang berisi nama dan waktu check-in.
	- Latitude dan longitude terisi sesuai lokasi GPS, serta peta OpenStreetMap menampilkan marker posisi mahasiswa.

	_Screenshot:_
	`![Presensi – Check In](./presensi-check-in.png)`

3. **Check-Out Berhasil**
	- Setelah menekan tombol **Check Out**, sistem menampilkan notifikasi hijau serupa dengan waktu check-out.
	- Lokasi GPS juga tersimpan bersamaan dengan data presensi.

	_Screenshot:_
	`![Presensi – Check Out](./presensi-check-out.png)`

---

### 2. Pengujian Endpoint API Presensi

Pengujian dilakukan menggunakan Postman (atau Thunder Client) dengan backend yang berjalan di `http://localhost:5000`.

1. **Endpoint Check-In**
	- Method : `POST`
	- URL    : `http://localhost:5000/api/presensi/check-in`
	- Headers:
	  - `Content-Type: application/json`
	  - `Authorization: Bearer <token_jwt>`
	- Body (JSON):

	  ```json
	  {
		 "latitude": "-7.8092997",
		 "longitude": "110.3220132"
	  }
	  ```

	- Hasil: response `201 Created` dengan pesan sukses dan objek data presensi (id, type `CHECK_IN`, timestamp, userId, latitude, longitude).

	_Screenshot:_
	`![API – Check In](./api-check-in.png)`

2. **Endpoint Check-Out**
	- Method : `POST`
	- URL    : `http://localhost:5000/api/presensi/check-out`
	- Headers sama dengan endpoint check-in.
	- Body (JSON) sama, berisi latitude dan longitude.
	- Hasil: response `201 Created` dengan type `CHECK_OUT`.

	_Screenshot:_
	`![API – Check Out](./api-check-out.png)`

---

### 3. Bukti Data Tersimpan di Database

Query yang digunakan pada MySQL:

```sql
SELECT * FROM presensis LIMIT 100;
```

Hasil query menunjukkan:
- Kolom `type` berisi nilai `CHECK_IN` dan `CHECK_OUT`.
- Kolom `timestamp` berisi waktu presensi.
- Kolom `userId` mengarah ke id pengguna yang melakukan presensi.
- Kolom `latitude` dan `longitude` berisi koordinat lokasi saat presensi.

_Screenshot:_
`![Database – Tabel Presensis](./db-presensis.png)`

---

### 4. Halaman Laporan Presensi (Admin/Dosen)

Pada akun dengan role **Admin/Dosen**, tersedia halaman **Laporan Presensi** yang menampilkan daftar presensi seluruh mahasiswa.

Informasi yang ditampilkan pada tabel:
- Nama dan email mahasiswa.
- Tipe presensi (`Check In` / `Check Out`).
- Waktu presensi dalam format lokal (contoh: *Sabtu, 29 November 2025 pukul 09.47*).
- Status verifikasi (`Verified`).

_Screenshot:_
`![Laporan Presensi – Admin](./laporan-admin.png)`

---

### 5. Kesimpulan

1. Sistem presensi berbasis web berhasil diimplementasikan dengan fitur check-in dan check-out menggunakan lokasi GPS.
2. Data presensi tersimpan dengan baik di database MySQL pada tabel `presensis`, termasuk informasi waktu dan koordinat.
3. Endpoint API berhasil diuji melalui Postman/Thunder Client dan memberikan response sesuai dengan kebutuhan.
4. Halaman admin/dosen dapat menampilkan laporan presensi mahasiswa secara lengkap sehingga memudahkan proses monitoring kehadiran.

