const { checkStatus } = require('./_fayupedia');
const { setCors } = require('./_austin');

module.exports = async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const body =
      req.method === 'GET'
        ? { id: req.query?.id }
        : typeof req.body === 'string'
          ? JSON.parse(req.body)
          : req.body || {};
    const id = body.id || req.query?.id;
    if (!id) return res.status(400).json({ success: false, message: 'id wajib' });

    const data = await checkStatus(id);
    if (!data.status && !data.orders) {
      return res.status(400).json({ success: false, message: data.msg || 'Gagal cek status' });
    }
    return res.status(200).json({ success: true, ...data });
  } catch (err) {
    console.error('smm-status error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};
