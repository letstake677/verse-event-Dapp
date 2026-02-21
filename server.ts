import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient, Db } from 'mongodb';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_FILE = path.resolve(__dirname, 'db.json');
const MONGODB_URI = process.env.MONGODB_URI;

let db: Db | null = null;

async function connectToMongo() {
  if (!MONGODB_URI || MONGODB_URI.includes('<username>')) {
    console.log('MongoDB URI missing or placeholder detected, using local JSON');
    return null;
  }
  try {
    const client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // 5 second timeout
    });
    await client.connect();
    console.log('Connected to MongoDB');
    return client.db();
  } catch (error) {
    console.error('Failed to connect to MongoDB, falling back to local JSON:', error);
    return null;
  }
}

async function getFullData() {
  if (db) {
    const collections = ['events', 'users', 'submissions', 'bonusSettings', 'seasons', 'currentSeasonId', 'modules'];
    const data: any = {};
    for (const col of collections) {
      const result = await db.collection(col).find({}).toArray();
      if (col === 'bonusSettings' || col === 'currentSeasonId') {
        data[col] = result[0]?.value ?? (col === 'currentSeasonId' ? 1 : {});
      } else {
        data[col] = result;
      }
    }
    return data;
  }
  return JSON.parse(await fs.readFile(DB_FILE, 'utf-8'));
}

