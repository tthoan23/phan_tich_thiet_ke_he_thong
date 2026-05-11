const DoiSoatHoanCocBUS = require('../bus/DoiSoatHoanCocBUS');

function layDanhSach(req, res) {
  try {
    const data = DoiSoatHoanCocBUS.layDanhSachDoiSoat();
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

function tinhToan(req, res) {
  try {
    const data = DoiSoatHoanCocBUS.previewTinhToan(req.body || {});
    return res.json({ success: true, data });
  } catch (error) {
    const businessErrors = new Set([
      'Mã hợp đồng không hợp lệ',
      'Họ tên khách không hợp lệ',
      'Thiếu biên bản kiểm tra hoặc phiếu trả phòng',
      'Tỷ lệ hoàn cọc không hợp lệ',
      'Tiền cọc không hợp lệ',
      'Nợ tiền thuê không hợp lệ',
      'Nợ tiền điện không hợp lệ',
      'Nợ tiền nước không hợp lệ',
      'Chi phí hư hỏng không hợp lệ',
    ]);

    if (businessErrors.has(error.message)) {
      return res.status(400).json({ success: false, error: error.message });
    }

    return res.status(500).json({ success: false, error: error.message });
  }
}

function taoBangDoiSoat(req, res) {
  try {
    const data = DoiSoatHoanCocBUS.taoBangDoiSoat(req.body || {});
    return res.status(201).json({ success: true, data });
  } catch (error) {
    const businessErrors = new Set([
      'Mã hợp đồng không hợp lệ',
      'Họ tên khách không hợp lệ',
      'Thiếu biên bản kiểm tra hoặc phiếu trả phòng',
      'Tỷ lệ hoàn cọc không hợp lệ',
      'Tiền cọc không hợp lệ',
      'Nợ tiền thuê không hợp lệ',
      'Nợ tiền điện không hợp lệ',
      'Nợ tiền nước không hợp lệ',
      'Chi phí hư hỏng không hợp lệ',
    ]);

    if (businessErrors.has(error.message)) {
      return res.status(400).json({ success: false, error: error.message });
    }

    return res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  layDanhSach,
  tinhToan,
  taoBangDoiSoat,
};
