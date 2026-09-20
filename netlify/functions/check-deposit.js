const { checkDeposit } = require('../../api/_austin');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ success: false, message: 'Method not allowed' }) };
  }

  try {
    const params = event.queryStringParameters || {};
    const transactionId = params.transaction_id || params.tx;
    if (!transactionId) {
      return { statusCode: 400, headers, body: JSON.stringify({ success: false, message: 'transaction_id wajib' }) };
    }

    const data = await checkDeposit(transactionId);
    return { statusCode: 200, headers, body: JSON.stringify(data) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, headers, body: JSON.stringify({ success: false, message: err.message || 'Server error' }) };
  }
};
