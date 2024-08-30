const path = require('path')

const admin = require('firebase-admin')
const serviceAccount = require(path.join(__dirname, '../credentials.json'))

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://ornamental-fish-diseases.firebaseio.com',
  storageBucket: 'ornamental-fish-diseases.appspot.com'
})

const db = admin.firestore()
const bucket =  admin.storage().bucket()

module.exports = { admin, db, bucket }
