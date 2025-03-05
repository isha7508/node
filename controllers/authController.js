// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validateUser } = require('../models/User'); // Import the validation function

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  // Validate user input
  const { error } = validateUser({ name, email, password });
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user = new User({ name, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
/**user  */
exports.getUserByEmail = async (req, res) => {
  const { email } = req.params; // Get email from request parameters
  try {
    const user = await User.findOne({ email }).select('-password'); // Exclude password field
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

/**Profile  */
exports.profile = async (req, res) => {
  try {
    // req.user is set by authMiddleware. We can now fetch full user details from the database.
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

/*** Update Password */
exports.updatePassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body; // Get email and newPassword from the request body

    // Check if the user exists by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/*** Delete User */
exports.deleteUser = async (req, res) => {
  try {
    const { email } = req.body; // Extract email from the request body

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    // Find and delete the user by email
    const user = await User.findOneAndDelete({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

