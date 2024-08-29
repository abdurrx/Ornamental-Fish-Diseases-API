const express = require("express")
const router = express.Router()

const { create, getAll, getById, deleteById } = require('../controllers/detectionController')
const verifyToken = require('../middleware/authMiddleware')

router.get('/', verifyToken, getAll)
router.post('/create', verifyToken, create)
router.get('/detail/:id', verifyToken, getById)
router.delete('/delete/:id', verifyToken,deleteById)

module.exports = router