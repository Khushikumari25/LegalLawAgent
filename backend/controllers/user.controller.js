const User = require('../models/User.model');
const ApiResponse = require('../utils/response');
const logger = require('../utils/logger');

exports.getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments();

    return ApiResponse.paginated(res, { users }, { page, limit, total }, 'Users retrieved');
  } catch (error) {
    logger.error(`Get all users error: ${error.message}`);
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password -refreshToken');

    if (!user) {
      return ApiResponse.notFound(res, 'User not found');
    }

    return ApiResponse.success(res, { user }, 'User retrieved');
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { name, email, role, organization, phone } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, organization, phone },
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    if (!user) {
      return ApiResponse.notFound(res, 'User not found');
    }

    return ApiResponse.success(res, { user }, 'User updated');
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return ApiResponse.notFound(res, 'User not found');
    }

    await user.deleteOne();

    return ApiResponse.success(res, null, 'User deleted');
  } catch (error) {
    next(error);
  }
};

exports.activateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    ).select('-password -refreshToken');

    if (!user) {
      return ApiResponse.notFound(res, 'User not found');
    }

    return ApiResponse.success(res, { user }, 'User activated');
  } catch (error) {
    next(error);
  }
};

exports.deactivateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select('-password -refreshToken');

    if (!user) {
      return ApiResponse.notFound(res, 'User not found');
    }

    return ApiResponse.success(res, { user }, 'User deactivated');
  } catch (error) {
    next(error);
  }
};
