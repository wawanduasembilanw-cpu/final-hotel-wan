const bcrypt = require('bcryptjs');
const pool = require('./db');

(async () => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('admin123', salt);
    
    await pool.query(
      `UPDATE users SET password = $1 WHERE username = 'admin' OR role = 'admin'`,
      [hash]
    );
    console.log('Password admin berhasil direset menjadi admin123');
  } catch(e) {
    console.error('Error:', e);
  } finally {
    process.exit();
  }
})();
