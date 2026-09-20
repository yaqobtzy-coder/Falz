const { cancelDeposit, setCors } = require('./_austin');

module.exports = async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const transactionId = body.transaction_id || body.transactionId;
    if (!transactionId) {
      return res.status(400).json({ success: false, message: 'transaction_id wajib' });
    }

    const data = await cancelDeposit(transactionId);
    return res.status(200).json(data);
  } catch (err) {
    console.error('cancel-deposit error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};
