const { Presensi } = require('../models');
const { Op } = require('sequelize');

// === DAILY REPORT + SEARCH BY NAMA (opsional) ===
exports.getDailyReport = async (req, res) => {
  try {
    // Ambil waktu sekarang dengan zona WIB (UTC+7)
    const now = new Date(Date.now() + 7 * 60 * 60 * 1000);
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    // Ambil query ?nama= atau alias ?q=
    const { nama, q } = req.query || {};
    const search = (nama ?? q)?.toString().trim();

    // Bangun where clause dinamis
    const where = {
      checkIn: { [Op.between]: [startOfDay, endOfDay] },
    };
    if (search && search.length > 0) {
      // Untuk MySQL, LIKE umumnya case-insensitive sesuai collation tabel/kolom
      where.nama = { [Op.like]: `%${search}%` };
    }

    const data = await Presensi.findAll({ where, order: [['checkIn', 'ASC']] });  

    res.status(200).json({
      reportDate: now.toLocaleDateString('id-ID'),
      filter: search || null,
      total: data.length,
      data
    });
  } catch (error) {
    console.error('❌ ERROR getDailyReport:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan pada server',
      error: error.message
    });
  }
};

// === REPORT BY DATE OR RANGE + SEARCH BY NAMA (opsional) ===
// Query options:
// - ?date=YYYY-MM-DD            -> satu hari (WIB)
// - atau ?start=YYYY-MM-DD&end=YYYY-MM-DD  -> rentang hari (WIB)
// - opsional ?nama= or ?q=      -> filter nama LIKE %teks%
exports.getReportByDate = async (req, res) => {
  try {
    const { date, start, end, nama, q } = req.query || {};
    const search = (nama ?? q)?.toString().trim();

    let startAt, endAt;

    if (date) {
      // Perlakukan sebagai hari penuh di WIB
      const d = date.toString();
      const s = new Date(`${d}T00:00:00.000+07:00`);
      const e = new Date(`${d}T23:59:59.999+07:00`);
      if (isNaN(s.getTime()) || isNaN(e.getTime())) {
        return res.status(400).json({ message: 'Format date tidak valid. Gunakan YYYY-MM-DD' });
      }
      startAt = s; endAt = e;
    } else if (start && end) {
      // Rentang hari penuh di WIB jika format hari, atau terima ISO datetime langsung
      const isOnlyDate = /^\d{4}-\d{2}-\d{2}$/.test(start) && /^\d{4}-\d{2}-\d{2}$/.test(end);
      const s = isOnlyDate ? new Date(`${start}T00:00:00.000+07:00`) : new Date(start);
      const e = isOnlyDate ? new Date(`${end}T23:59:59.999+07:00`) : new Date(end);
      if (isNaN(s.getTime()) || isNaN(e.getTime())) {
        return res.status(400).json({ message: 'Format start/end tidak valid. Gunakan YYYY-MM-DD atau ISO datetime' });
      }
      if (e < s) {
        return res.status(400).json({ message: 'end harus >= start' });
      }
      startAt = s; endAt = e;
    } else {
      return res.status(400).json({
        message: 'Parameter tanggal tidak lengkap',
        hint: 'Gunakan ?date=YYYY-MM-DD atau ?start=YYYY-MM-DD&end=YYYY-MM-DD',
      });
    }

    const where = { checkIn: { [Op.between]: [startAt, endAt] } };
    if (search && search.length > 0) {
      where.nama = { [Op.like]: `%${search}%` };
    }

    const data = await Presensi.findAll({ where, order: [['checkIn', 'ASC']] });

    return res.status(200).json({
      range: { startAt, endAt },
      filter: search || null,
      total: data.length,
      data,
    });
  } catch (error) {
    console.error('❌ ERROR getReportByDate:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
  }
};
