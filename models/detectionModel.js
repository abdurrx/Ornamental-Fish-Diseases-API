const { db } = require("../config/firebaseConfig")

class Detection {
  constructor(id, imageUrl, model, userId, createdAt) {
    this.id = id
    this.imageUrl = imageUrl
    this.model = model
    this.userId = userId
    this.createdAt = createdAt
  }

  static saveDetection = async (detection) => {
    const { id, imageUrl, model, userId, createdAt } = detection
    await db.collection("detections").doc(id).set({ imageUrl, model, userId, createdAt })
  }

  static findById = async (id, userId) => {
    const doc = await db.collection("detections").doc(id).get()
    const detection = doc.data()

    if (doc.exists && detection.userId == userId) {
      return new Detection(doc.id, detection.imageUrl, detection.model, detection.userId, detection.createdAt)
    }

    return null
  }

  static findAll = async (userId) => {
    const snapshot = await db.collection("detections").where("userId", "==", userId).get()

    if (snapshot.empty) {
      return null
    }

    const data = snapshot.docs.map((doc) => {
      const detection = doc.data()

      if (!snapshot.empty && userId == detection.userId) {
        return new Detection(doc.id, detection.imageUrl, detection.model, detection.userId, detection.createdAt)
      } else {
        return null
      }
    })

    return data.filter((detection) => detection !== null)
  }

  static deleteDetection = async (id, userId) => {
    const detection = db.collection("detections").doc(id)
    const doc = await detection.get()

    const data = doc.data()
    if (data.userId !== userId) {
      throw new Error('You are not allowed to delete this detection!')
    }

    await detection.delete()
  }
}

module.exports = Detection
