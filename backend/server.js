import express from 'express';
import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pkg;
const pool = new Pool();

const app = express();
app.use(express.json());

app.get('/api/tasks', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM tasks');
  res.json(rows);
});

app.post('/api/tasks/bulk', async (req, res) => {
  const tasks = req.body;
  for (const t of tasks) {
    await pool.query(
      `INSERT INTO tasks (id, name, type, source, destination, rules)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET name=$2, type=$3, source=$4, destination=$5, rules=$6`,
      [t.id, t.name, t.type, t.source, t.destination, JSON.stringify(t.rules || [])]
    );
  }
  res.json({ status: 'ok' });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server running on ${port}`));
