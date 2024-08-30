const express = require('express')
const path = require('path')
const router = express.Router()

const { create, getAll, getById, deleteById } = require(path.join(__dirname, '../controllers/detectionController'))
const verifyToken = require(path.join(__dirname, '../middleware/authMiddleware'))

router.get('/', verifyToken, getAll)
router.post('/create', verifyToken, create)
router.get('/detail/:id', verifyToken, getById)
router.delete('/delete/:id', verifyToken,deleteById)

module.exports = router