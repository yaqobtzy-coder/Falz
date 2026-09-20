const { cancelDeposit } = require('../../api/_austin');

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
    const transactionId = body.transaction_id || body.transactionId;
    if (!transactionId) {
      return { statusCode: 400, headers, body: JSON.stringify({ success: false, message: 'transaction_id wajib' }) };
    }

    const data = await cancelDeposit(transactionId);
    return { statusCode: 200, headers, body: JSON.stringify(data) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, headers, body: JSON.stringify({ success: false, message: err.message || 'Server error' }) };
  }
};
