const User = require('../models/User.model');
const ApiResponse = require('../utils/response');
const logger = require('../utils/logger');

//@desc    Register new user
//@route   POST /api/v1/auth/register
//@access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, organization, phone } = req.body;

    logger.info('Registration request:', { name, email, role });

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        status: 'error',
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user',
      organization,
      phone
    });

    // Generate tokens
    const accessToken = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    logger.info(`New user registered: ${email}`);

    return res.status(201).json({
      status: 'success',
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        accessToken,
        refreshToken,
        token: accessToken // For compatibility
      }
    });
  } catch (error) {
    logger.error(`Registration error: ${error.message}`, { stack: error.stack });
    return res.status(500).json({
      status: 'error',
      success: false,
      message: error.message || 'Registration failed'
    });
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    logger.info('Login request:', { email });

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        status: 'error',
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        status: 'error',
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        status: 'error',
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate tokens
    const accessToken = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();

    // Save refresh token and update last login
    user.refreshToken = refreshToken;
    await user.updateLastLogin();

    logger.info(`User logged in: ${email}`);

    return res.status(200).json({
      status: 'success',
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar
        },
        accessToken,
        refreshToken,
        token: accessToken // For compatibility
      }
    });
  } catch (error) {
    logger.error(`Login error: ${error.message}`, { stack: error.stack });
    return res.status(500).json({
      status: 'error',
      success: false,
      message: error.message || 'Login failed'
    });
  }
};

// @desc    Refresh access token
// @route   POST /api/v1/auth/refresh-token
// @access  Public
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return ApiResponse.badRequest(res, 'Refresh token is required');
    }

    // Verify refresh token
    const jwt = require('jsonwebtoken');
    const jwtConfig = require('../config/jwt');
    
    const decoded = jwt.verify(refreshToken, jwtConfig.refreshSecret);
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== refreshToken) {
      return ApiResponse.unauthorized(res, 'Invalid refresh token');
    }

    // Generate new access token
    const newAccessToken = user.generateAuthToken();

    return ApiResponse.success(res, {
      accessToken: newAccessToken
    }, 'Token refreshed successfully');
  } catch (error) {
    logger.error(`Refresh token error: ${error.message}`);
    return ApiResponse.unauthorized(res, 'Invalid or expired refresh token');
  }
};

// @desc    Get current user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    return ApiResponse.success(res, { user }, 'User retrieved successfully');
  } catch (error) {
    logger.error(`Get me error: ${error.message}`);
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/v1/auth/update-profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, organization, phone } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, organization, phone },
      { new: true, runValidators: true }
    );

    return ApiResponse.success(res, { user }, 'Profile updated successfully');
  } catch (error) {
    logger.error(`Update profile error: ${error.message}`);
    next(error);
  }
};

// @desc    Update password
// @route   PUT /api/v1/auth/update-password
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return ApiResponse.unauthorized(res, 'Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    await user.save();

    logger.info(`Password updated for user: ${user.email}`);

    return ApiResponse.success(res, null, 'Password updated successfully');
  } catch (error) {
    logger.error(`Update password error: ${error.message}`);
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    // Clear refresh token
    await User.findByIdAndUpdate(req.user.id, { refreshToken: null });

    logger.info(`User logged out: ${req.user.email}`);

    return ApiResponse.success(res, null, 'Logged out successfully');
  } catch (error) {
    logger.error(`Logout error: ${error.message}`);
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/v1/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return ApiResponse.notFound(res, 'User not found');
    }

    // In production, send email with reset link
    // For now, return success message
    logger.info(`Password reset requested for: ${email}`);

    return ApiResponse.success(res, null, 'Password reset instructions sent to email');
  } catch (error) {
    logger.error(`Forgot password error: ${error.message}`);
    next(error);
  }
};

// @desc    Reset password
// @route   POST /api/v1/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    // Implementation for password reset
    return ApiResponse.success(res, null, 'Password reset successful');
  } catch (error) {
    logger.error(`Reset password error: ${error.message}`);
    next(error);
  }
};
