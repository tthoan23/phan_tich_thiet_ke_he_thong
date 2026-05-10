const express = require('express');
const cors = require('cors');
const sql = require('mssql');

const app = express();
app.use(cors());
app.use(express.json());

// Cấu hình kết nối SQL Server
// Đổi 'user', 'password' và 'server' cho đúng với máy local
const dbConfig = {
    user: 'sa', // Tài khoản SQL Server
    password: '123456', // Mật khẩu
    server: 'localhost', // Tên server (có thể là 'localhost\\SQLEXPRESS')
    database: 'HomestayDormDB',
    options: {
        encrypt: false, // Bắt buộc false đối với local
        trustServerCertificate: true
    }
};

app.post('/api/contract', async (req, res) => {
    const { fullName, phone, roommates } = req.body;
    let pool;

    try {
        pool = await sql.connect(dbConfig);
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            const request = new sql.Request(transaction);

            // Tạo ID demo
            const maHopDong = 'HD' + Date.now().toString().slice(-6);
            const maKhachDaiDien = 'KH' + phone.slice(-4) + Date.now().toString().slice(-2);

            // 1. Lưu khách hàng đại diện (Dùng N'' để lưu tiếng Việt có dấu)
            await request.query(`
                INSERT INTO KHACH_HANG (MaKhachHang, HoTen, CCCD) 
                VALUES ('${maKhachDaiDien}', N'${fullName}', '000000000000')
            `);

            // 2. Lưu Hợp đồng
            await request.query(`
                INSERT INTO HOP_DONG_THUE (MaHopDong, MaKhachHang, MaPhong) 
                VALUES ('${maHopDong}', '${maKhachDaiDien}', 'P101')
            `);

            // 3. Nối khách đại diện vào Hợp đồng (DaiDienNhom = 1, dùng GETDATE() của SQL Server)
            await request.query(`
                INSERT INTO HOP_DONG_THANH_VIEN (MaHopDong, MaKhachHang, DaiDienNhom, NgayDonVao) 
                VALUES ('${maHopDong}', '${maKhachDaiDien}', 1, GETDATE())
            `);

            // 4. Lưu các thành viên ở ghép (DaiDienNhom = 0)
            for (const member of roommates) {
                const maThanhVien = 'TV' + member.phone.slice(-4) + Math.floor(Math.random() * 100);
                
                await request.query(`
                    INSERT INTO KHACH_HANG (MaKhachHang, HoTen, CCCD) 
                    VALUES ('${maThanhVien}', N'${member.name}', '${member.cccd}')
                `);

                await request.query(`
                    INSERT INTO HOP_DONG_THANH_VIEN (MaHopDong, MaKhachHang, DaiDienNhom, NgayDonVao) 
                    VALUES ('${maHopDong}', '${maThanhVien}', 0, GETDATE())
                `);
            }

            await transaction.commit();
            res.json({ success: true, message: 'Đã lưu vào SQL Server!' });

        } catch (err) {
            await transaction.rollback();
            throw err;
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        if (pool) pool.close();
    }
});

app.listen(3000, () => {
    console.log('Server Node.js chạy tại http://localhost:3000');
});