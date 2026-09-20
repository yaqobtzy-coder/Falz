const { checkStatus } = require('../../api/_fayupedia');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Content-Type': 'application/json'
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  try {
    const body = event.httpMethod === 'GET' ? (event.queryStringParameters || {}) : JSON.parse(event.body || '{}');
    const id = body.id;
    if (!id) return { statusCode: 400, headers, body: JSON.stringify({ success: false, message: 'id wajib' }) };
    const data = await checkStatus(id);
    return { statusCode: 200, headers, body: JSON.stringify({ success: true, ...data }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ success: false, message: err.message }) };
  }
};
