// User storage — Firebase Firestore when configured, JSON file fallback otherwise.
//
// Set FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY in
// .env to enable Firestore. Without them the app uses a local JSON file —
// perfect for dev and hackathon demos.
//
// Public surface is identical to the previous userStore.js.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// --- Firestore (lazy init) --------------------------------------------------
let _db = null;

async function getDb() {
  if (_db) return _db;
  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } =
    process.env;
  if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY)
    return null;
  try {
    const { initializeApp, getApps, cert } = await import('firebase-admin/app');
    const { getFirestore } = await import('firebase-admin/firestore');
    if (!getApps().length) {
      initializeApp({
        credential: cert({
          projectId: FIREBASE_PROJECT_ID,
          clientEmail: FIREBASE_CLIENT_EMAIL,
          privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
    }
    _db = getFirestore();
    console.log('[userStore] Firestore ready');
    return _db;
  } catch (err) {
    console.warn('[userStore] Firestore unavailable, using JSON:', err.message);
    return null;
  }
}

// --- Default user shape ----------------------------------------------------
function defaultUser(userId) {
  return {
    id: userId,
    createdAt: new Date().toISOString(),
    character: 'boy1',
    placement: null,
    xp: 0,
    hearts: 5,
    maxHearts: 5,
    streak: { current: 0, longest: 0, lastActiveDate: null },
    completedQuests: [],
    mistakes: [],
    bookmarks: [],
    savedWords: [],
    reflections: [],
    badges: [],
  };
}

// --- Streak logic ----------------------------------------------------------
export function tickStreak(user) {
  const today = new Date().toISOString().slice(0, 10);
  const last = user.streak.lastActiveDate;
  if (last === today) return user;
  const diffDays = last
    ? Math.round((new Date(today) - new Date(last)) / 86400000)
    : null;
  user.streak.current =
    diffDays === 1 ? user.streak.current + 1 : 1;
  user.streak.lastActiveDate = today;
  if (user.streak.current > user.streak.longest)
    user.streak.longest = user.streak.current;
  return user;
}

// --- Firestore helpers -----------------------------------------------------
async function fsGet(userId) {
  const db = await getDb();
  if (!db) return null;
  const doc = await db.collection('users').doc(userId).get();
  return doc.exists ? doc.data() : null;
}
async function fsSet(userId, data) {
  const db = await getDb();
  if (!db) return;
  await db.collection('users').doc(userId).set(data, { merge: true });
}

// --- JSON fallback ---------------------------------------------------------
let jsonCache = null;
let writeQueue = Promise.resolve();

async function ensureFile() {
  await mkdir(DATA_DIR, { recursive: true });
  try { await readFile(USERS_FILE, 'utf-8'); }
  catch { await writeFile(USERS_FILE, JSON.stringify({ users: {} }, null, 2)); }
}
async function jsonLoad() {
  if (jsonCache) return jsonCache;
  await ensureFile();
  jsonCache = JSON.parse(await readFile(USERS_FILE, 'utf-8'));
  return jsonCache;
}
async function jsonPersist() {
  const data = JSON.stringify(jsonCache, null, 2);
  writeQueue = writeQueue.then(() => writeFile(USERS_FILE, data));
  return writeQueue;
}

// --- Public API ------------------------------------------------------------
export async function getUser(userId) {
  const db = await getDb();
  if (db) {
    let u = await fsGet(userId);
    if (!u) { u = defaultUser(userId); await fsSet(userId, u); }
    return u;
  }
  const store = await jsonLoad();
  if (!store.users[userId]) {
    store.users[userId] = defaultUser(userId);
    await jsonPersist();
  }
  return store.users[userId];
}

export async function updateUser(userId, mutator) {
  const db = await getDb();
  if (db) {
    let u = (await fsGet(userId)) || defaultUser(userId);
    u = mutator(u) || u;
    await fsSet(userId, u);
    return u;
  }
  const store = await jsonLoad();
  if (!store.users[userId]) store.users[userId] = defaultUser(userId);
  store.users[userId] = mutator(store.users[userId]) || store.users[userId];
  await jsonPersist();
  return store.users[userId];
}
