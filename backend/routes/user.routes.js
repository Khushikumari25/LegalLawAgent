const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth');
const { mongoIdValidation, validate } = require('../middleware/validator');

// All routes are protected and admin only
router.use(protect);
router.use(authorize('admin'));

// User management
router.get('/', userController.getAllUsers);
router.get('/:id', mongoIdValidation, validate, userController.getUserById);
router.put('/:id', mongoIdValidation, validate, userController.updateUser);
router.delete('/:id', mongoIdValidation, validate, userController.deleteUser);
router.put('/:id/activate', mongoIdValidation, validate, userController.activateUser);
router.put('/:id/deactivate', mongoIdValidation, validate, userController.deactivateUser);

module.exports = router;
