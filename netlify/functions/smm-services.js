const { getServices } = require('../../api/_fayupedia');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Content-Type': 'application/json'
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  try {
    const data = await getServices();
    if (!data.status) {
      return { statusCode: 400, headers, body: JSON.stringify({ success: false, message: data.msg || 'Gagal ambil layanan' }) };
    }
    return { statusCode: 200, headers, body: JSON.stringify({ success: true, services: data.services || [] }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ success: false, message: err.message }) };
  }
};
