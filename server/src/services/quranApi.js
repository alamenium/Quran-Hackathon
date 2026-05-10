// Quran Foundation Content API client.
//
// Implements OAuth2 Client Credentials with token caching as recommended by
// https://api-docs.quran.foundation/docs/quickstart. When credentials are
// missing, transparently falls back to the bundled offline dataset so the
// app stays demo-able without keys.

const PRELIVE = {
  token: 'https://prelive-oauth2.quran.foundation/oauth2/token',
  api: 'https://apis-prelive.quran.foundation/content/api/v4',
};
const PRODUCTION = {
  token: 'https://oauth2.quran.foundation/oauth2/token',
  api: 'https://apis.quran.foundation/content/api/v4',
};

let tokenCache = null; // { accessToken, expiresAt }

function endpoints() {
  return process.env.QF_ENV === 'production' ? PRODUCTION : PRELIVE;
}

function isConfigured() {
  return Boolean(process.env.QF_CLIENT_ID && process.env.QF_CLIENT_SECRET);
}

async function fetchToken() {
  const { token: tokenUrl } = endpoints();
  const basic = Buffer.from(
    `${process.env.QF_CLIENT_ID}:${process.env.QF_CLIENT_SECRET}`
  ).toString('base64');

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    scope: 'content',
  });

  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token request failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  // Re-request 60s before expiry to dodge edge cases.
  const expiresAt = Date.now() + (data.expires_in - 60) * 1000;
  tokenCache = { accessToken: data.access_token, expiresAt };
  return tokenCache.accessToken;
}

async function getToken() {
  if (tokenCache && tokenCache.expiresAt > Date.now()) {
    return tokenCache.accessToken;
  }
  return fetchToken();
}

async function callApi(pathname, params = {}) {
  if (!isConfigured()) {
    const err = new Error('QF_NOT_CONFIGURED');
    err.code = 'QF_NOT_CONFIGURED';
    throw err;
  }

  const { api } = endpoints();
  const url = new URL(api + pathname);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
  }

  let token = await getToken();
  let res = await fetch(url, {
    headers: {
      'x-auth-token': token,
      'x-client-id': process.env.QF_CLIENT_ID,
      Accept: 'application/json',
    },
  });

  // 401 → re-fetch token once, retry once (per quickstart guidance)
  if (res.status === 401) {
    tokenCache = null;
    token = await getToken();
    res = await fetch(url, {
      headers: {
        'x-auth-token': token,
        'x-client-id': process.env.QF_CLIENT_ID,
        Accept: 'application/json',
      },
    });
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Quran API ${res.status}: ${text}`);
  }
  return res.json();
}

export const quranApi = {
  isConfigured,
  callApi,
};
