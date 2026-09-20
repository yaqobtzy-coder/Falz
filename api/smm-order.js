const { createOrder } = require('./_fayupedia');
const { setCors } = require('./_austin');

module.exports = async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { service, target, quantity, comments, usernames, hashtag, username, media, answer_number } = body;

    if (!service || !target) {
      return res.status(400).json({ success: false, message: 'service dan target wajib' });
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
      return res.status(400).json({ success: false, message: data.msg || 'Gagal membuat order SMM' });
    }
    return res.status(200).json({
      success: true,
      message: data.msg,
      order: data.order
    });
  } catch (err) {
    console.error('smm-order error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};
