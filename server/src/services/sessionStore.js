// server/src/services/sessionStore.js
//
// Lightweight session middleware — no npm packages required.
// Uses a server-side Map keyed by a random session ID.
// The session ID is stored in a signed httpOnly cookie so tokens
// never reach the browser.
//
// Sessions expire after QF_SESSION_TTL_MS (default 4 h) or on logout.
// In-memory only — restarts the server, loses sessions. Acceptable for
// a hackathon demo; swap the Map for Redis/DB in production.

import { createHmac, randomBytes } from 'node:crypto';

const SESSION_COOKIE = 'aq_sid';
const SESSION_SECRET = process.env.SESSION_SECRET || 'ayahquest-dev-secret-change-in-prod';
const TTL_MS = Number(process.env.QF_SESSION_TTL_MS) || 4 * 60 * 60 * 1000; // 4 h

/** In-memory store: sessionId → { data, expiresAt } */
const store = new Map();

/** Sign a string with HMAC-SHA256. */
function sign(value) {
  return createHmac('sha256', SESSION_SECRET).update(value).digest('hex');
}

/** Build a signed cookie value: <id>.<sig> */
function packCookie(id) {
  return `${id}.${sign(id)}`;
}

/** Unpack and verify a signed cookie value. Returns id or null. */
function unpackCookie(raw) {
  if (!raw) return null;
  const dot = raw.lastIndexOf('.');
  if (dot < 0) return null;
  const id = raw.slice(0, dot);
  const sig = raw.slice(dot + 1);
  const expected = sign(id);
  // Constant-time compare
  if (sig.length !== expected.length) return null;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0 ? id : null;
}

/** Parse the cookie header into a key→value map. */
function parseCookies(req) {
  const map = {};
  const raw = req.headers.cookie || '';
  for (const part of raw.split(';')) {
    const eq = part.indexOf('=');
    if (eq < 0) continue;
    const k = part.slice(0, eq).trim();
    const v = part.slice(eq + 1).trim();
    map[k] = decodeURIComponent(v);
  }
  return map;
}

/** Express middleware — attaches req.session and sets/refreshes the cookie. */
export function sessionMiddleware(req, res, next) {
  const cookies = parseCookies(req);
  const raw = cookies[SESSION_COOKIE];
  const id = unpackCookie(raw);
  let entry = id ? store.get(id) : null;

  // Expire stale sessions
  if (entry && entry.expiresAt < Date.now()) {
    store.delete(id);
    entry = null;
  }

  if (entry) {
    req.session = entry.data;
    req.sessionId = id;
    // Sliding expiry — reset on every request
    entry.expiresAt = Date.now() + TTL_MS;
  } else {
    const newId = randomBytes(32).toString('hex');
    req.session = {};
    req.sessionId = newId;
    store.set(newId, { data: req.session, expiresAt: Date.now() + TTL_MS });

    const cookieVal = packCookie(newId);
    res.setHeader(
      'Set-Cookie',
      `${SESSION_COOKIE}=${encodeURIComponent(cookieVal)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${Math.floor(TTL_MS / 1000)}`
    );
  }

  next();
}

/** Destroy the current session (call on logout). */
export function destroySession(req) {
  if (req.sessionId) store.delete(req.sessionId);
  req.session = {};
}
