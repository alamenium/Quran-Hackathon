// User progress storage. JSON-file backed for the MVP — production deployments
// should replace this with a real database (the surface is small and keyed by
// userId, so the swap is a single file change).

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

let cache = null;
let writeQueue = Promise.resolve();

async function ensureFile() {
  await mkdir(DATA_DIR, { recursive: true });
  try {
    await readFile(USERS_FILE, 'utf-8');
  } catch {
    await writeFile(USERS_FILE, JSON.stringify({ users: {} }, null, 2));
  }
}

async function load() {
  if (cache) return cache;
  await ensureFile();
  const raw = await readFile(USERS_FILE, 'utf-8');
  cache = JSON.parse(raw);
  return cache;
}

async function persist() {
  const data = JSON.stringify(cache, null, 2);
  // Sequential writes avoid corruption.
  writeQueue = writeQueue.then(() => writeFile(USERS_FILE, data));
  return writeQueue;
}

function defaultUser(userId) {
  return {
    id: userId,
    createdAt: new Date().toISOString(),
    character: 'boy1',
    placement: null,
    xp: 0,
    hearts: 3,
    streak: { current: 0, longest: 0, lastActiveDate: null },
    completedQuests: [], // [{ questId, completedAt, score }]
    mistakes: [], // [{ questionId, questId, prompt, correctAnswer, mistakeAnswer, ts }]
    bookmarks: [], // [verseKey]
    savedWords: [], // [wordId]
    reflections: [], // [{ questId, prompt, text, ts }]
    badges: [],
  };
}

export async function getUser(userId) {
  const db = await load();
  if (!db.users[userId]) {
    db.users[userId] = defaultUser(userId);
    await persist();
  }
  return db.users[userId];
}

export async function updateUser(userId, mutator) {
  const db = await load();
  if (!db.users[userId]) db.users[userId] = defaultUser(userId);
  const updated = mutator(db.users[userId]);
  db.users[userId] = updated || db.users[userId];
  await persist();
  return db.users[userId];
}

// Streak update logic — Duolingo-style with a one-day grace.
export function tickStreak(user) {
  const today = new Date().toISOString().slice(0, 10);
  const last = user.streak.lastActiveDate;
  if (last === today) return user; // already counted today
  if (!last) {
    user.streak.current = 1;
  } else {
    const lastDate = new Date(last + 'T00:00:00Z');
    const todayDate = new Date(today + 'T00:00:00Z');
    const diffDays = Math.round((todayDate - lastDate) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      user.streak.current += 1;
    } else if (diffDays > 1) {
      // missed a day — gentle reset
      user.streak.current = 1;
    }
  }
  user.streak.lastActiveDate = today;
  if (user.streak.current > user.streak.longest) {
    user.streak.longest = user.streak.current;
  }
  return user;
}
