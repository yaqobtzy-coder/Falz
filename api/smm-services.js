const { getServices } = require('./_fayupedia');
const { setCors } = require('./_austin');

module.exports = async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const data = await getServices();
    if (!data.status) {
      return res.status(400).json({ success: false, message: data.msg || 'Gagal ambil layanan' });
    }
    return res.status(200).json({ success: true, services: data.services || [] });
  } catch (err) {
    console.error('smm-services error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};
