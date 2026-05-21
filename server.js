require('dotenv').config()
const express = require('express')
const Groq = require('groq-sdk')
const cors =require('cors')

const app = express()
app.use(cors())
app.use(express.json())

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

app.post('/chat', async (req, res) => {
  const messages = req.body.messages

  // check if message is empty
  if (!messages || messages.length === 0) {
    return res.status(400).json({ error: 'Messages are required' })
  }

  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
     messages: [
  { role: 'system', content: 'You are SkillGuide, a friendly AI mentor that helps students learn any skill. Guide them with questions, break topics into small steps, and encourage them.' },
  ...messages
]
    })

    const reply = response.choices[0].message.content
    res.json({ reply })

  } catch (error) {
    console.error('Groq error:', error.message)
    res.status(500).json({ error: 'Something went wrong. Try again.' })
  }
})

app.listen(3000, () => {
  console.log('Server running on port 3000')
})