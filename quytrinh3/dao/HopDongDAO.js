const db = require('./db');

function getHopDongById(maHopDong) {
  return db
    .prepare(
      `SELECT
        hd.MaHopDong AS maHopDong,
        hd.MaPhong AS maPhong,
        hd.MaKhachHang AS maKhachHangDaiDien,
        p.SoNguoiOToiDa AS soNguoiOToiDa
      FROM HOP_DONG_THUE hd
      JOIN PHONG p ON hd.MaPhong = p.MaPhong
      WHERE hd.MaHopDong = ?`
    )
    .get(maHopDong);
}

module.exports = {
  getHopDongById,
};
