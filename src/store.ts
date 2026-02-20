
import { Event, User, Submission, SubmissionStatus, QuestionType, BonusSettings, Season, EventType, LearnModule, MCQQuestion } from './types';

const STORAGE_KEY = 'VERSE_EVENT_DATA_V3';

const DEFAULT_BONUS_SETTINGS: BonusSettings = {
  dailyBonus: 20,
  weeklyBonus: 150,
  weeklyThreshold: 3,
  monthlyBonus: 500,
  monthlyThreshold: 10,
  enableStreakMultiplier: true,
};

const DEFAULT_MODULES: LearnModule[] = [
  {
    id: 'm1',
    title: 'Blockchain Basics',
    description: 'Learn the fundamentals of decentralization and smart contracts.',
    pointsReward: 100,
    lessons: [
      { id: 'l1', title: 'What is a Block?', content: 'A block is a record of new transactions...' }
    ],
    quiz: [
      { id: 'q1', text: 'Who created Bitcoin?', options: ['Satoshi', 'Vitalik', 'Elon', 'Mark'], correctOption: 0 }
    ]
  }
];

const DEFAULT_EVENTS: Event[] = [
  {
    id: '1',
    name: 'Intro to Web3 MCQ',
    date: new Date().toISOString().split('T')[0],
    time: '10:00 AM',
    venue: 'Online',
    description: 'A quick quiz to test your knowledge.',
    points: 500,
    creator: 'admin',
    eventType: EventType.MCQ,
    mcqQuestions: [
      { id: 'mq1', text: 'What does DAO stand for?', options: ['Decentralized Org', 'Data Org', 'Digital Auto', 'Direct Access'], correctOption: 0 }
    ]
  }
];

const createInitialUser = (address: string): User => ({
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
});

export class MockFirebase {
  private data: {
    events: Event[];
    users: User[];
    submissions: Submission[];
    bonusSettings: BonusSettings;
    seasons: Season[];
    currentSeasonId: number;
    modules: LearnModule[];
  } = {
    events: DEFAULT_EVENTS,
    users: [],
    submissions: [],
    bonusSettings: DEFAULT_BONUS_SETTINGS,
    seasons: [{ id: 1, name: 'Genesis Season', startDate: new Date().toISOString() }],
    currentSeasonId: 1,
    modules: DEFAULT_MODULES
  };

  private activeAddress: string | null = null;
  private initialized = false;

  constructor() {}

