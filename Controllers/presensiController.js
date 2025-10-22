const { Presensi } = require('../models');
const { format } = require('date-fns-tz');
const timeZone = 'Asia/Jakarta';

// === CHECK IN ===
exports.CheckIn = async (req, res) => {
  try {
    const { id: userId, nama: userName } = req.user;
    const waktuSekarang = new Date();

    const existingRecord = await Presensi.findOne({
      where: { userId, checkOut: null }
    });

    if (existingRecord) {
      return res.status(400).json({ message: 'Anda sudah melakukan check-in hari ini.' });
    }

    const newRecord = await Presensi.create({
      userId,
      nama: userName,
      checkIn: waktuSekarang
    });

    res.status(201).json({
      message: `Halo ${userName}, check-in berhasil pukul ${format(waktuSekarang, 'HH:mm:ss', { timeZone })} WIB`,
      data: newRecord
    });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
  }
};

// === CHECK OUT ===
exports.CheckOut = async (req, res) => {
  try {
    const { id: userId, nama: userName } = req.user;
    const waktuSekarang = new Date();

    const record = await Presensi.findOne({
      where: { userId, checkOut: null }
    });

    if (!record) {
      return res.status(404).json({ message: 'Tidak ada catatan check-in aktif.' });
    }

    record.checkOut = waktuSekarang;
    await record.save();

    res.json({
      message: `Selamat jalan ${userName}, check-out berhasil pukul ${format(waktuSekarang, 'HH:mm:ss', { timeZone })} WIB`,
      data: record
    });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
  }
};
