const db = require('./db');

function listByHopDong(maHopDong) {
  return db
    .prepare(
      `SELECT
        tv.MaKhachHang AS maKhachHang,
        tv.MaHopDong AS maHopDong,
        tv.DaiDienNhom AS daiDienNhom,
        tv.NgayDonVao AS ngayDonVao,
        kh.HoTen AS hoTen,
        kh.CCCD AS cccd,
        kh.GhiChu AS ghiChu
      FROM HOP_DONG_THANH_VIEN tv
      JOIN KHACH_HANG kh ON tv.MaKhachHang = kh.MaKhachHang
      WHERE tv.MaHopDong = ?
      ORDER BY tv.DaiDienNhom DESC, tv.NgayDonVao ASC`
    )
    .all(maHopDong);
}

function countByHopDong(maHopDong) {
  const row = db
    .prepare(
      `SELECT COUNT(*) AS total
       FROM HOP_DONG_THANH_VIEN
       WHERE MaHopDong = ?`
    )
    .get(maHopDong);

  return row?.total ?? 0;
}

function existsThanhVien(maHopDong, maKhachHang) {
  const row = db
    .prepare(
      `SELECT 1 AS ok
       FROM HOP_DONG_THANH_VIEN
       WHERE MaHopDong = ? AND MaKhachHang = ?`
    )
    .get(maHopDong, maKhachHang);

  return Boolean(row);
}

function insertThanhVien({ maHopDong, maKhachHang, maPhong, daiDienNhom, ngayDonVao }) {
  db.prepare(
    `INSERT INTO HOP_DONG_THANH_VIEN (
      MaHopDong,
      MaKhachHang,
      DaiDienNhom,
      MaPhong,
      NgayDonVao
    ) VALUES (?, ?, ?, ?, ?)`
  ).run(maHopDong, maKhachHang, daiDienNhom ?? 0, maPhong ?? null, ngayDonVao);

  return db
    .prepare(
      `SELECT
        tv.MaKhachHang AS maKhachHang,
        tv.MaHopDong AS maHopDong,
        tv.DaiDienNhom AS daiDienNhom,
        tv.NgayDonVao AS ngayDonVao,
        kh.HoTen AS hoTen,
        kh.CCCD AS cccd,
        kh.GhiChu AS ghiChu
      FROM HOP_DONG_THANH_VIEN tv
      JOIN KHACH_HANG kh ON tv.MaKhachHang = kh.MaKhachHang
      WHERE tv.MaHopDong = ? AND tv.MaKhachHang = ?`
    )
    .get(maHopDong, maKhachHang);
}

function deleteThanhVien(maHopDong, maKhachHang) {
  const info = db
    .prepare(
      `DELETE FROM HOP_DONG_THANH_VIEN
       WHERE MaHopDong = ? AND MaKhachHang = ?`
    )
    .run(maHopDong, maKhachHang);

  return info.changes;
}

module.exports = {
  listByHopDong,
  countByHopDong,
  existsThanhVien,
  insertThanhVien,
  deleteThanhVien,
};
