const path = require('path')

const { sendVerifyEmail, sendResetPasswordEmail } = require(path.join(__dirname, '../services/emailService'))
const { admin } = require(path.join(__dirname, '../config/firebaseConfig'))

const User = require(path.join(__dirname, '../models/userModel'))
const Code = require(path.join(__dirname, '../models/codeModel'))

const validator = require('validator')
const { v4: uuidv4 } = require('uuid')

const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const generateCode = require(path.join(__dirname, '../services/generateCode'))

const register = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body
  const id = uuidv4()

  if (validator.isEmpty(name)) {
    return res.status(400).json({
      error: true,
      message: 'Name is required!'
    })
  } else if (validator.isEmpty(email) || !validator.isEmail(email)) {
    return res.status(400).json({
      error: true,
      message: 'Valid email is required!'
    })
  } else if (validator.isEmpty(password)) {
    return res.status(400).json({
      error: true,
      message: 'Password is required!'
    })
  } else if (validator.isEmpty(confirmPassword)) {
    return res.status(400).json({
      error: true,
      message: 'Confirm password is required!'
    })
  }

  try {
    const emailExist = await User.findByEmail(email)

    if (emailExist) {
      return res.status(400).json({
        error: true,
        message: 'Email already exists!'
      })

    } else {
      const hashedPassword = await bcrypt.hash(password, 10)

      if (password !== confirmPassword) {
        return res.status(400).json({
          error: true,
          message: 'Password does not match!'
        })

      } else {
        const user = new User(id, name, email, hashedPassword, '', '')

        await User.saveUser(user)
        await Code.saveCode(id)

        await admin.auth().createUser({
          uid: id,
          displayName: name,
          email: email,
          password: hashedPassword
        })

        const link = await admin.auth().generateEmailVerificationLink(email)
        sendVerifyEmail(email, link)

        return res.status(201).json({
          error: false,
          message: 'Successfully create user!',
          registerResult: {
            id: user.id,
            email: user.email,
            name: user.name
          }
        })
      }
    }

  } catch (error) {
    return res.status(400).json({
      error: true,
      message: 'Failed to create user!'
    })
  }
}

const login = async (req, res) => {
  const { email, password } = req.body

  if (validator.isEmpty(email) || !validator.isEmail(email)) {
    return res.status(400).json({
      error: true,
      message: 'Valid email is required!'
    })
  } else if (validator.isEmpty(password)) {
    return res.status(400).json({
      error: true,
      message: 'Password is required!'
    })
  }

  try {
    const user = await User.findByEmail(email)
    const checkPassword =  await bcrypt.compare(password, user.password)

    if (checkPassword) {
      const refreshToken = jwt.sign({ uid: user.id, email: user.email }, process.env.REFRESH_TOKEN_KEY, { expiresIn: '10m' })
      const accessToken = jwt.sign({ uid: user.id, email: user.email }, process.env.ACCESS_TOKEN_KEY, { expiresIn: '1d' })
      await User.updateToken(user.id, accessToken)

      res.cookie('jwt', accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
        maxAge: 1 * 24 * 60 * 60 * 1000
      })

      return res.status(200).json({
        error: false,
        message: 'Successfully login!',
        loginResult: {
          id: user.id,
          email: user.email,
          name: user.name,
          token: refreshToken
        }
      })

    } else {
      return res.status(401).json({
        error: true,
        message: 'Email or password is incorrect!'
      })
    }

  } catch (error) {
    return res.status(400).json({
      error: true,
      message: 'Failed to login!'
    })
  }
}

const profile = async (req, res) => {
  const { id } = req.params
  const userId = req.user.uid

  try {
    const user = await User.findById(id)

    if (!user) {
      return res.status(404).json({
        error: true,
        message: 'User not found!'
      })

    } else if (user.id != userId) {
      return res.status(401).json({
        error: true,
        message: 'You do not have permission to view this profile!'
      })

    } else {
      return res.status(200).json({
        error: false,
        message: 'Successfully get user!',
        profileResult: {
          id: user.id,
          name: user.name,
          email: user.email
        },
      })
    }

  } catch (error) {
    return res.status(404).json({
      error: true,
      message: 'User not found!'
    })
  }
}

const update = async (req, res) => {
  const { id } = req.params
  const { name } = req.body

  const userId = req.user.uid

  if (validator.isEmpty(name)) {
    return res.status(400).json({
      error: true,
      message: 'Name is required!'
    })
  }

  try {
    const exist = await User.findById(id)
    if (exist.id !== userId) {
      return res.status(401).json({
        error: true,
        message: 'You do not have permission to update this profile!'
      })

    } else {
      const user = new User(id, name, '', '', '', '')
      await User.updateUser(user)

      await admin.auth().updateUser(id, { displayName: name })

      return res.status(200).json({
        error: false,
        message: 'Successfully update user!',
        updateResult: {
          id: exist.id,
          name: user.name,
          email: exist.email
        }
      })
    }

  } catch (error) {
    return res.status(400).json({
      error: true,
      message: 'Failed to update user!'
    })
  }
}

