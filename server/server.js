const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config();
const { createDbPool } = require('./db');

const app = express();

// SECURITY HEADERS (Chống XSS, Clickjacking, MIME sniffing...)
app.use(helmet()); 
// Bật CORS an toàn
app.use(cors());
// Parse JSON body
app.use(express.json());

let pool;

// Cấu hình Multer (Bảo mật tải file)
const uploadDir = path.join(__dirname, 'uploads', 'avatars');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    // VÁ LỖ HỔNG: Tránh Path Traversal & XSS bằng cách không dùng tên file gốc
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${req.user.studentId}-${Date.now()}${ext}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // VÁ LỖ HỔNG: Giới hạn 2MB (chống DoS)
  fileFilter: (req, file, cb) => {
    // VÁ LỖ HỔNG: Xác thực MIME Type (chống tải file thực thi .php, .js)
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ cho phép định dạng ảnh (JPG, PNG, GIF, WEBP)'));
    }
  }
});

// Cho phép truy cập thư mục uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Khởi động Database
createDbPool().then(p => {
  pool = p;
  console.log("Connected to MySQL securely.");
  
  // Tạo tài khoản admin ban đầu nếu chưa có (mã hóa mật khẩu)
  pool.execute('SELECT studentId FROM users WHERE role = ?', ['admin']).then(async ([rows]) => {
    if (rows.length === 0) {
      const hash = await bcrypt.hash('admin', 10);
      await pool.execute(
        'INSERT INTO users (studentId, email, password, role, status) VALUES (?, ?, ?, ?, ?)',
        ['admin', 'admin@admin.com', hash, 'admin', 'approved']
      );
      console.log("Created default admin account.");
    }
  });
}).catch(console.error);

// Middleware kiểm tra JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Quyền truy cập bị từ chối!" });
  next();
};

// === API ROUTES ===

// Root route (dành cho browser truy cập trực tiếp)
app.get('/', (req, res) => {
  res.json({ status: "ok", message: "Algo Judge API is running. Please use frontend to interact." });
});

// 1. Đăng ký (Bảo vệ bằng Parameterized Queries chống SQL Injection)
app.post('/api/auth/register', async (req, res) => {
  const { studentId, email, password, fullName, className } = req.body;
  if (!studentId || !email || !password) return res.status(400).json({ message: 'Thiếu thông tin!' });

  try {
    const [existing] = await pool.execute('SELECT studentId FROM users WHERE studentId = ? OR email = ?', [studentId, email]);
    if (existing.length > 0) return res.status(400).json({ message: 'Mã số sinh viên hoặc Email đã tồn tại!' });

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.execute(
      'INSERT INTO users (studentId, email, password, role, status, fullName, className) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [studentId, email, hashedPassword, 'user', 'pending', fullName || '', className || '']
    );
    res.json({ message: 'Đăng ký thành công! Vui lòng chờ Admin phê duyệt.' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server!' });
  }
});

// 2. Đăng nhập
app.post('/api/auth/login', async (req, res) => {
  const { identifier, password } = req.body;
  try {
    const [rows] = await pool.execute('SELECT * FROM users WHERE studentId = ? OR email = ?', [identifier, identifier]);
    if (rows.length === 0) return res.status(400).json({ message: 'Tài khoản không tồn tại!' });

    const user = rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ message: 'Sai mật khẩu!' });
    
    if (user.status === 'pending') return res.status(403).json({ message: 'Tài khoản đang chờ duyệt!' });

    const token = jwt.sign({ studentId: user.studentId, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { studentId: user.studentId, email: user.email, role: user.role, status: user.status, fullName: user.fullName, className: user.className, avatarUrl: user.avatarUrl } });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server!' });
  }
});

// --- MỚI: QUÊN MẬT KHẨU ---

// Cấu hình Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) return res.status(404).json({ message: 'Email không tồn tại trong hệ thống!' });

    const token = crypto.randomBytes(32).toString('hex');
    await pool.execute('INSERT INTO password_resets (email, token) VALUES (?, ?)', [email, token]);

    const resetLink = `http://localhost:5173/reset-password?token=${token}`;
    
    await transporter.sendMail({
      from: `"ASET System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Yêu cầu khôi phục mật khẩu - ASET',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #0ea5e9;">ASET - Khôi phục mật khẩu</h2>
          <p>Xin chào,</p>
          <p>Bạn nhận được email này vì đã yêu cầu khôi phục mật khẩu cho tài khoản ASET.</p>
          <p>Vui lòng click vào nút bên dưới để tạo mật khẩu mới:</p>
          <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #0ea5e9; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 15px 0;">Đổi Mật Khẩu Mới</a>
          <p>Hoặc copy đường link này vào trình duyệt: <br/> <a href="${resetLink}">${resetLink}</a></p>
          <p style="color: #ef4444; font-size: 0.9em;">Lưu ý: Link này sẽ vô hiệu hóa sau 1 giờ.</p>
          <p>Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
        </div>
      `
    });

    res.json({ message: 'Đã gửi link khôi phục. Vui lòng kiểm tra email của bạn!' });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: 'Lỗi khi gửi email. Vui lòng kiểm tra cấu hình SMTP!' });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const [resets] = await pool.execute('SELECT * FROM password_resets WHERE token = ?', [token]);
    if (resets.length === 0) return res.status(400).json({ message: 'Link khôi phục không hợp lệ hoặc đã hết hạn!' });
    
    const resetRecord = resets[0];
    const createdTime = new Date(resetRecord.created_at).getTime();
    const now = new Date().getTime();
    if (now - createdTime > 3600000) { // 1 giờ
      return res.status(400).json({ message: 'Link khôi phục đã hết hạn!' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.execute('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, resetRecord.email]);
    await pool.execute('DELETE FROM password_resets WHERE email = ?', [resetRecord.email]); // Xóa tất cả token của user này

    res.json({ message: 'Đổi mật khẩu thành công! Bạn có thể đăng nhập ngay bây giờ.' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server!' });
  }
});


// 3. Lấy danh sách Users (Chỉ Admin)
app.get('/api/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT studentId, email, role, status, fullName, className, avatarUrl, created_at FROM users');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server!' });
  }
});

