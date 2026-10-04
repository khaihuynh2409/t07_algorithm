const mysql = require('mysql2/promise');
require('dotenv').config();

// Create connection pool directly, first without db name to ensure DB exists
const createDbPool = async () => {
  const isUrl = !!process.env.DATABASE_URL;
  
  const connectionConfig = isUrl ? {
    uri: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  } : {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 3306,
  };

  // Create connection for initialization
  const connection = await mysql.createConnection(connectionConfig);

  // Chống SQL Injection bằng cách dùng truy vấn đã mã hóa của thư viện
  const dbName = process.env.DB_NAME || 'defaultdb';
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
  await connection.end();

  const poolConfig = isUrl ? {
    uri: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  } : {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  };
    
  // Trong mysql2, nếu dùng chuỗi URI thì truyền thẳng vào createPool
  const pool = mysql.createPool(poolConfig);

  // Tạo bảng Users
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      studentId VARCHAR(50) PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role ENUM('admin', 'user') DEFAULT 'user',
      status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  try { 
    await pool.query("ALTER TABLE users MODIFY COLUMN status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending'");
  } catch (e) {}

  // Bổ sung các cột mới nếu chưa có
  try { 
    await pool.query("ALTER TABLE users ADD COLUMN fullName VARCHAR(255) DEFAULT ''"); 
    console.log("Added fullName column");
  } catch (e) {
    if (e.code !== 'ER_DUP_FIELDNAME') console.error("Error adding fullName:", e.message);
  }
  
  try { 
    await pool.query("ALTER TABLE users ADD COLUMN className VARCHAR(100) DEFAULT ''"); 
    console.log("Added className column");
  } catch (e) {
    if (e.code !== 'ER_DUP_FIELDNAME') console.error("Error adding className:", e.message);
  }

  try { 
    await pool.query("ALTER TABLE users ADD COLUMN avatarUrl VARCHAR(500) DEFAULT NULL"); 
    console.log("Added avatarUrl column");
  } catch (e) {
    if (e.code !== 'ER_DUP_FIELDNAME') console.error("Error adding avatarUrl:", e.message);
  }

  try { 
    await pool.query("ALTER TABLE users ADD COLUMN score INT DEFAULT 0"); 
    console.log("Added score column");
  } catch (e) {
    if (e.code !== 'ER_DUP_FIELDNAME') console.error("Error adding score:", e.message);
  }

  // Tạo bảng Problems
  await pool.query(`
    CREATE TABLE IF NOT EXISTS problems (
      id VARCHAR(50) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      difficulty ENUM('Easy', 'Medium', 'Hard') DEFAULT 'Easy',
      solvedCount INT DEFAULT 0,
      tags JSON,
      description TEXT,
      examples JSON,
      constraints JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Thêm cột mới cho các bảng cũ nếu chưa có
  try {
    await pool.query("ALTER TABLE problems ADD COLUMN description TEXT");
    console.log("Added description column to problems");
  } catch (e) {
    if (e.code !== 'ER_DUP_FIELDNAME') console.error("Error adding description:", e.message);
  }
  try {
    await pool.query("ALTER TABLE problems ADD COLUMN examples JSON");
    console.log("Added examples column to problems");
  } catch (e) {
    if (e.code !== 'ER_DUP_FIELDNAME') console.error("Error adding examples:", e.message);
  }
  try {
    await pool.query("ALTER TABLE problems ADD COLUMN constraints JSON");
    console.log("Added constraints column to problems");
  } catch (e) {
    if (e.code !== 'ER_DUP_FIELDNAME') console.error("Error adding constraints:", e.message);
  }

  // Seed 2 bài mô phỏng nếu chưa có
  const seedProblems = [
    {
      id: 'HW-001',
      title: 'Hello World',
      difficulty: 'Easy',
      solvedCount: 99999,
      tags: JSON.stringify(['Nhập/Xuất', 'Cơ bản', 'Khởi đầu']),
      description: 'Hãy viết một chương trình in ra màn hình dòng chữ `Hello, World!`.',
      examples: JSON.stringify([
        { input: '(không có đầu vào)', output: 'Hello, World!', explain: 'Chương trình chỉ cần in đúng chuỗi "Hello, World!" ra stdout.' }
      ]),
      constraints: JSON.stringify(['Không có đầu vào.', 'Đầu ra phải chính xác là: Hello, World!'])
    },
    {
      id: 'ADD-001',
      title: 'Cộng hai số nguyên',
      difficulty: 'Easy',
      solvedCount: 87654,
      tags: JSON.stringify(['Toán học', 'Cơ bản', 'Nhập/Xuất']),
      description: 'Cho hai số nguyên `a` và `b`, hãy tính và in ra tổng của chúng.',
      examples: JSON.stringify([
        { input: '3 5', output: '8', explain: '3 + 5 = 8' },
        { input: '-10 20', output: '10', explain: '-10 + 20 = 10' },
        { input: '0 0', output: '0', explain: '0 + 0 = 0' }
      ]),
      constraints: JSON.stringify([
        '-10^9 <= a, b <= 10^9',
        'Đầu vào gồm một dòng duy nhất chứa hai số nguyên a và b cách nhau bởi khoảng trắng.',
        'In ra một số nguyên duy nhất là tổng a + b.'
      ])
    }
  ];

  for (const p of seedProblems) {
    await pool.query(
      'INSERT IGNORE INTO problems (id, title, difficulty, solvedCount, tags, description, examples, constraints) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [p.id, p.title, p.difficulty, p.solvedCount, p.tags, p.description, p.examples, p.constraints]
    );
  }
  console.log('Seed problems: OK');

  // Tạo bảng Password Resets
  await pool.query(`
    CREATE TABLE IF NOT EXISTS password_resets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      token VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  return pool;
};

module.exports = { createDbPool };
