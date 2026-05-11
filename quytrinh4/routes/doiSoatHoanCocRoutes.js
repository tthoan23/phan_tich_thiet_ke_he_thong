const express = require('express');
const controller = require('../controller/doiSoatHoanCocController');
const DoiSoatHoanCocDAO = require('../dao/DoiSoatHoanCocDAO');

const router = express.Router();

DoiSoatHoanCocDAO.initTable();

router.get('/doi-soat-hoan-coc', controller.layDanhSach);
router.post('/doi-soat-hoan-coc/tinh-toan', controller.tinhToan);
router.post('/doi-soat-hoan-coc', controller.taoBangDoiSoat);

module.exports = router;
