import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_FILE = path.resolve(__dirname, 'db.json');

async function startServer() {
  const app = express();
  app.use(express.json());

  // Initialize DB file if it doesn't exist
  try {
    await fs.access(DB_FILE);
  } catch {
    await fs.writeFile(DB_FILE, JSON.stringify({
      events: [],
      users: [],
      submissions: [],
      bonusSettings: {
        dailyBonus: 20,
        weeklyBonus: 150,
        weeklyThreshold: 3,
        monthlyBonus: 500,
        monthlyThreshold: 10,
        enableStreakMultiplier: true,
      },
      seasons: [{ id: 1, name: 'Genesis Season', startDate: new Date().toISOString() }],
      currentSeasonId: 1,
      modules: []
    }, null, 2));
  }

  // API Routes
  app.get('/api/db', async (req, res) => {
    console.log('GET /api/db request received');
    try {
      const data = await fs.readFile(DB_FILE, 'utf-8');
      console.log('Successfully read DB file');
      res.json(JSON.parse(data));
    } catch (error) {
      console.error('Error reading DB:', error);
      res.status(500).json({ error: 'Failed to read database' });
    }
  });

  app.post('/api/db', async (req, res) => {
    console.log('POST /api/db request received');
    try {
      await fs.writeFile(DB_FILE, JSON.stringify(req.body, null, 2));
      console.log('Successfully saved DB file');
      res.json({ success: true });
    } catch (error) {
      console.error('Error saving DB:', error);
      res.status(500).json({ error: 'Failed to save database' });
    }
  });

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
