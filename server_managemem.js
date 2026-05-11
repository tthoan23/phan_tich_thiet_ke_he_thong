/**
 * server_managemem.js
 * Backend API cho UC_ManageMem (Quản lý thành viên lưu trú)
 * Chạy: node server_managemem.js
 * Port: 3099
 */

const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3099;
const DB_PATH = path.join(__dirname, 'homestay.db');

app.use(cors());
app.use(express.json());

// Serve static files (HTML)
app.use(express.static(__dirname));

// Kết nối DB
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ─────────────────────────────────────────────
// GET /api/hop-dong/:maHopDong/thanh-vien
// Lấy danh sách thành viên của hợp đồng (join KHACH_HANG)
// ─────────────────────────────────────────────
app.get('/api/hop-dong/:maHopDong/thanh-vien', (req, res) => {
  const { maHopDong } = req.params;
  try {
    const rows = db.prepare(`
      SELECT
        tv.MaKhachHang,
        tv.DaiDienNhom,
        tv.NgayDonVao,
        kh.HoTen,
        kh.CCCD
      FROM HOP_DONG_THANH_VIEN tv
      JOIN KHACH_HANG kh ON tv.MaKhachHang = kh.MaKhachHang
      WHERE tv.MaHopDong = ?
      ORDER BY tv.DaiDienNhom DESC, kh.HoTen
    `).all(maHopDong);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────────
// GET /api/hop-dong/:maHopDong
// Lấy thông tin hợp đồng + phòng
// ─────────────────────────────────────────────
app.get('/api/hop-dong/:maHopDong', (req, res) => {
  const { maHopDong } = req.params;
  try {
    const row = db.prepare(`
      SELECT hd.*, p.SoNguoiOToiDa, p.KhuVuc, p.LoaiPhong,
             kh.HoTen AS TenDaiDien
      FROM HOP_DONG_THUE hd
      JOIN PHONG p ON hd.MaPhong = p.MaPhong
      JOIN KHACH_HANG kh ON hd.MaKhachHang = kh.MaKhachHang
      WHERE hd.MaHopDong = ?
    `).get(maHopDong);
    if (!row) return res.status(404).json({ success: false, error: 'Không tìm thấy hợp đồng' });
    res.json({ success: true, data: row });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────────
// GET /api/khach-hang/search?q=...
// Tìm kiếm khách hàng theo tên hoặc CCCD
// ─────────────────────────────────────────────
app.get('/api/khach-hang/search', (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q || q.length < 2) return res.json({ success: true, data: [] });
  try {
    const rows = db.prepare(`
      SELECT MaKhachHang, HoTen, CCCD
      FROM KHACH_HANG
      WHERE HoTen LIKE ? OR CCCD LIKE ?
      LIMIT 10
    `).all(`%${q}%`, `%${q}%`);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────────
// POST /api/hop-dong/:maHopDong/them-thanh-vien
// Thêm thành viên mới:
//   - Tạo KHACH_HANG mới (nếu chưa có)
//   - Thêm vào HOP_DONG_THANH_VIEN
// Body: { HoTen, SoDienThoai, CCCD }
// ─────────────────────────────────────────────
app.post('/api/hop-dong/:maHopDong/them-thanh-vien', (req, res) => {
  const { maHopDong } = req.params;
  const { HoTen, SoDienThoai, CCCD } = req.body;

  if (!HoTen || !HoTen.trim()) {
    return res.status(400).json({ success: false, error: 'Họ và tên không được để trống' });
  }

  try {
    // Lấy thông tin hợp đồng để biết MaPhong
    const hopDong = db.prepare(`SELECT MaPhong, SoNguoiOToiDa FROM HOP_DONG_THUE hd JOIN PHONG p ON hd.MaPhong = p.MaPhong WHERE hd.MaHopDong = ?`).get(maHopDong);
    if (!hopDong) return res.status(404).json({ success: false, error: 'Không tìm thấy hợp đồng' });

    // Kiểm tra sức chứa (A2: vượt quá -> chặn)
    const currentCount = db.prepare(`SELECT COUNT(*) as cnt FROM HOP_DONG_THANH_VIEN WHERE MaHopDong = ?`).get(maHopDong).cnt;
    if (currentCount >= hopDong.SoNguoiOToiDa) {
      return res.status(400).json({
        success: false,
        error: `Phòng đã đạt sức chứa tối đa (${hopDong.SoNguoiOToiDa} người). Không thể thêm thành viên.`
      });
    }

    // Tạo mã khách hàng mới (tự động)
    const lastKH = db.prepare(`SELECT MaKhachHang FROM KHACH_HANG ORDER BY MaKhachHang DESC LIMIT 1`).get();
    let newId = 'KH001';
    if (lastKH) {
      const num = parseInt(lastKH.MaKhachHang.replace(/\D/g, ''), 10) + 1;
      newId = 'KH' + String(num).padStart(3, '0');
    }

    // Dùng CCCD mặc định nếu không nhập (SQLite NOT NULL constraint)
    const cccdFinal = (CCCD || '').trim() || `TEMP-${Date.now()}`;
    const ghiChu = SoDienThoai ? `SĐT: ${SoDienThoai}` : null;

    // Transaction: insert KHACH_HANG + HOP_DONG_THANH_VIEN
    const insertAll = db.transaction(() => {
      db.prepare(`
        INSERT INTO KHACH_HANG (MaKhachHang, HoTen, CCCD, SoLuongNguoi, GhiChu)
        VALUES (?, ?, ?, 1, ?)
      `).run(newId, HoTen.trim(), cccdFinal, ghiChu);

      db.prepare(`
        INSERT INTO HOP_DONG_THANH_VIEN (MaHopDong, MaKhachHang, DaiDienNhom, MaPhong, NgayDonVao)
        VALUES (?, ?, 0, ?, date('now'))
      `).run(maHopDong, newId, hopDong.MaPhong);
    });

    insertAll();

    res.json({
      success: true,
      message: 'Thêm thành viên thành công! Chờ BQL duyệt.',
      data: { MaKhachHang: newId, HoTen: HoTen.trim(), CCCD: cccdFinal }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────────
// GET /api/hop-dong
// Lấy danh sách tất cả hợp đồng (cho selector)
// ─────────────────────────────────────────────
app.get('/api/hop-dong', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT hd.MaHopDong, hd.MaPhong, hd.TrangThai, kh.HoTen AS TenDaiDien, p.SoNguoiOToiDa
      FROM HOP_DONG_THUE hd
      JOIN KHACH_HANG kh ON hd.MaKhachHang = kh.MaKhachHang
      JOIN PHONG p ON hd.MaPhong = p.MaPhong
      WHERE hd.TrangThai = 'Active'
    `).all();
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────────
// DELETE /api/hop-dong/:maHopDong/thanh-vien/:maKhachHang
// Xóa thành viên khỏi hợp đồng (không xóa KHACH_HANG)
// ─────────────────────────────────────────────
app.delete('/api/hop-dong/:maHopDong/thanh-vien/:maKhachHang', (req, res) => {
  const { maHopDong, maKhachHang } = req.params;
  try {
    // Không cho xóa đại diện
    const tv = db.prepare(`SELECT DaiDienNhom FROM HOP_DONG_THANH_VIEN WHERE MaHopDong = ? AND MaKhachHang = ?`).get(maHopDong, maKhachHang);
    if (!tv) return res.status(404).json({ success: false, error: 'Không tìm thấy thành viên' });
    if (tv.DaiDienNhom) return res.status(400).json({ success: false, error: 'Không thể xóa đại diện hợp đồng' });

    db.prepare(`DELETE FROM HOP_DONG_THANH_VIEN WHERE MaHopDong = ? AND MaKhachHang = ?`).run(maHopDong, maKhachHang);
    res.json({ success: true, message: 'Đã xóa thành viên' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server UC_ManageMem chạy tại: http://localhost:${PORT}`);
  console.log(`📄 Mở giao diện: http://localhost:${PORT}/quytrinh_uc_managemem.html`);
});