// 4. Phê duyệt User (Chỉ Admin)
app.post('/api/users/approve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.execute("UPDATE users SET status = 'approved' WHERE studentId = ?", [req.body.studentId]);
    res.json({ success: true });
  } catch (error) {
    console.error("Approve error:", error);
    res.status(500).json({ message: 'Lỗi server!' });
  }
});

// Từ chối User (Chỉ Admin) - Xóa hẳn khỏi CSDL
app.post('/api/users/reject', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.execute("DELETE FROM users WHERE studentId = ?", [req.body.studentId]);
    res.json({ success: true });
  } catch (error) {
    console.error("Reject error:", error);
    res.status(500).json({ message: 'Lỗi server!' });
  }
});

// Xóa User (Chỉ Admin)
app.post('/api/users/delete', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.execute("DELETE FROM users WHERE studentId = ?", [req.body.studentId]);
    res.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: 'Lỗi server!' });
  }
});

// Phê duyệt Hàng loạt
app.post('/api/users/bulk-approve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { studentIds } = req.body;
    if (!studentIds || !studentIds.length) return res.json({ success: true });
    
    const placeholders = studentIds.map(() => '?').join(',');
    await pool.execute(`UPDATE users SET status = 'approved' WHERE studentId IN (${placeholders})`, studentIds);
    res.json({ success: true });
  } catch (error) {
    console.error("Bulk approve error:", error);
    res.status(500).json({ message: 'Lỗi server!' });
  }
});

// Từ chối (Xóa) Hàng loạt
app.post('/api/users/bulk-reject', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { studentIds } = req.body;
    if (!studentIds || !studentIds.length) return res.json({ success: true });
    
    const placeholders = studentIds.map(() => '?').join(',');
    await pool.execute(`DELETE FROM users WHERE studentId IN (${placeholders})`, studentIds);
    res.json({ success: true });
  } catch (error) {
    console.error("Bulk reject error:", error);
    res.status(500).json({ message: 'Lỗi server!' });
  }
});

// 5. Thăng cấp Admin (Chỉ Admin)
app.post('/api/users/promote', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.execute("UPDATE users SET role = 'admin' WHERE studentId = ?", [req.body.studentId]);
    res.json({ success: true });
  } catch (error) {
    console.error("Promote error:", error);
    res.status(500).json({ message: 'Lỗi server!' });
  }
});

// 6. Lấy bài tập
app.get('/api/problems', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM problems');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server!' });
  }
});

// Cập nhật hồ sơ (Người dùng tự cập nhật)
app.post('/api/users/profile', authenticateToken, async (req, res) => {
  const { fullName, className } = req.body;
  try {
    await pool.execute("UPDATE users SET fullName = ?, className = ? WHERE studentId = ?", [fullName || '', className || '', req.user.studentId]);
    res.json({ success: true, message: 'Cập nhật thành công!' });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: 'Lỗi server!' });
  }
});

// Cập nhật Avatar (Bảo vệ bằng Middleware FileFilter)
app.post('/api/users/avatar', authenticateToken, (req, res, next) => {
  upload.single('avatar')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ message: 'Kích thước file quá lớn (Tối đa 2MB)' });
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Vui lòng chọn một file ảnh!' });
    
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    await pool.execute("UPDATE users SET avatarUrl = ? WHERE studentId = ?", [avatarUrl, req.user.studentId]);
    res.json({ success: true, avatarUrl, message: 'Cập nhật ảnh đại diện thành công!' });
  } catch (error) {
    console.error("Avatar upload error:", error);
    res.status(500).json({ message: 'Lỗi server!' });
  }
});

// Bảng xếp hạng (Leaderboard)
app.get('/api/leaderboard', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT studentId, fullName, className, avatarUrl, score FROM users WHERE status = "approved" AND role = "user" ORDER BY score DESC, created_at ASC LIMIT 100');
    res.json(rows);
  } catch (error) {
    console.error("Leaderboard error:", error);
    res.status(500).json({ message: 'Lỗi server!' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Secure Backend running on port ${PORT}`));
