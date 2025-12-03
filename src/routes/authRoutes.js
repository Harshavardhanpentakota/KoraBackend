const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  logout
} = require('../controllers/authController');
const { protect } = require('../middlewares/auth');
const { validate, registerValidation, loginValidation } = require('../middlewares/validation');

router.post('/register', validate(registerValidation), register);
router.post('/login', validate(loginValidation), login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;
