const pool = require('../../config/db');

const bulkCreateSlots = async (req, res) => {
  const userId = req.user.id;
  const { slots } = req.body; // Array of { slot_number, size, vehicle_type, location }
  try {
    // Check for duplicates in the database
    const slotNumbers = slots.map((slot) => slot.slot_number);
    const [existingSlots] = await pool.query(
      'SELECT slot_number FROM parking_slots WHERE slot_number IN (?)',
      [slotNumbers]
    );

    if (existingSlots.length > 0) {
      const existingSlotNumbers = existingSlots.map((slot) => slot.slot_number);
      return res.status(400).json({
        error: `The following slot numbers already exist: ${existingSlotNumbers.join(', ')}`,
      });
    }

    // Prepare query for bulk insertion
    const placeholders = slots.map(() => '(?, ?, ?, ?)').join(', ');
    const flatValues = slots.flatMap((slot) => [
      slot.slot_number,
      slot.size,
      slot.vehicle_type,
      slot.location,
    ]);

    const query = `
      INSERT INTO parking_slots (slot_number, size, vehicle_type, location)
      VALUES ${placeholders}
    `;

    const [result] = await pool.query(query, flatValues);

    await pool.query('INSERT INTO logs (user_id, action) VALUES (?, ?)', [
      userId,
      `Bulk created ${slots.length} slots`,
    ]);

    res.status(201).json({ message: `${slots.length} slots successfully created`, result });
  } catch (error) {
    console.error('Bulk create slots error:', error);
    res.status(400).json({ error: 'Slot number already exists or server error' });
  }
};

const getSlots = async (req, res) => {
  const { page = 1, limit = 10, search = '' } = req.query;
  const offset = (page - 1) * limit;
  const isAdmin = req.user.role === 'admin';
  try {
    const searchQuery = `%${search}%`;
    let query = 'SELECT * FROM parking_slots WHERE slot_number LIKE ? OR vehicle_type LIKE ?';
    let countQuery =
      'SELECT COUNT(*) AS total FROM parking_slots WHERE slot_number LIKE ? OR vehicle_type LIKE ?';
    const params = [searchQuery, searchQuery];

    if (!isAdmin) {
      query += ' AND status = ?';
      countQuery += ' AND status = ?';
      params.push('available');
    }

    query += ' ORDER BY id LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [[countResult]] = await pool.query(countQuery, params.slice(0, -2));
    const totalItems = countResult.total;

    const [slots] = await pool.query(query, params);

    await pool.query('INSERT INTO logs (user_id, action) VALUES (?, ?)', [
      req.user.id,
      'Viewed list of slots',
    ]);

    res.json({
      data: slots,
      meta: {
        totalItems,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalItems / limit),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get slots error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateSlot = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { slot_number, size, vehicle_type, location } = req.body;
  try {
    const query = `
      UPDATE parking_slots 
      SET slot_number = ?, size = ?, vehicle_type = ?, location = ?
      WHERE id = ?
    `;
    const [result] = await pool.query(query, [slot_number, size, vehicle_type, location, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Slot not found' });
    }

    await pool.query('INSERT INTO logs (user_id, action) VALUES (?, ?)', [
      userId,
      `Updated slot ${slot_number}`,
    ]);

    const [updatedSlot] = await pool.query('SELECT * FROM parking_slots WHERE id = ?', [id]);
    res.json(updatedSlot[0]);
  } catch (error) {
    console.error('Update slot error:', error);
    res.status(400).json({ error: 'Slot number already exists or server error' });
  }
};

const deleteSlot = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  try {
    const [result] = await pool.query(
      'SELECT slot_number FROM parking_slots WHERE id = ?',
      [id]
    );
    if (result.length === 0) {
      return res.status(404).json({ error: 'Slot not found' });
    }

    const slotNumber = result[0].slot_number;

    await pool.query('DELETE FROM parking_slots WHERE id = ?', [id]);

    await pool.query('INSERT INTO logs (user_id, action) VALUES (?, ?)', [
      userId,
      `Deleted slot ${slotNumber}`,
    ]);

    res.json({ message: `Slot ${slotNumber} successfully deleted` });
  } catch (error) {
    console.error('Delete slot error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { bulkCreateSlots, getSlots, updateSlot, deleteSlot };