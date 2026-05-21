// server/src/routes/auth.js
//
// OAuth2 Authorization Code + PKCE flow for Quran Foundation User APIs.
//
// Based on the official documentation:
//   https://api-docs.quran.foundation/docs/tutorials/oidc/getting-started-with-oauth2/
//   https://api-docs.quran.foundation/docs/tutorials/oidc/example-integration/
//
// Endpoints:
//   GET  /api/auth/login    → redirect user to QF OAuth2 authorization page
//   GET  /api/auth/callback → handle redirect, exchange code for tokens,
//                             store tokens in server-side session, set httpOnly
//                             session cookie, redirect back to the app
//   GET  /api/auth/logout   → destroy session, redirect to home
//   GET  /api/auth/me       → return safe user info (no tokens) for the React app
//
// Tokens are NEVER sent to the browser. The React app only sees a session
// cookie and the /api/auth/me user profile.
//
// All QF User API calls are made server-side using the session token.
// See server/src/routes/user.js + server/src/services/userProgressProvider.js.

import { Router } from 'express';
import { createHash, randomBytes } from 'node:crypto';
import { destroySession } from '../services/sessionStore.js';

const router = Router();

// ── OAuth2 endpoints (per QF docs) ──────────────────────────────────────────
// Pre-live (default): https://prelive-oauth2.quran.foundation
// Production:         https://oauth2.quran.foundation
function qfOAuthBase() {
  return process.env.QF_ENV === 'production'
      ? 'https://oauth2.quran.foundation'
      : 'https://prelive-oauth2.quran.foundation';
}

// Detects the backend URL for local dev and deployed Cloud Run.
// OAuth redirect_uri must still be registered in the QF OAuth client dashboard.
function getRequestBaseUrl(req) {
  const forwardedProto = req.headers['x-forwarded-proto'];
  const forwardedHost = req.headers['x-forwarded-host'];

  const protoHeader = Array.isArray(forwardedProto)
      ? forwardedProto[0]
      : forwardedProto;

  const hostHeader = Array.isArray(forwardedHost)
      ? forwardedHost[0]
      : forwardedHost;

  const proto = (protoHeader || req.protocol || 'http').split(',')[0].trim();

  const host = (
      hostHeader ||
      req.headers.host ||
      `localhost:${process.env.PORT || 4000}`
  )
      .split(',')[0]
      .trim();

  return `${proto}://${host}`;
}

// Redirect URI: must match what's registered in the QF OAuth2 client.
// If QF_REDIRECT_URI is empty/missing, it auto-detects local vs deployed URL.
function redirectUri(req) {
  if (process.env.QF_REDIRECT_URI) {
    return process.env.QF_REDIRECT_URI;
  }

  return `${getRequestBaseUrl(req)}/api/auth/callback`;
}

// Client app URL to redirect back to after login/logout.
// If CLIENT_URL is empty/missing, it redirects back to the same detected host.
function clientUrl(req) {
  if (process.env.CLIENT_URL) {
    return process.env.CLIENT_URL;
  }

  return getRequestBaseUrl(req);
}

// Scopes required: openid (user identity) + offline_access (refresh token)
//                  + bookmark + user (per QF User API scopes).
const SCOPES = (
    process.env.QF_SCOPES ||
    'openid offline_access bookmark collection user'
).trim();

// ── PKCE helpers ────────────────────────────────────────────────────────────
// code_verifier  = 32 random bytes, base64url encoded (RFC 7636)
// code_challenge = SHA256(verifier), base64url encoded
function generateCodeVerifier() {
  return randomBytes(32).toString('base64url');
}

function generateCodeChallenge(verifier) {
  return createHash('sha256').update(verifier).digest('base64url');
}

// ── GET /api/auth/login ─────────────────────────────────────────────────────
// Builds the QF authorization URL and redirects the browser there.
// Per docs: state (CSRF) + nonce + code_challenge are all required.
router.get('/login', (req, res) => {
  if (!process.env.QF_CLIENT_ID) {
    return res.status(503).json({
      error: 'QF_CLIENT_ID is not set — OAuth2 login is unavailable.',
      hint: 'Set QF_CLIENT_ID and QF_CLIENT_SECRET in your .env file.',
    });
  }

  // CSRF state — random, stored in session
  const state = randomBytes(32).toString('hex');
  const nonce = randomBytes(16).toString('hex');

  // PKCE — verifier stored server-side, challenge sent in the URL
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);

  // Store pending auth params in session (never sent to browser)
  req.session.oauth2Pending = { state, nonce, codeVerifier };

  const url = new URL(`${qfOAuthBase()}/oauth2/auth`);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', process.env.QF_CLIENT_ID);
  url.searchParams.set('redirect_uri', redirectUri(req));
  url.searchParams.set('scope', SCOPES);
  url.searchParams.set('state', state);
  url.searchParams.set('nonce', nonce);
  url.searchParams.set('code_challenge', codeChallenge);
  url.searchParams.set('code_challenge_method', 'S256');

  res.redirect(url.toString());
});

