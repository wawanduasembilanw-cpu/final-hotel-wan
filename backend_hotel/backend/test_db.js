const pool = require('./db');
(async () => {
  try {
    const res = await pool.query('SELECT 1');
    console.log('DB works');
  } catch(e) {
    console.error('DB error', e);
  }
  process.exit();
})();
