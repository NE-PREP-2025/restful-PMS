const pool = require('../../config/db');

const createVehicle = async (req, res) => {
  const userId = req.user.id;
  const { plate_number, vehicle_type, size, other_attributes } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO vehicles (user_id, plate_number, vehicle_type, size, other_attributes) VALUES (?, ?, ?, ?, ?)',
      [userId, plate_number, vehicle_type, size, other_attributes || '{}']
    );

    await pool.query('INSERT INTO logs (user_id, action) VALUES (?, ?)', [
      userId,
      `Vehicle ${plate_number} created`,
    ]);

    const [newVehicle] = await pool.query('SELECT * FROM vehicles WHERE id = ?', [result.insertId]);
    res.status(201).json(newVehicle[0]);
  } catch (error) {
    console.error('Create vehicle error:', error);
    res.status(400).json({ error: 'Plate number already exists or server error' });
  }
};

const getVehicles = async (req, res) => {
  const userId = req.user.id;
  const isAdmin = req.user.role === 'admin';
  const { page = 1, limit = 10, search = '' } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit); // Ensure these are integers

  try {
    const searchQuery = `%${search}%`;
    let query, countQuery, params;

    if (isAdmin) {
      countQuery = `
        SELECT COUNT(*) AS total
        FROM vehicles 
        WHERE plate_number LIKE ? OR vehicle_type LIKE ? OR id LIKE ?
      `;
      query = `
        SELECT v.*, 
               (SELECT request_status 
                FROM slot_requests 
                WHERE vehicle_id = v.id AND request_status = 'approved' 
                LIMIT 1) AS approval_status
        FROM vehicles v
        WHERE plate_number LIKE ? OR vehicle_type LIKE ? OR id LIKE ?
        ORDER BY id
        LIMIT ? OFFSET ?
      `;
      params = [searchQuery, searchQuery, searchQuery, parseInt(limit), offset];
    } else {
      countQuery = `
        SELECT COUNT(*) AS total
        FROM vehicles 
        WHERE user_id = ? AND (plate_number LIKE ? OR vehicle_type LIKE ?)
      `;
      query = `
        SELECT * 
        FROM vehicles 
        WHERE user_id = ? AND (plate_number LIKE ? OR vehicle_type LIKE ?)
        ORDER BY id
        LIMIT ? OFFSET ?
      `;
      params = [userId, searchQuery, searchQuery, parseInt(limit), offset];
    }

    const [[countResult]] = await pool.query(countQuery, params.slice(0, isAdmin ? 3 : 3));
    const totalItems = countResult.total;

    const [vehicles] = await pool.query(query, params);

    await pool.query('INSERT INTO logs (user_id, action) VALUES (?, ?)', [
      userId,
      'Vehicles list viewed',
    ]);

    res.json({
      data: vehicles,
      meta: {
        totalItems,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalItems / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get vehicles error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getVehicleById = async (req, res) => {
  const { id } = req.params;
  const isAdmin = req.user.role === 'admin';
  const userId = req.user.id;

  try {
    let query = `
      SELECT v.*, 
             (SELECT request_status 
              FROM slot_requests 
              WHERE vehicle_id = v.id AND request_status = 'approved' 
              LIMIT 1) AS approval_status
      FROM vehicles v
      WHERE v.id = ?
    `;
    const params = [id];

    if (!isAdmin) {
      query += ' AND v.user_id = ?';
      params.push(userId);
    }

    const [result] = await pool.query(query, params);

    if (result.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    await pool.query('INSERT INTO logs (user_id, action) VALUES (?, ?)', [
      userId,
      `Vehicle ID ${id} viewed`,
    ]);
    res.json(result[0]);
  } catch (error) {
    console.error('Get vehicle by ID error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateVehicle = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { plate_number, vehicle_type, size, other_attributes } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE vehicles SET plate_number = ?, vehicle_type = ?, size = ?, other_attributes = ? WHERE id = ? AND user_id = ?',
      [plate_number, vehicle_type, size, other_attributes || '{}', id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    await pool.query('INSERT INTO logs (user_id, action) VALUES (?, ?)', [
      userId,
      `Vehicle ${plate_number} updated`,
    ]);

    const [updatedVehicle] = await pool.query('SELECT * FROM vehicles WHERE id = ?', [id]);
    res.json(updatedVehicle[0]);
  } catch (error) {
    console.error('Update vehicle error:', error);
    res.status(400).json({ error: 'Plate number already exists or server error' });
  }
};

const deleteVehicle = async (req, res) => {
  const userId = req.user.id;
  const isAdmin = req.user.role === 'admin';
  const { id } = req.params;

  try {
    let query = 'DELETE FROM vehicles WHERE id = ?';
    const params = [id];

    if (!isAdmin) {
      query += ' AND user_id = ?';
      params.push(userId);
    }

    const [result] = await pool.query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    await pool.query('INSERT INTO logs (user_id, action) VALUES (?, ?)', [
      userId,
      `Vehicle with ID ${id} deleted`,
    ]);

    res.json({ message: 'Vehicle deleted' });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { createVehicle, getVehicles, getVehicleById, updateVehicle, deleteVehicle };