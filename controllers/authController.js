const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, validateUser, validateLogin } = require('../models/User'); // Correct import
require('dotenv').config(); // Load environment variables

// Register User
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate user input
    const { error } = validateUser({ name, email, password });
    if (error) return res.status(400).json({ message: error.details[0].message });

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user to database
    user = new User({ name, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Login User
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate user input
    const { error } = validateLogin({ email, password });
    if (error) return res.status(400).json({ message: error.details[0].message });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get User by Email
exports.getUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ email }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    console.error("Get user error:", err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get Profile (Authenticated User)
exports.profile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    console.error("Profile error:", err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update Password
exports.updatePassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error("Password update error:", err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete User
exports.deleteUser = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOneAndDelete({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
