const { db } = require("../config/firebaseConfig")

class User {
  constructor(id, name, email, password, verified, token) {
    this.id = id
    this.name = name
    this.email = email
    this.password = password
    this.verified = verified
    this.token = token
  }

  static saveUser = async (user) => {
    const { id, name, email, password} = user
    await db.collection("users").doc(id).set({ name, email, password, verified: false, token: null })
  }

  static findById = async (id) => {
    const doc = await db.collection("users").doc(id).get()

    if (doc.exists) {
      const data = doc.data()
      return new User(id, data.name, data.email, data.password, data.verified, data.token)
    }

    return null
  }

  static findByEmail = async (email) => {
    const snapshot = await db.collection("users").where("email", "==", email).get()

    if (snapshot.empty) {
      return null
    }

    const doc = snapshot.docs[0]
    const data = doc.data()

    return new User(doc.id, data.name, data.email, data.password, data.verified, data.token)
  }

  static updateUser = async (user) => {
    const { id, name } = user
    await db.collection("users").doc(id).update({ name })
  }

  static changePassword = async (id, password) => {
    await db.collection("users").doc(id).update({ password })
  }

  static logoutUser = async (id) => {
    await db.collection("users").doc(id).update({ token: null })
  }

  static updateToken = async (id, token) => {
    await db.collection("users").doc(id).update({ token })
  }
}

module.exports = User
