const { Presensi } = require('../models');
const { format } = require('date-fns-tz');
const timeZone = 'Asia/Jakarta';

// === CHECK IN ===
exports.CheckIn = async (req, res) => {
  try {
    // Ambil data user, baik dari middleware (req.user) atau body Postman (req.body)
    const userId = req.user?.id ?? req.body?.userId;
    const nama = req.user?.nama ?? req.body?.nama;

    const waktuSekarang = new Date();

    // Validasi input minimum
    if (!userId || !nama) {
      return res.status(400).json({
        message: 'Parameter tidak lengkap',
        detail: 'Harap kirim userId dan nama pada body JSON atau aktifkan middleware auth yang mengisi req.user',
        contohBody: { userId: 1, nama: 'Budi' },
      });
    }

    // Cek apakah user sudah melakukan check-in dan belum check-out
    const existingRecord = await Presensi.findOne({
      where: { userId, checkOut: null },
    });

    if (existingRecord) {
      return res.status(400).json({ message: "Anda sudah melakukan check-in hari ini." });
    }

    // Buat data presensi baru
    const newRecord = await Presensi.create({
      userId,
      nama,
      checkIn: waktuSekarang,
    });

    res.status(201).json({
      message: `Halo ${nama}, check-in berhasil pukul ${format(waktuSekarang, 'HH:mm:ss', { timeZone })} WIB`,
      data: newRecord,
    });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan server", error: error.message });
  }
};

// === CHECK OUT ===
exports.CheckOut = async (req, res) => {
  try {
    const userId = req.user?.id ?? req.body?.userId;
    const nama = req.user?.nama ?? req.body?.nama;
    const waktuSekarang = new Date();

    if (!userId || !nama) {
      return res.status(400).json({
        message: 'Parameter tidak lengkap',
        detail: 'Harap kirim userId dan nama pada body JSON atau aktifkan middleware auth yang mengisi req.user',
        contohBody: { userId: 1, nama: 'Budi' },
      });
    }

    const record = await Presensi.findOne({
      where: { userId, checkOut: null },
    });

    if (!record) {
      return res.status(404).json({ message: 'Tidak ada catatan check-in aktif.' });
    }

    record.checkOut = waktuSekarang;
    await record.save();

    res.json({
      message: `Selamat jalan ${nama}, check-out berhasil pukul ${format(waktuSekarang, 'HH:mm:ss', { timeZone })} WIB`,
      data: record,
    });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
  }
};

// === DELETE PRESENSI ===
exports.deletePresensi = async (req, res) => {
  try {
    const { id } = req.params;

    // Validasi ID
    const parsedId = Number(id);
    if (!Number.isInteger(parsedId) || parsedId <= 0) {
      return res.status(400).json({ message: 'ID tidak valid' });
    }

    // Cari data presensi berdasarkan primary key
    const record = await Presensi.findByPk(parsedId);
    if (!record) {
      return res.status(404).json({ message: 'Data presensi tidak ditemukan' });
    }

    // Simpan salinan data sebelum dihapus (untuk response)
    const deletedData = record.toJSON();

    // Hapus data
    await record.destroy();

    return res.status(200).json({
      message: 'Data presensi berhasil dihapus',
      data: deletedData,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
  }
};
 
// === UPDATE PRESENSI (PUT) ===
exports.updatePresensi = async (req, res) => {
  console.log("🔥 Route PUT /api/presensi/:id terpicu");
  try {
    const presensiId = req.params.id;
    const { checkIn, checkOut, nama } = req.body;
    if (checkIn === undefined && checkOut === undefined && nama === undefined) {
      return res.status(400).json({
        message:
          "Request body tidak berisi data yang valid untuk diupdate (checkIn, checkOut, atau nama).",
      });
    }
    const recordToUpdate = await Presensi.findByPk(presensiId);
    if (!recordToUpdate) {
      return res
        .status(404)
        .json({ message: "Catatan presensi tidak ditemukan." });
    }

    recordToUpdate.checkIn = checkIn || recordToUpdate.checkIn;
    recordToUpdate.checkOut = checkOut || recordToUpdate.checkOut;
    recordToUpdate.nama = nama || recordToUpdate.nama;
    await recordToUpdate.save();

    res.json({
      message: "Data presensi berhasil diperbarui.",
      data: recordToUpdate,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};
