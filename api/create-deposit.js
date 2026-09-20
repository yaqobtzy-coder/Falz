const { createDeposit, setCors } = require('./_austin');

module.exports = async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const amount = Number(body.amount);
    if (!amount || amount < 1000) {
      return res.status(400).json({ success: false, message: 'Amount minimal Rp1.000' });
    }

    // Optional: cart snapshot for reference (not sent to Austin)
    const items = Array.isArray(body.items) ? body.items : [];

    const deposit = await createDeposit(amount);

    // Return deposit + echo items so client can store order
    return res.status(200).json({
      success: true,
      deposit: {
        id: deposit.id,
        transaction_id: deposit.transaction_id,
        amount: deposit.amount,
        unique_code: deposit.unique_code,
        fee: deposit.fee,
        qr_string: deposit.qr_string,
        qr_image: deposit.qr_image,
        expired_at: deposit.expired_at,
        status: deposit.status
      },
      items,
      createdAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('create-deposit error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};
