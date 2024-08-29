const { db } = require("../config/firebaseConfig")

class Article {
  constructor(id, title, content, author, image, date) {
    this.id = id
    this.title = title
    this.content = content
    this.author = author
    this.image = image
    this.date = date
  }

  static saveArticle = async (article) => {
    const { id, title, content, author, image, date } = article
    await db.collection("articles").doc(id).set({ title, content, author, image, date })
  }

  static findAll = async () => {
    const snapshot = await db.collection("articles").orderBy("date", "desc").get()

    if (snapshot.empty) {
      return null
    }

    const articles = snapshot.docs.map((doc) => {
      const data = doc.data()
      return new Article(doc.id, data.title, data.content, data.author, data.image, data.date)
    })

    return articles.filter((article) => article !== null)
  }

  static findById = async (id) => {
    const doc = await db.collection("articles").doc(id).get()

    if (!doc.exists) {
      return null
    }

    const data = doc.data()
    return new Article(doc.id, data.title, data.content, data.author, data.image, data.date)
  }

  static findByTitle = async (title) => {
    const snapshot = await db.collection("articles").orderBy("title")
      .startAt(title)
      .endAt(title + '\uf8ff')
      .get()

    if (snapshot.empty) {
      return null
    }

    const articles = snapshot.docs.map((doc) => {
      const data = doc.data()
      return new Article(doc.id, data.title, data.content, data.author, data.image, data.date)
    })

    return articles.filter((article) => article !== null)
  }

  static updateArticle = async (article) => {
    const { id, title, content, author, image, date } = article
    await db.collection("articles").doc(id).update({ title, content, author, image, date })
  }

  static deleteArticle = async (id) => {
    await db.collection("articles").doc(id).delete()
  }
}

module.exports = Article
