/**
 * Fayupedia SMM API helpers
 * Docs: https://fayupedia.id
 * All methods: POST, response JSON
 *
 * Env:
 *   FAYUPEDIA_API_ID
 *   FAYUPEDIA_API_KEY
 */

const FAYU_BASE = 'https://fayupedia.id/api';

function getCreds() {
  const api_id = process.env.FAYUPEDIA_API_ID || process.env.FAYU_API_ID;
  const api_key = process.env.FAYUPEDIA_API_KEY || process.env.FAYU_API_KEY;
  if (!api_id || !api_key) {
    throw new Error('FAYUPEDIA_API_ID / FAYUPEDIA_API_KEY belum di-set di Environment Variables');
  }
  return { api_id: Number(api_id), api_key: String(api_key) };
}

async function fayuPost(path, extra = {}) {
  const creds = getCreds();
  const body = { ...creds, ...extra };
  const res = await fetch(`${FAYU_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({}));
  return data;
}

async function getServices() {
  return fayuPost('/services');
}

async function createOrder(payload) {
  // payload: service, target, quantity?, comments?, usernames?, hashtag?, username?, media?, answer_number?
  return fayuPost('/order', payload);
}

async function checkStatus(id) {
  return fayuPost('/status', { id: String(id) });
}

module.exports = { getServices, createOrder, checkStatus, getCreds };
