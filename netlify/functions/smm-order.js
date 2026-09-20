const { createOrder } = require('../../api/_fayupedia');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Content-Type': 'application/json'
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ success: false, message: 'Method not allowed' }) };
  }
  try {
    const body = JSON.parse(event.body || '{}');
    const { service, target, quantity, comments, usernames, hashtag, username, media, answer_number } = body;
    if (!service || !target) {
      return { statusCode: 400, headers, body: JSON.stringify({ success: false, message: 'service dan target wajib' }) };
    }
    const payload = { service: Number(service), target: String(target) };
    if (quantity != null && quantity !== '') payload.quantity = Number(quantity);
    if (comments) payload.comments = String(comments);
    if (usernames) payload.usernames = String(usernames);
    if (hashtag) payload.hashtag = String(hashtag);
    if (username) payload.username = String(username);
    if (media) payload.media = String(media);
    if (answer_number != null && answer_number !== '') payload.answer_number = Number(answer_number);

    const data = await createOrder(payload);
    if (!data.status) {
      return { statusCode: 400, headers, body: JSON.stringify({ success: false, message: data.msg || 'Gagal order' }) };
    }
    return { statusCode: 200, headers, body: JSON.stringify({ success: true, message: data.msg, order: data.order }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ success: false, message: err.message }) };
  }
};
