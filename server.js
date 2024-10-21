const express = require('express');
const { neon } = require('@neondatabase/serverless');
require('dotenv').config(); // Чтобы работать с переменными среды

const app = express();
app.use(express.json()); // Для работы с JSON запросами

const sql = neon(process.env.DATABASE_URL);

// Маршрут для получения пользователя по clerkId
app.get('/api/user', async (req, res) => {
  const clerkId = req.query.clerkId;

  if (!clerkId) {
    return res.status(400).json({ error: 'clerkId is required' });
  }

  try {
    const user = await sql`SELECT * FROM users WHERE clerk_id = ${clerkId}`;

    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Маршрут для создания пользователя
app.post('/api/user', async (req, res) => {
  const { name, email, clerkId, gender, birthDate } = req.body;

  if (!name || !email || !clerkId || !gender || !birthDate) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const response = await sql`
      INSERT INTO users (name, email, clerk_id, gender, birth_date)
      VALUES (${name}, ${email}, ${clerkId}, ${gender}, ${birthDate})
      RETURNING *;
    `;

    res.status(201).json({ data: response });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
