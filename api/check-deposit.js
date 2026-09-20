const { checkDeposit, setCors } = require('./_austin');

module.exports = async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ success: false, message: 'Method not allowed' });

  try {
    const transactionId = req.query.transaction_id || req.query.tx || (req.url && new URL(req.url, 'http://x').searchParams.get('transaction_id'));
    if (!transactionId) {
      return res.status(400).json({ success: false, message: 'transaction_id wajib' });
    }

    const data = await checkDeposit(transactionId);
    return res.status(200).json(data);
  } catch (err) {
    console.error('check-deposit error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};
