require('dotenv').config()

const mongoose = require('mongoose')
const Chat = require('./Chat')

const express = require('express')
const Groq = require('groq-sdk')
const cors =require('cors')

const app = express()

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected!'))
  .catch(err => console.log('MongoDB error:', err))

app.use(cors())
app.use(express.json())

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

app.post('/chat', async (req, res) => {
  const { messages, chatId } = req.body

  if (!messages || messages.length === 0) {
    return res.status(400).json({ error: 'Messages are required' })
  }

  try {
    // Get AI reply from Groq
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are SkillGuide, a friendly AI mentor that helps students learn any skill. Guide them with questions, break topics into small steps, and encourage them.' },
        ...messages
      ]
    })

    const reply = response.choices[0].message.content

    // Save to MongoDB
    let chat = null
if (mongoose.Types.ObjectId.isValid(chatId)) {
  chat = await Chat.findById(chatId)
}



    if (!chat) {
      // Create new chat
      chat = new Chat({
        title: messages[0].content.slice(0, 30),
        messages: []
      })
    }

    // Push latest user message and AI reply
    const userMessage = messages[messages.length - 1]
    chat.messages.push({ role: userMessage.role, content: userMessage.content })
    chat.messages.push({ role: 'assistant', content: reply })
    await chat.save()

    res.json({ reply, chatId: chat._id })

  } catch (error) {
    console.error('Groq error:', error.message)
    res.status(500).json({ error: 'Something went wrong. Try again.' })
  }
})

app.get('/chats', async (req, res) => {
  try {
    const chats = await Chat.find().sort({ createdAt: -1 })
    res.json(chats)
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch chats' })
  }
})

app.listen(3000, () => {
  console.log('Server running on port 3000')
})