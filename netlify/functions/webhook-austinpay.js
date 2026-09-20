const crypto = require('crypto');

exports.handler = async (event) => {
  const headers = { 'Content-Type': 'application/json' };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: { ...headers, 'Access-Control-Allow-Origin': '*' }, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ success: false, message: 'Method not allowed' }) };
  }

  try {
    const signature = event.headers['x-austinpay-signature'] || event.headers['X-AustinPay-Signature'];
    const secret = process.env.AUSTINPAY_WEBHOOK_SECRET;
    const rawBody = event.body || '';

    if (secret && signature) {
      const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
      const sigBuf = Buffer.from(String(signature), 'hex');
      const expBuf = Buffer.from(expected, 'hex');
      if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
        return { statusCode: 401, headers, body: JSON.stringify({ error: 'Invalid signature' }) };
      }
    } else if (secret && !signature) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Missing signature' }) };
    }

    const payload = JSON.parse(rawBody || '{}');
    console.log('[AustinPay Webhook]', payload.event, payload.data?.transactionId);

    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, headers, body: JSON.stringify({ success: false, message: err.message }) };
  }
};
