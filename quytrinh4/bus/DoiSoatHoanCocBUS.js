const DoiSoatHoanCocDAO = require('../dao/DoiSoatHoanCocDAO');

function parseNonNegativeNumber(value, fieldName) {
  const numberValue = Number(value ?? 0);
  if (!Number.isFinite(numberValue) || numberValue < 0) {
    throw new Error(`${fieldName} không hợp lệ`);
  }
  return numberValue;
}

function validatePayload(payload) {
  if (!payload?.maHopDong || !String(payload.maHopDong).trim()) {
    throw new Error('Mã hợp đồng không hợp lệ');
  }

  if (!payload?.hoTenKhach || !String(payload.hoTenKhach).trim()) {
    throw new Error('Họ tên khách không hợp lệ');
  }

  const maPhieuTraPhong = String(payload?.maPhieuTraPhong || '').trim();
  const maBienBanKiemTra = String(payload?.maBienBanKiemTra || '').trim();
  if (!maPhieuTraPhong && !maBienBanKiemTra) {
    throw new Error('Thiếu biên bản kiểm tra hoặc phiếu trả phòng');
  }

  const tyLeHoanCoc = Number(payload?.tyLeHoanCoc);
  const allowedRatios = new Set([80, 50, 70, 100]);
  if (!Number.isFinite(tyLeHoanCoc) || !allowedRatios.has(tyLeHoanCoc)) {
    throw new Error('Tỷ lệ hoàn cọc không hợp lệ');
  }

  return {
    maHopDong: String(payload.maHopDong).trim(),
    maPhieuTraPhong,
    maBienBanKiemTra,
    hoTenKhach: String(payload.hoTenKhach).trim(),
    maPhong: String(payload?.maPhong || '').trim() || null,
    tienCoc: parseNonNegativeNumber(payload?.tienCoc, 'Tiền cọc'),
    tyLeHoanCoc,
    noTienThue: parseNonNegativeNumber(payload?.noTienThue, 'Nợ tiền thuê'),
    noTienDien: parseNonNegativeNumber(payload?.noTienDien, 'Nợ tiền điện'),
    noTienNuoc: parseNonNegativeNumber(payload?.noTienNuoc, 'Nợ tiền nước'),
    chiPhiHuHong: parseNonNegativeNumber(payload?.chiPhiHuHong, 'Chi phí hư hỏng'),
    ghiChu: String(payload?.ghiChu || '').trim() || null,
  };
}

function tinhDoiSoat(payload) {
  const cocDuocHoan = (payload.tienCoc * payload.tyLeHoanCoc) / 100;
  const tongNo = payload.noTienThue + payload.noTienDien + payload.noTienNuoc + payload.chiPhiHuHong;

  if (tongNo <= cocDuocHoan) {
    return {
      cocDuocHoan,
      tongNo,
      soTienHoanKhach: cocDuocHoan - tongNo,
      khachCanDongThem: 0,
    };
  }

  return {
    cocDuocHoan,
    tongNo,
    soTienHoanKhach: 0,
    khachCanDongThem: tongNo - cocDuocHoan,
  };
}

function taoBangDoiSoat(payload) {
  const validPayload = validatePayload(payload);
  const calculated = tinhDoiSoat(validPayload);

  return DoiSoatHoanCocDAO.create({
    maDoiSoat: `DS${Date.now().toString(36).toUpperCase()}`,
    ...validPayload,
    ...calculated,
    trangThai: 'CHO_KHACH_XAC_NHAN',
    ngayTao: new Date().toISOString(),
  });
}

function previewTinhToan(payload) {
  const validPayload = validatePayload(payload);
  return {
    ...validPayload,
    ...tinhDoiSoat(validPayload),
  };
}

function layDanhSachDoiSoat() {
  return DoiSoatHoanCocDAO.list();
}

module.exports = {
  taoBangDoiSoat,
  previewTinhToan,
  layDanhSachDoiSoat,
};
