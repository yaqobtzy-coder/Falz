const { createDeposit } = require('../../api/_austin');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ success: false, message: 'Method not allowed' }) };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const amount = Number(body.amount);
    if (!amount || amount < 1000) {
      return { statusCode: 400, headers, body: JSON.stringify({ success: false, message: 'Amount minimal Rp1.000' }) };
    }

    const items = Array.isArray(body.items) ? body.items : [];
    const deposit = await createDeposit(amount);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        deposit: {
          id: deposit.id,
          transaction_id: deposit.transaction_id,
          amount: deposit.amount,
          unique_code: deposit.unique_code,
          fee: deposit.fee,
          qr_string: deposit.qr_string,
          qr_image: deposit.qr_image,
          expired_at: deposit.expired_at,
          status: deposit.status
        },
        items,
        createdAt: new Date().toISOString()
      })
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, headers, body: JSON.stringify({ success: false, message: err.message || 'Server error' }) };
  }
};
