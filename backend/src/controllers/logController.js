const pool = require('../../config/db');

const getLogs = async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 10, search = '' } = req.query;
  const offset = (page - 1) * limit;

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    const searchQuery = `%${search}%`;
    const query = `
      SELECT * FROM logs
      WHERE action LIKE ? OR user_id LIKE ?
      ORDER BY timestamp DESC
      LIMIT ? OFFSET ?
    `;
    const countQuery = `
      SELECT COUNT(*) AS total FROM logs
      WHERE action LIKE ? OR user_id LIKE ?
    `;

    const [[countResult]] = await pool.query(countQuery, [searchQuery, searchQuery]);
    const totalItems = countResult.total;

    const [logs] = await pool.query(query, [searchQuery, searchQuery, parseInt(limit), parseInt(offset)]);

    await pool.query('INSERT INTO logs (user_id, action) VALUES (?, ?)', [
      userId,
      'Logs list viewed',
    ]);

    res.json({
      data: logs,
      meta: {
        totalItems,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalItems / limit),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

module.exports = { getLogs };