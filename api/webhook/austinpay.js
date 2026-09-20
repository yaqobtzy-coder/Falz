const crypto = require('crypto');

/**
 * Webhook endpoint: POST /api/webhook/austinpay
 * Verifikasi signature X-AustinPay-Signature (HMAC-SHA256 of raw body)
 *
 * Format payload:
 * {
 *   "event": "deposit.paid",
 *   "data": {
 *     "transactionId": "APG-...",
 *     "amount": 55000,
 *     "status": "paid",
 *     "paidAt": "..."
 *   },
 *   "sentAt": "..."
 * }
 */
module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const signature = req.headers['x-austinpay-signature'];
    const secret = process.env.AUSTINPAY_WEBHOOK_SECRET;

    // Raw body: on Vercel, if not configured as raw, body may already be parsed.
    // Prefer req.rawBody if available; otherwise re-stringify carefully.
    let rawBody;
    if (Buffer.isBuffer(req.body)) {
      rawBody = req.body;
    } else if (typeof req.body === 'string') {
      rawBody = Buffer.from(req.body);
    } else if (req.rawBody) {
      rawBody = Buffer.isBuffer(req.rawBody) ? req.rawBody : Buffer.from(req.rawBody);
    } else {
      // Fallback — signature may fail if body was re-parsed
      rawBody = Buffer.from(JSON.stringify(req.body || {}));
    }

    if (secret && signature) {
      const expected = crypto
        .createHmac('sha256', secret)
        .update(rawBody)
        .digest('hex');

      const sigBuf = Buffer.from(String(signature), 'hex');
      const expBuf = Buffer.from(expected, 'hex');

      if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
        console.warn('Invalid Austin Pay webhook signature');
        return res.status(401).json({ error: 'Invalid signature' });
      }
    } else if (secret && !signature) {
      return res.status(401).json({ error: 'Missing signature' });
    }

    const payload = typeof req.body === 'object' && !Buffer.isBuffer(req.body)
      ? req.body
      : JSON.parse(rawBody.toString('utf8'));

    console.log('[AustinPay Webhook]', payload.event, payload.data?.transactionId, payload.data?.status);

    // Di sini bisa simpan ke DB / kirim notifikasi admin, dll.
    // Untuk versi ini cukup acknowledge; client polling tetap primary.

    if (payload.event === 'deposit.paid') {
      // Future: update order status di database
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('webhook error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
