/**
 * Austin Pay helpers — support API Key + API Secret (HMAC)
 * Docs: https://austinstore.id/api-docs
 *
 * Env wajib di Vercel/Netlify:
 *   AUSTINPAY_API_KEY
 *   AUSTINPAY_API_SECRET   ← wajib jika secret sudah aktif di dashboard
 *   AUSTINPAY_WEBHOOK_SECRET
 */

const crypto = require('crypto');

const AUSTIN_HOST = 'https://austinstore.id';

function getApiKey() {
  const key = process.env.AUSTINPAY_API_KEY || process.env.AUSTIN_API_KEY;
  if (!key) throw new Error('AUSTINPAY_API_KEY belum di-set di Environment Variables Vercel');
  return key;
}

function getApiSecret() {
  return process.env.AUSTINPAY_API_SECRET || process.env.AUSTIN_API_SECRET || '';
}

/**
 * Signature: HMAC-SHA256( METHOD\nPATH\nBODY\nTIMESTAMP , secret ) → hex
 * Path TANPA query string. Kirim key lewat header X-API-Key.
 */
function signRequest(method, path, body, secret) {
  const timestamp = Date.now().toString();
  const payload = `${method.toUpperCase()}\n${path}\n${body || ''}\n${timestamp}`;
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return { timestamp, signature };
}

async function austinFetch(method, path, bodyObj = null) {
  const apiKey = getApiKey();
  const apiSecret = getApiSecret();
  const body = bodyObj != null ? JSON.stringify(bodyObj) : '';

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  };

  let url = `${AUSTIN_HOST}${path}`;

  if (apiSecret) {
    // Mode HMAC (wajib kalau API Secret sudah aktif di dashboard Austin)
    const { timestamp, signature } = signRequest(method, path, body, apiSecret);
    headers['X-API-Key'] = apiKey;
    headers['X-Timestamp'] = timestamp;
    headers['X-Signature'] = signature;
  } else {
    // Mode API key saja — akan ditolak Austin jika secret sudah aktif
    const sep = path.includes('?') ? '&' : '?';
    url = `${AUSTIN_HOST}${path}${sep}apikey=${encodeURIComponent(apiKey)}`;
  }

  const res = await fetch(url, {
    method: method.toUpperCase(),
    headers,
    body: body || undefined
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.message || data.error || `Austin Pay HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

async function createDeposit(amount) {
  const secret = getApiSecret();
  if (!secret) {
    throw new Error(
      'AUSTINPAY_API_SECRET belum di-set. API Secret kamu sudah aktif di Austin Pay — wajib isi di Vercel Environment Variables lalu Redeploy.'
    );
  }

  const data = await austinFetch('POST', '/api/deposit/create', {
    amount: Number(amount)
  });

  if (!data.success || !data.deposit) {
    throw new Error(data.message || 'Gagal membuat deposit Austin Pay');
  }
  return data.deposit;
}

async function checkDeposit(transactionId) {
  return austinFetch('GET', `/api/deposit/check/${encodeURIComponent(transactionId)}`);
}

async function cancelDeposit(transactionId) {
  return austinFetch('POST', `/api/deposit/cancel/${encodeURIComponent(transactionId)}`);
}

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

module.exports = {
  createDeposit,
  checkDeposit,
  cancelDeposit,
  setCors,
  getApiKey,
  getApiSecret,
  signRequest,
  austinFetch
};
