const KhachHangDAO = require('../dao/KhachHangDAO');
const HopDongDAO = require('../dao/HopDongDAO');
const ThanhVienDAO = require('../dao/ThanhVienDAO');

function validateHoTen(hoTen) {
  if (!hoTen || !hoTen.trim()) {
    throw new Error('Họ tên không hợp lệ');
  }

  if (hoTen.trim().length > 100) {
    throw new Error('Họ tên quá dài');
  }
}

function validateCCCD(cccd) {
  if (!cccd || !/^\d{9,12}$/.test(cccd.trim())) {
    throw new Error('CCCD không hợp lệ (9-12 chữ số)');
  }
}

function validateSoDienThoai(soDienThoai) {
  if (!soDienThoai) {
    return;
  }

  if (!/^\d{9,11}$/.test(soDienThoai.trim())) {
    throw new Error('Số điện thoại không hợp lệ (9-11 chữ số)');
  }
}

function generateMaKhachHang() {
  return `KH${Date.now().toString(36).toUpperCase()}`;
}

function layDanhSachThanhVien(maHopDong) {
  const hopDong = HopDongDAO.getHopDongById(maHopDong);

  if (!hopDong) {
    throw new Error('Không tìm thấy hợp đồng');
  }

  const danhSach = ThanhVienDAO.listByHopDong(maHopDong);

  return {
    soNguoiToiDa: hopDong.soNguoiOToiDa,
    soLuongHienTai: danhSach.length,
    daiDienId: hopDong.maKhachHangDaiDien,
    danhSach,
  };
}

function themThanhVien(maHopDong, { hoTen, cccd, soDienThoai }) {
  validateHoTen(hoTen);
  validateCCCD(cccd);
  validateSoDienThoai(soDienThoai);

  const hopDong = HopDongDAO.getHopDongById(maHopDong);

  if (!hopDong) {
    throw new Error('Không tìm thấy hợp đồng');
  }

  const currentCount = ThanhVienDAO.countByHopDong(maHopDong);
  if (currentCount >= hopDong.soNguoiOToiDa) {
    throw new Error('Phòng đã đủ sức chứa');
  }

  const existingKhach = KhachHangDAO.findByCCCD(cccd.trim());

  let maKhachHang;
  if (existingKhach) {
    maKhachHang = existingKhach.MaKhachHang || existingKhach.maKhachHang;
  } else {
    maKhachHang = generateMaKhachHang();
    const ghiChu = soDienThoai ? `SĐT: ${soDienThoai.trim()}` : null;

    KhachHangDAO.insertKhachHang({
      maKhachHang,
      hoTen: hoTen.trim(),
      cccd: cccd.trim(),
      ghiChu,
      maKhachHangDaiDien: hopDong.maKhachHangDaiDien,
    });
  }

  if (ThanhVienDAO.existsThanhVien(maHopDong, maKhachHang)) {
    throw new Error('Thành viên đã tồn tại trong hợp đồng');
  }

  const inserted = ThanhVienDAO.insertThanhVien({
    maHopDong,
    maKhachHang,
    maPhong: hopDong.maPhong,
    daiDienNhom: 0,
    ngayDonVao: new Date().toISOString().slice(0, 10),
  });

  return inserted;
}

function xoaThanhVien(maHopDong, maKhachHang) {
  if (!maKhachHang || !maKhachHang.trim()) {
    throw new Error('Mã khách hàng không hợp lệ');
  }

  const hopDong = HopDongDAO.getHopDongById(maHopDong);
  if (!hopDong) {
    throw new Error('Không tìm thấy hợp đồng');
  }

  if (maKhachHang === hopDong.maKhachHangDaiDien) {
    throw new Error('Không thể xóa đại diện hợp đồng');
  }

  if (!ThanhVienDAO.existsThanhVien(maHopDong, maKhachHang)) {
    throw new Error('Thành viên không có trong hợp đồng');
  }

  const changes = ThanhVienDAO.deleteThanhVien(maHopDong, maKhachHang);
  if (!changes) {
    throw new Error('Xóa thất bại');
  }

  return { maHopDong, maKhachHang };
}

module.exports = {
  layDanhSachThanhVien,
  themThanhVien,
  xoaThanhVien,
};
