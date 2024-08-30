const path = require('path')
const { db } = require(path.join(__dirname, '../config/firebaseConfig'))

class Code {
  constructor(id, code, exp, used) {
    this.id = id
    this.code = code
    this.exp = exp
    this.used = used
  }

  static saveCode = async (id) => {
    await db.collection('verificationCodes').doc(id).set({ code: null, exp: null, used: false })
  }

  static updateCode = async (req) => {
    const { id, code, exp, used } = req
    await db.collection('verificationCodes').doc(id).update({ code, exp, used })
  }

  static findById = async (id) => {
    const doc = await db.collection('verificationCodes').doc(id).get()

    if (doc.exists) {
      const data = doc.data()
      return new Code(doc.id, data.code, data.exp, data.used)
    }

    return null
  }
}

module.exports = Code
