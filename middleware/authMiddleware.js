const path = require('path')

const jwt = require('jsonwebtoken')
const { refreshToken } = require('firebase-admin/app')
const { admin, db } = require(path.join(__dirname, '../config/firebaseConfig'))

const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  const accessToken = req.cookies.jwt

  if (!token) {
    return res.status(401).json({
      error: true,
      message: 'Authorization token not found!'
    })
  }

  try {
    const decodedToken = jwt.verify(token, process.env.REFRESH_TOKEN_KEY)
    req.user = decodedToken

    const doc = await db.collection('users').doc(decodedToken.uid).get()
    const data = doc.data()

    if (doc.exists && data.token !== accessToken) {
      return res.status(401).json({
        error: true,
        message: 'Cookies is not found!'
      })

    } else if (doc.exists && !data.verified) {
      const user = await admin.auth().getUserByEmail(decodedToken.email)

      if (user.emailVerified) {
        await db.collection('users').doc(decodedToken.uid).update({ verified: true })

      } else {
        return res.status(401).json({
          error: true,
          message: 'Please verify your email first!'
        })
      }
    }
    next()

  } catch (error) {
    const accessTokenError = jwt.verify(accessToken, process.env.ACCESS_TOKEN_KEY, (err) => err);
    const refreshTokenError = jwt.verify(token, process.env.REFRESH_TOKEN_KEY, (err) => err);

    if (accessTokenError) {
      return res.status(401).json({
        error: true,
        message: 'Session is expired!'
      })
    }

    if (refreshTokenError) {
      return res.status(401).json({
        error: true,
        message: 'Session is not valid!'
      })
    }
  }
}

module.exports = verifyToken
