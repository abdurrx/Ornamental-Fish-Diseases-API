const express = require('express')
const path = require('path')
const router = express.Router()

const { create, getAll, getById, update, deleteById, search } = require(path.join(__dirname, '../controllers/articleController'))
const verifyToken = require(path.join(__dirname, '../middleware/authMiddleware'))

router.get('/', verifyToken, getAll)
router.get('/detail/:id', verifyToken, getById)

router.post('/create', create)
router.put('/update/:id', update)
router.delete('/delete/:id', deleteById)

router.get('/search/:title', verifyToken, search)

module.exports = router