const changePassword = async (req, res) => {
  const { id } = req.params
  const { oldPassword, newPassword, confirmPassword } = req.body

  if (validator.isEmpty(oldPassword)) {
    return res.status(400).json({
      error: true,
      message: 'Old password is required!'
    })
  } else if (validator.isEmpty(newPassword)) {
    return res.status(400).json({
      error: true,
      message: 'New password is required!'
    })
  } else if (validator.isEmpty(confirmPassword)) {
    return res.status(400).json({
      error: true,
      message: 'Confirm password is required!'
    })
  }

  try {
    const user = await User.findById(id)

    const checkPassword = await bcrypt.compare(oldPassword, user.password)
    if (!checkPassword) {
      return res.status(401).json({
        error: true,
        message: 'Old password is incorrect!'
      })

    } else {
      const hashedPassword = await bcrypt.hash(newPassword, 10)

      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          error: true,
          message: 'New password and confirm password does not match!'
        })

      } else {
        await User.changePassword(id, hashedPassword)
        await admin.auth().updateUser(id, { password: hashedPassword })

        return res.status(200).json({
          error: false,
          message: 'Successfully change password!'
        })
      }
    }

  } catch (error) {
    return res.status(400).json({
      error: true,
      message: 'Failed to change password!'
    })
  }
}

const sendResetPassword = async (req, res) => {
  const { email } = req.body

  if (validator.isEmpty(email) || !validator.isEmail(email)) {
    return res.status(400).json({
      error: true,
      message: 'Valid email is required!'
    })
  }

  try {
    const user = await User.findByEmail(email)
    if (!user) {
      return res.status(400).json({
        error: true,
        message: 'Email is not registered!'
      })

    } else {
      const userId = user.id
      const code = generateCode(6)
      const hashedCode = await bcrypt.hash(code, 10)
      const exp = Date.now() + 3600000

      const data = new Code(userId, hashedCode, exp, false)
      await Code.updateCode(data)

      sendResetPasswordEmail(email, code)

      return res.status(200).json({
        error: false,
        message: 'Successfully send code!'
      })
    }

  } catch (error) {
    return res.status(400).json({
      error: true,
      message: 'Failed to send code!'
    })
  }
}

const resetPassword = async (req, res) => {
  const { email, code, password, confirmPassword } = req.body

  if (validator.isEmpty(email) || !validator.isEmail(email)) {
    return res.status(400).json({
      error: true,
      message: 'Valid email is required!'
    })
  } else if (validator.isEmpty(code)) {
    return res.status(400).json({
      error: true,
      message: 'Code is required!'
    })
  } else if (validator.isEmpty(password)) {
    return res.status(400).json({
      error: true,
      message: 'Password is required!'
    })
  } else if (validator.isEmpty(confirmPassword)) {
    return res.status(400).json({
      error: true,
      message: 'Confirm password is required!'
    })
  }

  try {
    const user = await User.findByEmail(email)
    if (!user) {
      return res.status(400).json({
        error: true,
        message: 'Email is not registered!'
      })

    } else {
      const userId = user.id
      const data = await Code.findById(userId)

      if (data.used) {
        return res.status(400).json({
          error: true,
          message: 'Code has already been used! Please request a new code.'
        })
      }

      const checkCode = await bcrypt.compare(code, data.code)
      if (!checkCode || data.exp < Date.now()) {
        return res.status(400).json({
          error: true,
          message: 'Invalid or expired Code!'
        })

      } else {
        const hashedPassword = await bcrypt.hash(password, 10)
        if (password !== confirmPassword) {
          return res.status(400).json({
            error: true,
            message: 'Password and confirm password does not match!'
          })

        } else {
          const code = new Code(userId, data.code, data.exp, true)
          await Code.updateCode(code)

          await User.changePassword(userId, hashedPassword)
          await admin.auth().updateUser(userId, { password: hashedPassword })

          await User.logoutUser(userId)

          res.clearCookie('jwt', {
            httpOnly: true,
            secure: true,
            sameSite: 'Strict'
          })

          return res.status(200).json({
            error: false,
            message: 'Successfully reset password!'
          })
        }
      }
    }

  } catch (error) {
    return res.status(400).json({
      error: true,
      message: 'Failed to reset password! Try again later.'
    })
  }
}

const logout = async (req, res) => {
  const { id } = req.params

  const token = req.cookies.jwt
  if (!token) {
    return res.status(401).json({
      error: true,
      message: 'Cookies is not valid!'
    })
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_KEY)

    if (decoded.uid !== id) {
      return res.status(401).json({
        error: true,
        message: 'You cannot logout this user!'
      })

    } else {
      await User.logoutUser(decoded.uid)

      res.clearCookie('jwt', {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict'
      })

      return res.status(200).json({
        error: false,
        message: 'Successfully logout!'
      })
    }

  } catch (error) {
    return res.status(400).json({
      error: true,
      message: 'Failed to logout!'
    })
  }
}

const refreshToken = async (req, res) => {
  const { id } = req.params

  const token = req.cookies.jwt
  if (!token) {
    return res.status(401).json({
      error: true,
      message: 'Cookies is not valid!'
    })
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_KEY)

    if (decoded.uid !== id) {
      return res.status(401).json({
        error: true,
        message: 'You cannot perform this action!' 
      })
    }

    const user = await User.findById(decoded.uid)

    if (user && user.token === token) {
      const refreshToken = jwt.sign({ uid: user.id, email: user.email }, process.env.REFRESH_TOKEN_KEY, { expiresIn: '10m' })

      return res.status(200).json({
        error: false,
        message: 'Token refreshed!',
        token: refreshToken
      })
    }

  } catch (error) {
    return res.status(403).json({
      error: true,
      message: 'Something went wrong!'
    })
  }
}

module.exports = { register, login, profile, update, changePassword, sendResetPassword, resetPassword, logout, refreshToken }
