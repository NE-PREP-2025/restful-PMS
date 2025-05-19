const pool = require('../../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendOtpEmail } = require('../utils/email');

const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  try {
    // Check if user already exists
    const [userResult] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (userResult.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Check if the first admin
    const [adminCountResult] = await pool.query('SELECT COUNT(*) AS count FROM users WHERE role = ?', ['admin']);
    const isFirstAdmin = adminCountResult[0].count === 0;
    const role = isFirstAdmin ? 'admin' : 'user';

    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const [insertResult] = await pool.query(
      'INSERT INTO users (name, email, password, role, is_verified) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, role, false]
    );
    const userId = insertResult.insertId;

    // Generate OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await pool.query(
      'INSERT INTO otps (user_id, otp_code, expires_at) VALUES (?, ?, ?)',
      [userId, otpCode, expiresAt]
    );

    try {
      await sendOtpEmail(email, otpCode);
      console.log('OTP email sent to:', email);
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      return res.status(500).json({ error: 'Failed to send OTP email' });
    }

    res.status(201).json({ message: 'User registered, OTP sent to email', userId });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const verifyOtp = async (req, res) => {
  const { userId, otpCode } = req.body;

  if (!userId || !otpCode) {
    return res.status(400).json({ error: 'User ID and OTP code are required' });
  }

  try {
    const [otpResult] = await pool.query(
      'SELECT * FROM otps WHERE user_id = ? AND otp_code = ? AND expires_at > NOW() AND is_verified = FALSE',
      [userId, otpCode]
    );

    if (otpResult.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    await pool.query('UPDATE otps SET is_verified = TRUE WHERE user_id = ? AND otp_code = ?', [
      userId,
      otpCode,
    ]);

    await pool.query('UPDATE users SET is_verified = TRUE WHERE id = ?', [userId]);

    await pool.query('INSERT INTO logs (user_id, action) VALUES (?, ?)', [
      userId,
      'User verified OTP',
    ]);

    res.json({ message: 'OTP verified, user registration completed' });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const resendOtp = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const [userResult] = await pool.query('SELECT * FROM users WHERE id = ? AND is_verified = FALSE', [
      userId,
    ]);

    if (userResult.length === 0) {
      return res.status(400).json({ error: 'User not found or already verified' });
    }

    const user = userResult[0];
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await pool.query('DELETE FROM otps WHERE user_id = ?', [userId]);

    await pool.query(
      'INSERT INTO otps (user_id, otp_code, expires_at) VALUES (?, ?, ?)',
      [userId, otpCode, expiresAt]
    );

    try {
      await sendOtpEmail(user.email, otpCode);
      console.log('Resent OTP email to:', user.email);
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      return res.status(500).json({ error: 'Failed to resend OTP email' });
    }

    await pool.query('INSERT INTO logs (user_id, action) VALUES (?, ?)', [
      userId,
      'OTP resent',
    ]);

    res.json({ message: 'OTP resent to email' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const [result] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (result.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result[0];

    if (!user.is_verified) {
      return res.status(403).json({ error: 'Account not verified. Please verify OTP.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    await pool.query('INSERT INTO logs (user_id, action) VALUES (?, ?)', [
      user.id,
      'User logged in',
    ]);

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const logout = async (req, res) => {
  const { userId } = req.body;

  try {
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    await pool.query('INSERT INTO logs (user_id, action) VALUES (?, ?)', [
      userId,
      'User logged out',
    ]);

    res.json({ message: 'Logout logged successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
};

module.exports = { register, login, verifyOtp, resendOtp, logout };