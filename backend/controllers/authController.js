const User = require('../models/User');
const { generateToken } = require('../middleware/authMiddleware');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Validate role
    const validRoles = ['student', 'instructor', 'admin'];
    const userRole = role && validRoles.includes(role) ? role : 'student';

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: userRole
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id)
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user is banned
    if (user.isBanned) {
      return res.status(403).json({
        message: 'Your account has been suspended. Please contact admin.',
        isBanned: true,
        banReason: user.banReason,
        bannedAt: user.bannedAt
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      token: generateToken(user.id)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    OAuth Google login/register
// @route   POST /api/auth/google
// @access  Public
const googleAuth = async (req, res) => {
  try {
    const { googleId, email, name, avatar } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      // Check if user is banned
      if (user.isBanned) {
        return res.status(403).json({
          message: 'Your account has been suspended. Please contact admin.',
          isBanned: true
        });
      }

      // Update googleId if not set
      if (!user.googleId) {
        user.googleId = googleId;
        user.avatar = avatar || user.avatar;
        await user.save();
      }

      // Update last login
      user.lastLogin = Date.now();
      await user.save({ validateBeforeSave: false });

      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        token: generateToken(user.id)
      });
    } else {
      // Create new user
      user = await User.create({
        name,
        email,
        googleId,
        avatar: avatar || '',
        password: Math.random().toString(36).slice(-8), // Random password for OAuth users
        role: 'student'
      });

      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        token: generateToken(user.id)
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    OAuth GitHub login/register
// @route   POST /api/auth/github
// @access  Public
const githubAuth = async (req, res) => {
  try {
    const { githubId, email, name, avatar } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      // Check if user is banned
      if (user.isBanned) {
        return res.status(403).json({
          message: 'Your account has been suspended. Please contact admin.',
          isBanned: true
        });
      }

      // Update githubId if not set
      if (!user.githubId) {
        user.githubId = githubId;
        user.avatar = avatar || user.avatar;
        await user.save();
      }

      // Update last login
      user.lastLogin = Date.now();
      await user.save({ validateBeforeSave: false });

      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        token: generateToken(user.id)
      });
    } else {
      // Create new user
      user = await User.create({
        name,
        email,
        githubId,
        avatar: avatar || '',
        password: Math.random().toString(36).slice(-8), // Random password for OAuth users
        role: 'student'
      });

      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        token: generateToken(user.id)
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio,
      expertise: user.expertise,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, email, bio, expertise, avatar } = req.body;

    const user = await User.findById(req.user.id);

    if (user) {
      user.name = name || user.name;
      user.email = email || user.email;
      user.bio = bio || user.bio;
      user.expertise = expertise || user.expertise;
      user.avatar = avatar || user.avatar;

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        bio: updatedUser.bio,
        expertise: updatedUser.expertise
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update password
// @route   PUT /api/auth/password
// @access  Private
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  register,
  login,
  googleAuth,
  githubAuth,
  getMe,
  updateProfile,
  updatePassword
};
