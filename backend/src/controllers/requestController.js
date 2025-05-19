const pool = require('../../config/db');
const { sendApprovalEmail, sendRejectionEmail } = require('../utils/email');

const createRequest = async (req, res) => {
  const userId = req.user.id;
  const { vehicle_id } = req.body;
  try {
    const [vehicleResult] = await pool.query('SELECT * FROM vehicles WHERE id = ? AND user_id = ?', [
      vehicle_id,
      userId,
    ]);
    if (!vehicleResult || vehicleResult.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const [result] = await pool.query(
      'INSERT INTO slot_requests (user_id, vehicle_id, request_status) VALUES (?, ?, ?)',
      [userId, vehicle_id, 'pending']
    );

    await pool.query('INSERT INTO logs (user_id, action) VALUES (?, ?)', [
      userId,
      `Slot request created for vehicle ${vehicle_id}`,
    ]);

    const [newRequest] = await pool.query('SELECT * FROM slot_requests WHERE id = ?', [result.insertId]);
    res.status(201).json(newRequest[0]);
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const getRequests = async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 10, search = '' } = req.query;
  const offset = (page - 1) * limit;
  const isAdmin = req.user.role === 'admin';
  try {
    const searchQuery = `%${search}%`;
    let query = `
      SELECT sr.*, v.plate_number, v.vehicle_type
      FROM slot_requests sr
      JOIN vehicles v ON sr.vehicle_id = v.id
      WHERE (v.plate_number LIKE ? OR sr.request_status LIKE ?)
    `;
    let countQuery = `
      SELECT COUNT(*) AS total
      FROM slot_requests sr
      JOIN vehicles v ON sr.vehicle_id = v.id
      WHERE (v.plate_number LIKE ? OR sr.request_status LIKE ?)
    `;
    const params = [searchQuery, searchQuery];

    if (!isAdmin) {
      query += ' AND sr.user_id = ?';
      countQuery += ' AND sr.user_id = ?';
      params.push(userId);
    }

    query += ' ORDER BY sr.id LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [[countResult]] = await pool.query(countQuery, params.slice(0, -2));
    const totalItems = countResult.total;

    const [requests] = await pool.query(query, params);

    await pool.query('INSERT INTO logs (user_id, action) VALUES (?, ?)', [
      userId,
      'Slot requests list viewed',
    ]);

    res.json({
      data: requests,
      meta: {
        totalItems,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalItems / limit),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const updateRequest = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { vehicle_id } = req.body;
  try {
    const [vehicleResult] = await pool.query('SELECT * FROM vehicles WHERE id = ? AND user_id = ?', [
      vehicle_id,
      userId,
    ]);
    if (!vehicleResult || vehicleResult.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const [result] = await pool.query(
      'UPDATE slot_requests SET vehicle_id = ? WHERE id = ? AND user_id = ? AND request_status = ?',
      [vehicle_id, id, userId, 'pending']
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Request not found or not editable' });
    }

    await pool.query('INSERT INTO logs (user_id, action) VALUES (?, ?)', [
      userId,
      `Slot request ${id} updated`,
    ]);

    const [updatedRequest] = await pool.query('SELECT * FROM slot_requests WHERE id = ?', [id]);
    res.json(updatedRequest[0]);
  } catch (error) {
    console.error('Update request error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const deleteRequest = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  try {
    const [result] = await pool.query(
      'DELETE FROM slot_requests WHERE id = ? AND user_id = ? AND request_status = ?',
      [id, userId, 'pending']
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Request not found or not deletable' });
    }

    await pool.query('INSERT INTO logs (user_id, action) VALUES (?, ?)', [
      userId,
      `Slot request ${id} deleted`,
    ]);

    res.json({ message: 'Request deleted' });
  } catch (error) {
    console.error('Delete request error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const approveRequest = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    const [[requestResult]] = await pool.query(
      `SELECT sr.*, v.vehicle_type, v.size, v.plate_number, u.email 
       FROM slot_requests sr 
       JOIN vehicles v ON sr.vehicle_id = v.id 
       JOIN users u ON sr.user_id = u.id 
       WHERE sr.id = ? AND sr.request_status = ?`,
      [id, 'pending']
    );

    if (!requestResult) {
      return res.status(404).json({ error: 'Request not found or already processed' });
    }

    const { vehicle_type, size, plate_number, user_id, email } = requestResult;

    const [[slotResult]] = await pool.query(
      'SELECT * FROM parking_slots WHERE vehicle_type = ? AND size = ? AND status = ? LIMIT 1',
      [vehicle_type, size, 'available']
    );

    if (!slotResult) {
      return res.status(400).json({ error: 'No compatible slots available' });
    }

    const slot = slotResult;

    await pool.query('START TRANSACTION');

    await pool.query(
      `UPDATE slot_requests 
       SET request_status = ?, slot_id = ?, slot_number = ?, approved_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      ['approved', slot.id, slot.slot_number, id]
    );

    await pool.query(
      'UPDATE parking_slots SET status = ? WHERE id = ?',
      ['unavailable', slot.id]
    );

    await pool.query('COMMIT');

    let emailStatus = 'sent';
    try {
      console.log('Attempting to send approval email to:', email);
      await sendApprovalEmail(email, slot.slot_number, { plate_number }, slot.location);
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      emailStatus = 'failed';
    }

    await pool.query('INSERT INTO logs (user_id, action) VALUES (?, ?)', [
      userId,
      `Slot request ${id} approved, assigned slot ${slot.slot_number}, email ${emailStatus}`,
    ]);

    res.json({ message: 'Request approved', slot, emailStatus });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Approve request error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const rejectRequest = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { reason } = req.body;

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  if (!reason) {
    return res.status(400).json({ error: 'Rejection reason is required' });
  }

  try {
    const [[requestResult]] = await pool.query(
      `SELECT sr.*, v.plate_number, v.vehicle_type, v.size, u.email 
       FROM slot_requests sr 
       JOIN vehicles v ON sr.vehicle_id = v.id 
       JOIN users u ON sr.user_id = u.id 
       WHERE sr.id = ? AND sr.request_status = ?`,
      [id, 'pending']
    );

    if (!requestResult) {
      return res.status(404).json({ error: 'Request not found or already processed' });
    }

    const { plate_number, vehicle_type, size, email } = requestResult;

    const [[slotLocationResult]] = await pool.query(
      'SELECT location FROM parking_slots WHERE vehicle_type = ? AND size = ? LIMIT 1',
      [vehicle_type, size]
    );

    const slotLocation = slotLocationResult ? slotLocationResult.location : 'unknown';

    await pool.query(
      'UPDATE slot_requests SET request_status = ? WHERE id = ? AND request_status = ?',
      ['rejected', id, 'pending']
    );

    let emailStatus = 'sent';
    try {
      console.log('Attempting to send rejection email to:', email);
      await sendRejectionEmail(email, { plate_number }, slotLocation, reason);
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      emailStatus = 'failed';
    }

    await pool.query('INSERT INTO logs (user_id, action) VALUES (?, ?)', [
      userId,
      `Slot request ${id} rejected with reason: ${reason}, email ${emailStatus}`,
    ]);

    res.json({ message: 'Request rejected', emailStatus });
  } catch (error) {
    console.error('Reject request error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

module.exports = { createRequest, getRequests, updateRequest, deleteRequest, approveRequest, rejectRequest };