const db = require('./db');

function findByCCCD(cccd) {
  return db
    .prepare(
      `SELECT MaKhachHang, HoTen, CCCD, GhiChu, MaKhachHangDaiDien
       FROM KHACH_HANG
       WHERE CCCD = ?`
    )
    .get(cccd);
}

function getById(maKhachHang) {
  return db
    .prepare(
      `SELECT MaKhachHang, HoTen, CCCD, GhiChu, MaKhachHangDaiDien
       FROM KHACH_HANG
       WHERE MaKhachHang = ?`
    )
    .get(maKhachHang);
}

function insertKhachHang({ maKhachHang, hoTen, cccd, ghiChu, maKhachHangDaiDien }) {
  db.prepare(
    `INSERT INTO KHACH_HANG (
      MaKhachHang,
      CCCD,
      HoTen,
      GhiChu,
      MaKhachHangDaiDien
    ) VALUES (?, ?, ?, ?, ?)`
  ).run(maKhachHang, cccd, hoTen, ghiChu ?? null, maKhachHangDaiDien ?? null);

  return getById(maKhachHang);
}

module.exports = {
  findByCCCD,
  getById,
  insertKhachHang,
};
