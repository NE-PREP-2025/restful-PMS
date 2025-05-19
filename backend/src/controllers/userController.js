const bcrypt = require('bcrypt');
const pool = require('../../config/db');

const getProfile = async (req, res) => {
  const userId = req.user.id;
  try {
    const [result] = await pool.query('SELECT id, name, email, role FROM users WHERE id = ?', [
      userId,
    ]);
    if (result.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    await pool.query('INSERT INTO logs (user_id, action) VALUES (?, ?)', [
      userId,
      'User profile viewed',
    ]);

    res.json(result[0]);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { name, email, password } = req.body;
  try {
    const updates = [];
    const values = [];

    if (name) {
      updates.push('name = ?');
      values.push(name);
    }
    if (email) {
      updates.push('email = ?');
      values.push(email);
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push('password = ?');
      values.push(hashedPassword);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    values.push(userId);

    await pool.query(query, values);

    const [updatedUser] = await pool.query('SELECT id, name, email, role FROM users WHERE id = ?', [
      userId,
    ]);

    await pool.query('INSERT INTO logs (user_id, action) VALUES (?, ?)', [
      userId,
      'Profile updated',
    ]);

    res.json(updatedUser[0]);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(400).json({ error: 'Email already exists or server error' });
  }
};

const getUsers = async (req, res) => {
  const { page = 1, limit = 10, search = '' } = req.query;
  const offset = (page - 1) * limit;
  const searchQuery = `%${search}%`;

  try {
    const [[countResult]] = await pool.query(
      'SELECT COUNT(*) AS total FROM users WHERE name LIKE ? OR email LIKE ?',
      [searchQuery, searchQuery]
    );
    const totalItems = countResult.total;

    const [users] = await pool.query(
      'SELECT id, name, email, role, is_verified FROM users WHERE name LIKE ? OR email LIKE ? ORDER BY id LIMIT ? OFFSET ?',
      [searchQuery, searchQuery, parseInt(limit), parseInt(offset)]
    );

    await pool.query('INSERT INTO logs (user_id, action) VALUES (?, ?)', [
      req.user.id,
      'Users list viewed',
    ]);

    res.json({
      data: users,
      meta: {
        totalItems,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalItems / limit),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const [userResult] = await pool.query('SELECT id FROM users WHERE id = ?', [id]);
    if (userResult.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    await pool.query('DELETE FROM users WHERE id = ?', [id]);

    await pool.query('INSERT INTO logs (user_id, action) VALUES (?, ?)', [
      req.user.id,
      `User ${id} deleted`,
    ]);

    res.json({ message: 'User deleted' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getProfile, updateProfile, getUsers, deleteUser };