async function startServer() {
  const app = express();
  app.use(express.json());

  db = await connectToMongo();

  if (!db) {
    // Initialize local DB file if it doesn't exist
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
  } else {
    // Seed MongoDB if empty
    const count = await db.collection('seasons').countDocuments();
    if (count === 0) {
      console.log('Seeding MongoDB with initial data...');
      await db.collection('bonusSettings').insertOne({ value: {
        dailyBonus: 20,
        weeklyBonus: 150,
        weeklyThreshold: 3,
        monthlyBonus: 500,
        monthlyThreshold: 10,
        enableStreakMultiplier: true,
      }} as any);
      await db.collection('seasons').insertOne({ id: 1, name: 'Genesis Season', startDate: new Date().toISOString() } as any);
      await db.collection('currentSeasonId').insertOne({ value: 1 } as any);
    }
  }

  // API Routes
  app.get('/api/db', async (req, res) => {
    try {
      const data = await getFullData();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to read database' });
    }
  });

  app.post('/api/user/active', async (req, res) => {
    const { address } = req.body;
    if (!address) return res.status(400).json({ error: 'Address required' });

    try {
      if (db) {
        let user: any = await db.collection('users').findOne({ address: { $regex: new RegExp(`^${address}$`, 'i') } });
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
          await db.collection('users').insertOne(user as any);
        }
        res.json(user);
      } else {
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
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to update user' });
    }
  });

  app.post('/api/event/submit', async (req, res) => {
    const { submission } = req.body;
    try {
      const data: any = await getFullData();
      const event = data.events.find((e: any) => e.id === submission.eventId);
      const user = data.users.find((u: any) => u.address.toLowerCase() === submission.userId.toLowerCase());

      if (!event || !user) return res.status(404).json({ error: 'Event or User not found' });

      if (user.eventsAttended.includes(event.id)) {
        return res.json({ success: true, message: 'Already attended' });
      }

      if (event.eventType === 'MCQ') {
        let allCorrect = true;
        event.mcqQuestions?.forEach((q: any) => {
          const ans = submission.answers.find((a: any) => a.questionId === q.id);
          if (!ans || parseInt(ans.value) !== q.correctOption) allCorrect = false;
        });

        if (allCorrect) {
          submission.status = 'AUTO_APPROVED';
          let awardedPoints = event.points;
          if (event.pointDistribution) {
            const approvedCount = data.submissions.filter((s: any) => s.eventId === event.id && (s.status === 'APPROVED' || s.status === 'AUTO_APPROVED')).length;
            if (approvedCount < 15) awardedPoints = event.pointDistribution.top15;
            else if (approvedCount < 40) awardedPoints = event.pointDistribution.next25;
            else awardedPoints = event.pointDistribution.rest;
          }

          user.points += awardedPoints;
          user.eventsAttended.push(event.id);
          
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
          let awardedPoints = event.points;
          if (event.pointDistribution) {
            const approvedCount = data.submissions.filter((s: any) => s.eventId === event.id && (s.status === 'APPROVED' || s.status === 'AUTO_APPROVED')).length;
            if (approvedCount < 15) awardedPoints = event.pointDistribution.top15;
            else if (approvedCount < 40) awardedPoints = event.pointDistribution.next25;
            else awardedPoints = event.pointDistribution.rest;
          }

          user.points += awardedPoints;
          user.eventsAttended.push(event.id);
          
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

      if (db) {
        await db.collection('submissions').insertOne(submission as any);
        await db.collection('users').updateOne(
          { address: user.address },
          { $set: { 
            points: user.points, 
            eventsAttended: user.eventsAttended,
            dailyStreak: user.dailyStreak,
            lastCheckInDate: user.lastCheckInDate,
            weeklyCheckIns: user.weeklyCheckIns,
            monthlyCheckIns: user.monthlyCheckIns,
            totalBonusPoints: user.totalBonusPoints
          }}
        );
      } else {
        data.submissions.push(submission);
        await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
      }
      res.json({ success: true, submission });
    } catch (error) {
      res.status(500).json({ error: 'Failed to submit' });
    }
  });

  app.post('/api/event/join', async (req, res) => {
    const { userId, eventId } = req.body;
    try {
      if (db) {
        await db.collection('users').updateOne(
          { address: { $regex: new RegExp(`^${userId}$`, 'i') } },
          { $addToSet: { eventsJoined: eventId } }
        );
      } else {
        const data = JSON.parse(await fs.readFile(DB_FILE, 'utf-8'));
        const user = data.users.find((u: any) => u.address.toLowerCase() === userId.toLowerCase());
        if (user && !user.eventsJoined.includes(eventId)) {
          user.eventsJoined.push(eventId);
          await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
        }
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to join' });
    }
  });

  app.post('/api/module/complete', async (req, res) => {
    const { userId, moduleId, score } = req.body;
    try {
      const data: any = await getFullData();
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

        if (db) {
          await db.collection('users').updateOne(
            { address: user.address },
            { $set: { moduleProgress: user.moduleProgress, points: user.points } }
          );
        } else {
          await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
        }
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to complete module' });
    }
  });

  app.delete('/api/event/:id', async (req, res) => {
    const { id } = req.params;
    console.log('Server: Deleting event', id);
    try {
      if (db) {
        const result = await db.collection('events').deleteOne({ id });
        console.log('Server: MongoDB delete result', result);
      } else {
        const data = JSON.parse(await fs.readFile(DB_FILE, 'utf-8'));
        const initialCount = data.events.length;
        data.events = data.events.filter((e: any) => e.id !== id);
        console.log(`Server: Local delete - before: ${initialCount}, after: ${data.events.length}`);
        await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
      }
      res.json({ success: true });
    } catch (error) {
      console.error('Server: Failed to delete event', error);
      res.status(500).json({ error: 'Failed to delete event' });
    }
  });

  app.post('/api/db', async (req, res) => {
    try {
      if (db) {
        const data = req.body;
        // This is a full sync, use with caution. Better to use atomic updates.
        for (const col of ['events', 'users', 'submissions', 'modules', 'seasons']) {
          if (data[col]) {
            await db.collection(col).deleteMany({});
            if (data[col].length > 0) await db.collection(col).insertMany(data[col] as any[]);
          }
        }
        if (data.bonusSettings) {
          await db.collection('bonusSettings').updateOne({}, { $set: { value: data.bonusSettings } }, { upsert: true });
        }
        if (data.currentSeasonId) {
          await db.collection('currentSeasonId').updateOne({}, { $set: { value: data.currentSeasonId } }, { upsert: true });
        }
      } else {
        await fs.writeFile(DB_FILE, JSON.stringify(req.body, null, 2));
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to save database' });
    }
  });

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), mode: db ? 'mongodb' : 'local' });
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