  async init(retries = 3, delay = 1000) {
    if (this.initialized) return;
    try {
      const res = await fetch('/api/db');
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        this.data = await res.json();
        this.initialized = true;
      } else {
        const text = await res.text();
        console.warn('Expected JSON but got:', text.substring(0, 100));
        if (text.trim().startsWith('<')) {
             console.log('Detected HTML response, attempting to overwrite DB with defaults...');
             await this.save();
             this.initialized = true;
        } else {
            throw new Error('Invalid response from server');
        }
      }
    } catch (e) {
      console.error(`Failed to load DB from server (attempt ${4 - retries}/3)`, e);
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.init(retries - 1, delay * 2);
      }
      console.error('All retries failed, using defaults');
      this.initialized = true;
    }
  }

  private async save() {
    try {
      const res = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.data)
      });
      if (!res.ok) {
        throw new Error(`Save failed: ${res.status} ${res.statusText}`);
      }
    } catch (e) {
      console.error('Failed to save DB to server', e);
    }
  }

  async setActiveAddress(address: string | null) {
    this.activeAddress = address;
    if (address && !this.data.users.find(u => u.address.toLowerCase() === address.toLowerCase())) {
      this.data.users.push(createInitialUser(address));
      await this.save();
    }
  }

  getModules() { return this.data.modules; }
  async addModule(m: LearnModule) { this.data.modules.unshift(m); await this.save(); }
  
  getEvents() { return this.data.events; }
  async addEvent(e: Event) { this.data.events.unshift(e); await this.save(); }
  async deleteEvent(id: string) {
    this.data.events = this.data.events.filter(e => e.id !== id);
    await this.save();
  }

  getCurrentUser() {
    if (!this.activeAddress) return createInitialUser('Guest');
    const user = this.data.users.find(u => u.address.toLowerCase() === this.activeAddress?.toLowerCase());
    if (!user) return createInitialUser(this.activeAddress);
    // Note: checkAndResetBonuses modifies the user object in place. 
    // We should probably save if it changes, but it's called on every get.
    // For now, let's leave it sync but maybe trigger a background save if needed?
    // Or just accept that it might be slightly out of sync until the next explicit action.
    // Actually, let's make it safe:
    this.checkAndResetBonuses(user); 
    return user;
  }

  getUsers() { return this.data.users; }

  getLeaderboard() {
    return [...this.data.users].sort((a, b) => (b.points + b.totalBonusPoints) - (a.points + a.totalBonusPoints));
  }

  getCurrentSeason() {
    return this.data.seasons.find(s => s.id === this.data.currentSeasonId) || this.data.seasons[0];
  }

  async seasonalReset() {
    this.data.users.forEach(u => { u.points = 0; u.totalBonusPoints = 0; u.dailyStreak = 0; u.eventsAttended = []; u.eventsJoined = []; });
    this.data.currentSeasonId++;
    this.data.seasons.push({ id: this.data.currentSeasonId, name: `Season ${this.data.currentSeasonId}`, startDate: new Date().toISOString() });
    await this.save();
    window.location.reload();
  }

  async joinEvent(id: string) {
    const u = this.getCurrentUser();
    if (u.address === 'Guest') return;
    // We need to find the actual user object in data to modify it
    const user = this.data.users.find(usr => usr.address.toLowerCase() === u.address.toLowerCase());
    if (user && !user.eventsJoined.includes(id)) { 
        user.eventsJoined.push(id); 
        await this.save(); 
    }
  }

  async completeModule(moduleId: string, score: number) {
    const u = this.getCurrentUser();
    if (u.address === 'Guest') return;
    const user = this.data.users.find(usr => usr.address.toLowerCase() === u.address.toLowerCase());
    if (!user) return;

    const existing = user.moduleProgress.find(p => p.moduleId === moduleId);
    if (existing) {
      existing.completed = true;
      existing.score = Math.max(existing.score, score);
    } else {
      user.moduleProgress.push({ moduleId, completed: true, score });
      const mod = this.data.modules.find(m => m.id === moduleId);
      if (mod) user.points += mod.pointsReward;
    }
    await this.save();
  }

  async submitEvent(sub: Submission) {
    const event = this.data.events.find(e => e.id === sub.eventId);
    if (!event) return;

    // Check if event is active based on time
    if (event.startTime || event.endTime) {
      const now = new Date();
      if (event.startTime && now < new Date(event.startTime)) {
        alert("Event has not started yet.");
        return;
      }
      if (event.endTime && now > new Date(event.endTime)) {
        alert("Event has ended.");
        return;
      }
    }

    if (event.eventType === EventType.MCQ) {
      let allCorrect = true;
      event.mcqQuestions?.forEach(q => {
        const ans = sub.answers.find(a => a.questionId === q.id);
        if (!ans || parseInt(ans.value) !== q.correctOption) allCorrect = false;
      });
      if (allCorrect) {
        sub.status = SubmissionStatus.AUTO_APPROVED;
        await this.approveCheckIn(sub.userId, event.id, event.points);
      } else {
        sub.status = SubmissionStatus.REJECTED;
      }
    } else if (event.eventType === EventType.LEARN) {
      const u = this.data.users.find(usr => usr.address === sub.userId);
      const progress = u?.moduleProgress.find(p => p.moduleId === event.moduleId);
      if (progress?.completed) {
        sub.status = SubmissionStatus.AUTO_APPROVED;
        await this.approveCheckIn(sub.userId, event.id, event.points);
      } else {
        sub.status = SubmissionStatus.REJECTED;
      }
    }

    this.data.submissions.push(sub);
    await this.save();
  }

  async approveSubmission(subId: string) {
    const sub = this.data.submissions.find(s => s.id === subId);
    if (sub && sub.status === SubmissionStatus.PENDING) {
      sub.status = SubmissionStatus.APPROVED;
      const event = this.data.events.find(e => e.id === sub.eventId);
      if (event) await this.approveCheckIn(sub.userId, event.id, event.points);
      await this.save();
    }
  }

  async rejectSubmission(subId: string) {
    const sub = this.data.submissions.find(s => s.id === subId);
    if (sub) { sub.status = SubmissionStatus.REJECTED; await this.save(); }
  }

  private async approveCheckIn(userId: string, eventId: string, basePoints: number) {
    const user = this.data.users.find(u => u.address.toLowerCase() === userId.toLowerCase());
    const event = this.data.events.find(e => e.id === eventId);
    if (user && event && !user.eventsAttended.includes(eventId)) {
      let awardedPoints = basePoints;
      
      if (event.pointDistribution) {
        // Count already approved submissions for this event to determine rank
        const approvedCount = this.data.submissions.filter(s => s.eventId === eventId && (s.status === SubmissionStatus.APPROVED || s.status === SubmissionStatus.AUTO_APPROVED)).length;
        
        if (approvedCount < 15) {
          awardedPoints = event.pointDistribution.top15;
        } else if (approvedCount < 40) { // 15 + 25
          awardedPoints = event.pointDistribution.next25;
        } else {
          awardedPoints = event.pointDistribution.rest;
        }
      }

      user.points += awardedPoints;
      user.eventsAttended.push(eventId);
      this.handleStreak(user);
    }
  }

  private checkAndResetBonuses(user: User) {
    // ... existing logic ...
    // This modifies user in place. 
    // Since this is called frequently, we might want to avoid saving every time.
    // But if we don't save, the reset date might be lost if the user refreshes.
    // Let's check if we actually changed anything.
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    const startOfYear = new Date(currentYear, 0, 1);
    const currentWeek = Math.ceil((((now.getTime() - startOfYear.getTime()) / 86400000) + startOfYear.getDay() + 1) / 7);

    let changed = false;

    if (user.lastBonusReset.year !== currentYear || user.lastBonusReset.month !== currentMonth) {
      user.monthlyCheckIns = 0;
      user.lastBonusReset.month = currentMonth;
      user.lastBonusReset.year = currentYear;
      changed = true;
    }

    if (user.lastBonusReset.week !== currentWeek) {
      user.weeklyCheckIns = 0;
      user.lastBonusReset.week = currentWeek;
      changed = true;
    }
    
    if (changed) {
        this.save(); // Fire and forget save
    }
  }

  private handleStreak(user: User) {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (user.lastCheckInDate === yesterdayStr) {
      user.dailyStreak++;
    } else if (user.lastCheckInDate !== todayStr) {
      user.dailyStreak = 1;
    }

    user.lastCheckInDate = todayStr;
    user.weeklyCheckIns++;
    user.monthlyCheckIns++;

    user.totalBonusPoints += this.data.bonusSettings.dailyBonus;

    if (user.weeklyCheckIns === this.data.bonusSettings.weeklyThreshold) {
      user.totalBonusPoints += this.data.bonusSettings.weeklyBonus;
    }

    if (user.monthlyCheckIns === this.data.bonusSettings.monthlyThreshold) {
      user.totalBonusPoints += this.data.bonusSettings.monthlyBonus;
    }
  }

  getSubmissions() { return this.data.submissions; }
  getBonusSettings() { return this.data.bonusSettings; }
  updateBonusSettings(s: BonusSettings) { this.data.bonusSettings = s; this.save(); }
  async resetData() { 
    this.data = {
      events: DEFAULT_EVENTS,
      users: [],
      submissions: [],
      bonusSettings: DEFAULT_BONUS_SETTINGS,
      seasons: [{ id: 1, name: 'Genesis Season', startDate: new Date().toISOString() }],
      currentSeasonId: 1,
      modules: DEFAULT_MODULES
    };
    await this.save();
    window.location.reload(); 
  }
}

export const db = new MockFirebase();
