const ThanhVienBUS = require('../bus/ThanhVienBUS');

function layDanhSachThanhVien(req, res) {
  try {
    const { maHopDong } = req.params;
    const data = ThanhVienBUS.layDanhSachThanhVien(maHopDong);
    return res.json({ success: true, data });
  } catch (error) {
    if (error.message === 'Không tìm thấy hợp đồng') {
      return res.status(404).json({ success: false, error: error.message });
    }

    return res.status(500).json({ success: false, error: error.message });
  }
}

function themThanhVien(req, res) {
  try {
    const { maHopDong } = req.params;
    const payload = {
      hoTen: req.body?.hoTen,
      cccd: req.body?.cccd,
      soDienThoai: req.body?.soDienThoai,
    };

    const created = ThanhVienBUS.themThanhVien(maHopDong, payload);
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    const businessErrors = new Set([
      'Họ tên không hợp lệ',
      'Họ tên quá dài',
      'CCCD không hợp lệ (9-12 chữ số)',
      'Số điện thoại không hợp lệ (9-11 chữ số)',
      'Phòng đã đủ sức chứa',
      'Thành viên đã tồn tại trong hợp đồng',
    ]);

    if (error.message === 'Không tìm thấy hợp đồng') {
      return res.status(404).json({ success: false, error: error.message });
    }

    if (businessErrors.has(error.message)) {
      return res.status(400).json({ success: false, error: error.message });
    }

    return res.status(500).json({ success: false, error: error.message });
  }
}

function xoaThanhVien(req, res) {
  try {
    const { maHopDong, maKhachHang } = req.params;
    const result = ThanhVienBUS.xoaThanhVien(maHopDong, maKhachHang);
    return res.json({ success: true, data: result });
  } catch (error) {
    const businessErrors = new Set([
      'Không thể xóa đại diện hợp đồng',
      'Thành viên không có trong hợp đồng',
      'Xóa thất bại',
      'Mã khách hàng không hợp lệ',
    ]);

    if (error.message === 'Không tìm thấy hợp đồng') {
      return res.status(404).json({ success: false, error: error.message });
    }

    if (businessErrors.has(error.message)) {
      return res.status(400).json({ success: false, error: error.message });
    }

    return res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  layDanhSachThanhVien,
  themThanhVien,
  xoaThanhVien,
};
