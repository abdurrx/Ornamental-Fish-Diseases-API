const express = require('express')
const path = require('path')
const router = express.Router()

const { register, login, profile, update, changePassword, sendResetPassword, resetPassword, logout, refreshToken } = require(path.join(__dirname, '../controllers/userController'))
const verifyToken = require(path.join(__dirname, '../middleware/authMiddleware'))

router.post('/register', register)
router.post('/login', login)

router.get('/profile/:id', verifyToken, profile)
router.put('/update/:id', verifyToken, update)

router.put('/change-password/:id', verifyToken, changePassword)
router.post('/send-reset-password', sendResetPassword)
router.put('/reset-password', resetPassword)

router.put('/logout/:id', verifyToken, logout)

router.get('/refresh-token/:id', refreshToken)

module.exports = router