// ── GET /api/auth/callback ──────────────────────────────────────────────────
// QF redirects here after the user authenticates + consents.
// Validates CSRF state, exchanges code for tokens (server-side),
// stores tokens in session, redirects browser back to the React app.
router.get('/callback', async (req, res) => {
  try {
    const { code, state, error: oauthError } = req.query;

    if (oauthError) {
      console.error('[auth] OAuth2 error from provider:', oauthError);
      return res.redirect(`${clientUrl(req)}?auth_error=${encodeURIComponent(oauthError)}`);
    }

    // CSRF state check
    const pending = req.session.oauth2Pending;
    if (!pending || pending.state !== state) {
      console.error('[auth] OAuth2 state mismatch — possible CSRF');
      return res.redirect(`${clientUrl(req)}?auth_error=state_mismatch`);
    }

    // Exchange authorization code for tokens.
    // Per docs: confidential client → include client_secret in token request.
    const tokenUrl = `${qfOAuthBase()}/oauth2/token`;
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri(req),
      client_id: process.env.QF_CLIENT_ID,
      code_verifier: pending.codeVerifier,
    });

    // Confidential client: authenticate with Basic auth (client_id:client_secret)
    const basicAuth = Buffer.from(
        `${process.env.QF_CLIENT_ID}:${process.env.QF_CLIENT_SECRET}`
    ).toString('base64');

    const tokenRes = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });

    if (!tokenRes.ok) {
      const text = await tokenRes.text();
      console.error('[auth] Token exchange failed:', tokenRes.status, text);
      return res.redirect(`${clientUrl(req)}?auth_error=token_exchange_failed`);
    }

    const tokens = await tokenRes.json();
    // {access_token, refresh_token, id_token, token_type, expires_in, scope}

    // Store tokens server-side in the session. NEVER send to browser.
    req.session.qfAuth = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      idToken: tokens.id_token,
      expiresAt: Date.now() + (tokens.expires_in - 60) * 1000,
      scope: tokens.scope,
    };

    // Extract safe user info from the ID token (JWT) without verifying
    // signature here (we trust the server-to-server exchange).
    // Production: use a proper JWT library for full verification.
    try {
      const [, payload] = tokens.id_token.split('.');
      const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
      req.session.qfUser = {
        sub: decoded.sub,
        email: decoded.email,
        firstName: decoded.given_name || decoded.first_name,
        lastName: decoded.family_name || decoded.last_name,
      };
    } catch (e) {
      console.warn('[auth] Could not decode id_token:', e.message);
    }

    // Clean up pending OAuth state
    delete req.session.oauth2Pending;

    // Redirect back to the React app
    res.redirect(`${clientUrl(req)}?auth=success`);
  } catch (err) {
    console.error('[auth] Callback error:', err);
    res.redirect(`${clientUrl(req)}?auth_error=server_error`);
  }
});

// ── GET /api/auth/me ────────────────────────────────────────────────────────
// Returns safe user info from the session (no tokens).
// React app uses this to show login state.
router.get('/me', (req, res) => {
  if (!req.session?.qfUser) {
    return res.json({ authenticated: false });
  }

  res.json({
    authenticated: true,
    user: req.session.qfUser,
    scopes: req.session.qfAuth?.scope || '',
  });
});

// ── GET /api/auth/logout ────────────────────────────────────────────────────
// Destroys the server session and redirects home.
router.get('/logout', (req, res) => {
  destroySession(req);
  res.redirect(`${clientUrl(req)}`);
});

// ── Middleware helper ────────────────────────────────────────────────────────
// Exported for use in the user route: reads the session access token and
// attempts a token refresh if needed. Falls back gracefully if not present.
export async function getSessionToken(req) {
  const auth = req.session?.qfAuth;
  if (!auth?.accessToken) return null;

  // Refresh if token is within 60s of expiry
  if (auth.expiresAt > Date.now()) return auth.accessToken;

  if (!auth.refreshToken) return null;

  try {
    const tokenUrl = `${qfOAuthBase()}/oauth2/token`;
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: auth.refreshToken,
      client_id: process.env.QF_CLIENT_ID,
    });

    const basicAuth = Buffer.from(
        `${process.env.QF_CLIENT_ID}:${process.env.QF_CLIENT_SECRET}`
    ).toString('base64');

    const res = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });

    if (!res.ok) throw new Error(`Refresh failed: ${res.status}`);

    const tokens = await res.json();
    auth.accessToken = tokens.access_token;
    auth.expiresAt = Date.now() + (tokens.expires_in - 60) * 1000;
    if (tokens.refresh_token) auth.refreshToken = tokens.refresh_token;

    return auth.accessToken;
  } catch (err) {
    console.warn('[auth] Token refresh failed:', err.message);
    return null;
  }
}

export default router;