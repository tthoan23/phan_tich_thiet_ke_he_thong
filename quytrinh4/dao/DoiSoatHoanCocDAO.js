const db = require('./db');

function initTable() {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS DOI_SOAT_HOAN_COC (
      MaDoiSoat TEXT PRIMARY KEY,
      MaHopDong TEXT NOT NULL,
      MaPhieuTraPhong TEXT,
      MaBienBanKiemTra TEXT,
      HoTenKhach TEXT NOT NULL,
      MaPhong TEXT,
      TienCoc REAL NOT NULL,
      TyLeHoanCoc REAL NOT NULL,
      NoTienThue REAL NOT NULL DEFAULT 0,
      NoTienDien REAL NOT NULL DEFAULT 0,
      NoTienNuoc REAL NOT NULL DEFAULT 0,
      ChiPhiHuHong REAL NOT NULL DEFAULT 0,
      TongNo REAL NOT NULL DEFAULT 0,
      CocDuocHoan REAL NOT NULL DEFAULT 0,
      SoTienHoanKhach REAL NOT NULL DEFAULT 0,
      KhachCanDongThem REAL NOT NULL DEFAULT 0,
      TrangThai TEXT NOT NULL DEFAULT 'CHO_KHACH_XAC_NHAN',
      GhiChu TEXT,
      NgayTao TEXT NOT NULL
    )
  `).run();
}

function list() {
  return db.prepare(`
    SELECT *
    FROM DOI_SOAT_HOAN_COC
    ORDER BY NgayTao DESC
  `).all();
}

function create(payload) {
  db.prepare(`
    INSERT INTO DOI_SOAT_HOAN_COC (
      MaDoiSoat, MaHopDong, MaPhieuTraPhong, MaBienBanKiemTra, HoTenKhach, MaPhong,
      TienCoc, TyLeHoanCoc, NoTienThue, NoTienDien, NoTienNuoc, ChiPhiHuHong,
      TongNo, CocDuocHoan, SoTienHoanKhach, KhachCanDongThem, TrangThai, GhiChu, NgayTao
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    payload.maDoiSoat,
    payload.maHopDong,
    payload.maPhieuTraPhong,
    payload.maBienBanKiemTra,
    payload.hoTenKhach,
    payload.maPhong,
    payload.tienCoc,
    payload.tyLeHoanCoc,
    payload.noTienThue,
    payload.noTienDien,
    payload.noTienNuoc,
    payload.chiPhiHuHong,
    payload.tongNo,
    payload.cocDuocHoan,
    payload.soTienHoanKhach,
    payload.khachCanDongThem,
    payload.trangThai,
    payload.ghiChu,
    payload.ngayTao
  );

  return db.prepare('SELECT * FROM DOI_SOAT_HOAN_COC WHERE MaDoiSoat = ?').get(payload.maDoiSoat);
}

module.exports = {
  initTable,
  list,
  create,
};
