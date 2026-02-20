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
    try {
      const data = await fs.readFile(DB_FILE, 'utf-8');
      res.json(JSON.parse(data));
    } catch (error) {
      res.status(500).json({ error: 'Failed to read database' });
    }
  });

  app.post('/api/user/active', async (req, res) => {
    const { address } = req.body;
    if (!address) return res.status(400).json({ error: 'Address required' });

    try {
      const data = JSON.parse(await fs.readFile(DB_FILE, 'utf-8'));
      let user = data.users.find((u: any) => u.address.toLowerCase() === address.toLowerCase());
      
      if (!user) {
        user = {
          address,
          points: 0,
          eventsJoined: [],
          eventsAttended: [],
          moduleProgress: [],
          dailyStreak: 0,
          lastCheckInDate: '',
          weeklyCheckIns: 0,
          monthlyCheckIns: 0,
          totalBonusPoints: 0,
          lastBonusReset: { week: -1, month: -1, year: -1 }
        };
        data.users.push(user);
        await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update user' });
    }
  });

  app.post('/api/event/submit', async (req, res) => {
    const { submission } = req.body;
    try {
      const data = JSON.parse(await fs.readFile(DB_FILE, 'utf-8'));
      const event = data.events.find((e: any) => e.id === submission.eventId);
      const user = data.users.find((u: any) => u.address.toLowerCase() === submission.userId.toLowerCase());

      if (!event || !user) return res.status(404).json({ error: 'Event or User not found' });

      // Check if already attended
      if (user.eventsAttended.includes(event.id)) {
        return res.json({ success: true, message: 'Already attended' });
      }

      // Logic for MCQ Auto-approval
      if (event.eventType === 'MCQ') {
        let allCorrect = true;
        event.mcqQuestions?.forEach((q: any) => {
          const ans = submission.answers.find((a: any) => a.questionId === q.id);
          if (!ans || parseInt(ans.value) !== q.correctOption) allCorrect = false;
        });

        if (allCorrect) {
          submission.status = 'AUTO_APPROVED';
          // Award points
          let awardedPoints = event.points;
          if (event.pointDistribution) {
            const approvedCount = data.submissions.filter((s: any) => s.eventId === event.id && (s.status === 'APPROVED' || s.status === 'AUTO_APPROVED')).length;
            if (approvedCount < 15) awardedPoints = event.pointDistribution.top15;
            else if (approvedCount < 40) awardedPoints = event.pointDistribution.next25;
            else awardedPoints = event.pointDistribution.rest;
          }

          user.points += awardedPoints;
          user.eventsAttended.push(event.id);
          
          // Streak Logic
          const now = new Date();
          const todayStr = now.toISOString().split('T')[0];
          const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];

          if (user.lastCheckInDate !== todayStr) {
            if (user.lastCheckInDate === yesterdayStr) user.dailyStreak++;
            else user.dailyStreak = 1;

            user.lastCheckInDate = todayStr;
            user.weeklyCheckIns++;
            user.monthlyCheckIns++;
            user.totalBonusPoints += data.bonusSettings.dailyBonus;

            if (user.weeklyCheckIns === data.bonusSettings.weeklyThreshold) user.totalBonusPoints += data.bonusSettings.weeklyBonus;
            if (user.monthlyCheckIns === data.bonusSettings.monthlyThreshold) user.totalBonusPoints += data.bonusSettings.monthlyBonus;
          }
        } else {
          submission.status = 'REJECTED';
        }
      } else if (event.eventType === 'LEARN') {
        const progress = user.moduleProgress.find((p: any) => p.moduleId === event.moduleId);
        if (progress?.completed) {
          submission.status = 'AUTO_APPROVED';
          // Award points
          let awardedPoints = event.points;
          if (event.pointDistribution) {
            const approvedCount = data.submissions.filter((s: any) => s.eventId === event.id && (s.status === 'APPROVED' || s.status === 'AUTO_APPROVED')).length;
            if (approvedCount < 15) awardedPoints = event.pointDistribution.top15;
            else if (approvedCount < 40) awardedPoints = event.pointDistribution.next25;
            else awardedPoints = event.pointDistribution.rest;
          }

          user.points += awardedPoints;
          user.eventsAttended.push(event.id);
          
          // Streak Logic
          const now = new Date();
          const todayStr = now.toISOString().split('T')[0];
          const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];

          if (user.lastCheckInDate !== todayStr) {
            if (user.lastCheckInDate === yesterdayStr) user.dailyStreak++;
            else user.dailyStreak = 1;

            user.lastCheckInDate = todayStr;
            user.weeklyCheckIns++;
            user.monthlyCheckIns++;
            user.totalBonusPoints += data.bonusSettings.dailyBonus;

            if (user.weeklyCheckIns === data.bonusSettings.weeklyThreshold) user.totalBonusPoints += data.bonusSettings.weeklyBonus;
            if (user.monthlyCheckIns === data.bonusSettings.monthlyThreshold) user.totalBonusPoints += data.bonusSettings.monthlyBonus;
          }
        } else {
          submission.status = 'REJECTED';
        }
      } else {
        submission.status = 'PENDING';
      }

      data.submissions.push(submission);
      await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
      res.json({ success: true, submission });
    } catch (error) {
      res.status(500).json({ error: 'Failed to submit' });
    }
  });

  app.post('/api/event/join', async (req, res) => {
    const { userId, eventId } = req.body;
    try {
      const data = JSON.parse(await fs.readFile(DB_FILE, 'utf-8'));
      const user = data.users.find((u: any) => u.address.toLowerCase() === userId.toLowerCase());
      if (user && !user.eventsJoined.includes(eventId)) {
        user.eventsJoined.push(eventId);
        await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to join' });
    }
  });

  app.post('/api/module/complete', async (req, res) => {
    const { userId, moduleId, score } = req.body;
    try {
      const data = JSON.parse(await fs.readFile(DB_FILE, 'utf-8'));
      const user = data.users.find((u: any) => u.address.toLowerCase() === userId.toLowerCase());
      const mod = data.modules.find((m: any) => m.id === moduleId);
      
      if (user && mod) {
        const existing = user.moduleProgress.find((p: any) => p.moduleId === moduleId);
        if (existing) {
          existing.completed = true;
          existing.score = Math.max(existing.score, score);
        } else {
          user.moduleProgress.push({ moduleId, completed: true, score });
          user.points += mod.pointsReward;
        }
        await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to complete module' });
    }
  });

  app.delete('/api/event/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const data = JSON.parse(await fs.readFile(DB_FILE, 'utf-8'));
      data.events = data.events.filter((e: any) => e.id !== id);
      await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete event' });
    }
  });

  app.post('/api/db', async (req, res) => {
    try {
      await fs.writeFile(DB_FILE, JSON.stringify(req.body, null, 2));
      res.json({ success: true });
    } catch (error) {
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
