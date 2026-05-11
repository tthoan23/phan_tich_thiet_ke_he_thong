const express = require('express');
const ThanhVienController = require('../controller/thanhVienController');

const router = express.Router();

router.get('/hop-dong/:maHopDong/thanh-vien', ThanhVienController.layDanhSachThanhVien);
router.post('/hop-dong/:maHopDong/thanh-vien', ThanhVienController.themThanhVien);
router.delete('/hop-dong/:maHopDong/thanh-vien/:maKhachHang', ThanhVienController.xoaThanhVien);

module.exports = router;
