const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
  role: String,
  content: String
})

const chatSchema = new mongoose.Schema({
  userId: String,
  title: String,
  messages: [messageSchema],
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Chat', chatSchema)