const CONFIG = {
  store: 'FANXZ07 CEO MUDA',
  wa: '6283171402249',
  channel: 'https://whatsapp.com/channel/0029Vb839u6545v3dqLjio3X',
  apiBase: ''
};

const PRODUCTS = [
  { id: 'bot-1', category: 'bot', icon: '🤖', name: 'Sewa Bot — 1 Bulan', price: 7000, features: ['Jaga grup WA', 'Aktif 1 bulan', 'Dukungan admin'] },
  { id: 'bot-3', category: 'bot', icon: '⚡', name: 'Sewa Bot — 3 Bulan', price: 12000, features: ['Jaga grup WA', 'Aktif 3 bulan', 'Dukungan admin'] },
  { id: 'bot-permanent', category: 'bot', icon: '♾️', name: 'Sewa Bot — Permanen', price: 20000, features: ['Jaga grup WA', 'Aktif permanen', 'Dukungan admin'] },
  { id: 'logo-simple', category: 'design', icon: '✏️', name: 'Logo Simple', price: 1000, features: ['Sesuai request', 'Hasil HD'] },
  { id: 'poster-qris', category: 'design', icon: '▣', name: 'Poster QRIS', price: 3000, features: ['Desain modern', 'Hasil HD'] },
  { id: 'murid-logo', category: 'design', icon: '🎓', name: 'Murid Logo', price: 5000, features: ['Custom', 'Hasil HD'] },
  { id: 'jasa-web', category: 'web', icon: '💻', name: 'Jasa Web', price: 5000, features: ['Modern', 'Responsive', 'Custom'] },
  { id: 'murid-web', category: 'web', icon: '🎓', name: 'Join Murid Web', price: 7000, features: ['Belajar web', 'Untuk pemula'] }
];

const FEES = [
  { max: 9000, range: 'Rp0K – Rp9K', fee: 2000 }, { max: 29000, range: 'Rp10K – Rp29K', fee: 3000 },
  { max: 59000, range: 'Rp30K – Rp59K', fee: 5000 }, { max: 69000, range: 'Rp60K – Rp69K', fee: 6000 },
  { max: 79000, range: 'Rp70K – Rp79K', fee: 7000 }, { max: 99000, range: 'Rp80K – Rp99K', fee: 8000 },
  { max: 199000, range: 'Rp100K – Rp199K', fee: 10000 }, { max: 299000, range: 'Rp200K – Rp299K', fee: 15000 },
  { max: 399000, range: 'Rp300K – Rp399K', fee: 20000 }, { max: 499000, range: 'Rp400K – Rp499K', fee: 25000 },
  { max: 599000, range: 'Rp500K – Rp599K', fee: 30000 }, { max: 699000, range: 'Rp600K – Rp699K', fee: 35000 },
  { max: 799000, range: 'Rp700K – Rp799K', fee: 40000 }, { max: 899000, range: 'Rp800K – Rp899K', fee: 45000 },
  { max: 999000, range: 'Rp900K – Rp999K', fee: 50000 }
];

const STEPS = [
  ['Pilih Produk / Suntik Sosmed', 'Pilih layanan dari menu.'],
  ['Pesan Langsung atau Keranjang', 'Bayar 1 item langsung, atau kumpulkan di keranjang.'],
  ['Bayar via QRIS', 'Scan QR. Refresh tidak generate ulang.'],
  ['Otomatis / Admin', 'Suntik Sosmed otomatis. Produk lain: struk ke admin.'],
  ['Selesai', 'Cek riwayat & status.']
];

const FAQ = [
  ['Bagaimana pesan langsung?', 'Tekan “Pesan Langsung” di kartu produk — bayar QRIS tanpa keranjang.'],
  ['Apa itu Suntik Sosmed?', 'Followers/likes/views. Bayar QRIS lalu order otomatis.'],
  ['QR hilang jika refresh?', 'Tidak. Pending disimpan; batalkan min. 40 detik.'],
  ['Promo 250+ member?', 'Klaim sewa bot gratis via WhatsApp Admin.']
];

let cart = [];
try { cart = JSON.parse(localStorage.getItem('fanxz07_cart') || '[]'); if (!Array.isArray(cart)) cart = []; } catch { cart = []; }
let pendingPayment = null;
try { pendingPayment = JSON.parse(localStorage.getItem('fanxz07_pending') || 'null'); } catch { pendingPayment = null; }
let history = [];
try { history = JSON.parse(localStorage.getItem('fanxz07_history') || '[]'); if (!Array.isArray(history)) history = []; } catch { history = []; }

let smmServices = [];
let selectedSmm = null;
let pollTimer = null;
let cancelUnlockTimer = null;
let currentReceiptOrder = null;

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const rupiah = (n) => 'Rp' + Number(n || 0).toLocaleString('id-ID');
function stripHtml(html) {
  if (!html) return '';
  var t = String(html)
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return t;
}

function saveCart() { localStorage.setItem('fanxz07_cart', JSON.stringify(cart)); renderCart(); }
function savePending() {
  if (pendingPayment) localStorage.setItem('fanxz07_pending', JSON.stringify(pendingPayment));
  else localStorage.removeItem('fanxz07_pending');
  updateResumeBtn();
}
function saveHistory() { localStorage.setItem('fanxz07_history', JSON.stringify(history)); renderHistory(); }
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(window.toastTimer); window.toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}
function waUrl(text) { return `https://wa.me/${CONFIG.wa}?text=${encodeURIComponent(text)}`; }
function chatText() { return 'Halo Admin FANXZ07, saya ingin memesan layanan.'; }

function api(path, options = {}) {
  return fetch((CONFIG.apiBase || '') + path, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  }).then(async (r) => {
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.message || data.error || data.msg || ('HTTP ' + r.status));
    return data;
  });
}

function productCard(p) {
  return '<article class="product-card glass"><div class="icon">' + p.icon + '</div><h3>' + p.name + '</h3><div class="price">' + rupiah(p.price) + '</div><ul class="features">' +
    (p.features || []).map(function(x){ return '<li>' + x + '</li>'; }).join('') +
    '</ul><div class="product-actions"><button class="btn ghost add-btn" data-id="' + p.id + '">+ Keranjang</button><button class="btn primary buy-now" data-id="' + p.id + '">Pesan Langsung</button></div></article>';
}

function renderProducts() {
  var map = { botProducts: 'bot', designProducts: 'design', webProducts: 'web' };
  Object.keys(map).forEach(function(elId) {
    var el = $('#' + elId);
    if (el) el.innerHTML = PRODUCTS.filter(function(p){ return p.category === map[elId]; }).map(productCard).join('');
  });
}

function add(id) {
  var item = cart.find(function(x){ return x.id === id; });
  if (item) item.qty++; else cart.push({ id: id, qty: 1 });
  saveCart(); toast('Ditambahkan ke keranjang ✓');
}

function buyNow(id) {
  var p = PRODUCTS.find(function(x){ return x.id === id; });
  if (!p) return;
  startPayment({
    amount: p.price,
    items: [{ id: p.id, name: p.name, price: p.price, qty: 1, subtotal: p.price }],
    kind: 'product'
  });
}

function change(id, delta) {
  var item = cart.find(function(x){ return x.id === id; });
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(function(x){ return x.id !== id; });
  saveCart();
}
function removeItem(id) { cart = cart.filter(function(x){ return x.id !== id; }); saveCart(); }
function cartTotal() {
  return cart.reduce(function(s, x) {
    var p = PRODUCTS.find(function(p){ return p.id === x.id; });
    return s + (p ? p.price * x.qty : 0);
  }, 0);
}
function cartItemsSnapshot() {
  return cart.map(function(x) {
    var p = PRODUCTS.find(function(p){ return p.id === x.id; });
    return { id: x.id, name: p ? p.name : x.id, price: p ? p.price : 0, qty: x.qty, subtotal: p ? p.price * x.qty : 0 };
  });
}

function renderCart() {
  var count = cart.reduce(function(s, x){ return s + x.qty; }, 0);
  $('#cartCount').textContent = '(' + count + ')';
  $('#cartTotal').textContent = rupiah(cartTotal());
  $('#cartItems').innerHTML = cart.length
    ? cart.map(function(x) {
        var p = PRODUCTS.find(function(p){ return p.id === x.id; });
        return '<div class="cart-item"><div class="cart-item-top"><div><h4>' + p.name + '</h4><small>' + rupiah(p.price) + '</small></div><button class="icon-btn remove-item" data-id="' + p.id + '">✕</button></div><div class="qty"><button class="dec" data-id="' + p.id + '">−</button><span>' + x.qty + '</span><button class="inc" data-id="' + p.id + '">+</button><b style="margin-left:auto">' + rupiah(p.price * x.qty) + '</b></div></div>';
      }).join('')
    : '<div class="cart-empty">Keranjang kosong.<br><small>Atau pakai “Pesan Langsung”.</small></div>';
}

function openCart() { $('#cartDrawer').classList.add('open'); $('#overlay').classList.add('show'); }
function closeCart() { $('#cartDrawer').classList.remove('open'); if (!$('.pay-modal.open')) $('#overlay').classList.remove('show'); }

function openPayModal() { $('#payModal').classList.add('open'); $('#overlay').classList.add('show'); }
function closePayModal() {
  $('#payModal').classList.remove('open');
  if (!$('#cartDrawer').classList.contains('open') && !$('#smmModal').classList.contains('open') && !$('#receiptModal').classList.contains('open')) $('#overlay').classList.remove('show');
  // Jangan stop polling — tetap auto-cek tiap 20 dtk di background
  updateResumeBtn();
}
function showPayState(state) {
  $('#payLoading').hidden = state !== 'loading';
  $('#payContent').hidden = state !== 'content';
  $('#paySuccess').hidden = state !== 'success';
  $('#payError').hidden = state !== 'error';
}

function startCancelCountdown() {
  var btn = $('#btnCancelPay');
  if (!btn || !pendingPayment) return;
  var unlockAt = new Date(pendingPayment.createdAt).getTime() + 40000;
  clearInterval(cancelUnlockTimer);
  if (Date.now() >= unlockAt) { btn.disabled = false; btn.textContent = 'Batalkan Pembayaran'; return; }
  btn.disabled = true;
  var tick = function() {
    var left = Math.ceil((unlockAt - Date.now()) / 1000);
    if (left <= 0) { clearInterval(cancelUnlockTimer); btn.disabled = false; btn.textContent = 'Batalkan Pembayaran'; }
    else btn.textContent = 'Batalkan (tunggu ' + left + 's)';
  };
  tick(); cancelUnlockTimer = setInterval(tick, 1000);
}

function renderPendingUI() {
  if (!pendingPayment) return;
  showPayState('content');
  $('#qrImage').src = pendingPayment.qr_image || '';
  $('#payAmount').textContent = rupiah(pendingPayment.amount);
  $('#payTxId').textContent = pendingPayment.transaction_id || '—';
  $('#payStatus').textContent = pendingPayment.status || 'pending';
  $('#payStatus').className = 'status-' + (pendingPayment.status || 'pending');
  var exp = pendingPayment.expired_at ? new Date(pendingPayment.expired_at) : null;
  $('#payExpired').textContent = exp ? exp.toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) : '—';
  startCancelCountdown();
  startPolling();
}

async function startPayment(opts) {
  if (pendingPayment && pendingPayment.status === 'pending') { openPayModal(); renderPendingUI(); return; }
  closeCart(); closeSmmModal();
  openPayModal(); showPayState('loading');
  try {
    var data = await api('/api/create-deposit', { method: 'POST', body: JSON.stringify({ amount: opts.amount, items: opts.items }) });
    if (!data.success || !data.deposit) throw new Error(data.message || 'Gagal membuat QRIS');
    pendingPayment = {
      transaction_id: data.deposit.transaction_id,
      amount: data.deposit.amount,
      qr_image: data.deposit.qr_image,
      expired_at: data.deposit.expired_at,
      status: data.deposit.status || 'pending',
      items: opts.items || data.items || [],
      kind: opts.kind || 'product',
      smm: opts.smm || null,
      createdAt: data.createdAt || new Date().toISOString()
    };
    savePending();
    renderPendingUI();
  } catch (err) {
    showPayState('error');
    $('#payErrorMsg').textContent = err.message || 'Gagal membuat pembayaran';
  }
}

function checkoutCart() {
  if (!cart.length) { toast('Keranjang kosong'); return; }
  startPayment({ amount: cartTotal(), items: cartItemsSnapshot(), kind: 'product' });
}

function startPolling() {
  stopPolling();
  if (!pendingPayment || pendingPayment.status !== 'pending') return;
  var poll = async function() {
    if (!pendingPayment || pendingPayment.status !== 'pending') { stopPolling(); return; }
    try {
      var data = await api('/api/check-deposit?transaction_id=' + encodeURIComponent(pendingPayment.transaction_id));
      var st = String(data.status || '').toLowerCase();
      if (st === 'paid' || st === 'success') onPaymentSuccess();
      else if (['cancel', 'expired', 'failed'].indexOf(data.status) >= 0) {
        pendingPayment.status = data.status; savePending();
        $('#payStatus').textContent = data.status; stopPolling();
      }
    } catch (e) {}
  };
  poll(); pollTimer = setInterval(poll, 20000);
}
function stopPolling() { if (pollTimer) { clearInterval(pollTimer); pollTimer = null; } }

function updateResumeBtn() {
  var btn = $('#resumePayBtn');
  if (!btn) return;
  if (pendingPayment && pendingPayment.status === 'pending') {
    btn.hidden = false;
  } else {
    btn.hidden = true;
  }
}


async function onPaymentSuccess() {
  stopPolling();
  if (!pendingPayment) return;
  pendingPayment.status = 'paid';
  pendingPayment.paidAt = new Date().toISOString();
  var smmOrderId = null, smmMsg = '';
  if (pendingPayment.kind === 'smm' && pendingPayment.smm) {
    try {
      var ord = await api('/api/smm-order', { method: 'POST', body: JSON.stringify(pendingPayment.smm) });
      smmOrderId = ord.order;
      smmMsg = ord.message || ('Order SMM #' + smmOrderId + ' dibuat.');
    } catch (e) {
      smmMsg = 'Bayar sukses, order SMM gagal: ' + (e.message || 'error') + '. Hubungi admin.';
    }
  }
  var order = {
    id: pendingPayment.transaction_id,
    transaction_id: pendingPayment.transaction_id,
    amount: pendingPayment.amount,
    items: pendingPayment.items || [],
    method: 'QRIS (Austin Pay)',
    status: 'paid',
    kind: pendingPayment.kind,
    smmOrderId: smmOrderId,
    smmMsg: smmMsg,
    smmStatus: smmOrderId ? 'pending' : null,
    paidAt: pendingPayment.paidAt,
    createdAt: pendingPayment.createdAt
  };
  history = history.filter(function(h){ return h.transaction_id !== order.transaction_id; });
  history.unshift(order);
  saveHistory();
  if (pendingPayment.kind !== 'smm') { cart = []; saveCart(); }
  pendingPayment = null; savePending();
  if ($('#payModal').classList.contains('open')) {
    showPayState('success');
    $('#paySuccessMsg').textContent = smmMsg || 'Pesanan tercatat. Unduh struk bila perlu.';
  } else {
    openPayModal();
    showPayState('success');
    $('#paySuccessMsg').textContent = smmMsg || 'Pesanan tercatat. Unduh struk bila perlu.';
  }
  updateResumeBtn();
  toast('Pembayaran berhasil! ✓');
}

async function cancelPayment() {
  if (!pendingPayment) return;
  if (Date.now() - new Date(pendingPayment.createdAt).getTime() < 40000) { toast('Tunggu minimal 40 detik'); return; }
  try {
    $('#btnCancelPay').disabled = true;
    var data = await api('/api/cancel-deposit', { method: 'POST', body: JSON.stringify({ transaction_id: pendingPayment.transaction_id }) });
    if (data.success || data.status === 'cancel') {
      pendingPayment = null; savePending(); stopPolling(); closePayModal(); toast('Dibatalkan');
    } else { toast(data.message || 'Tidak bisa dibatalkan'); $('#btnCancelPay').disabled = false; }
  } catch (e) { toast(e.message); $('#btnCancelPay').disabled = false; }
}

async function manualCheckStatus() {
  if (!pendingPayment) return;
  try {
    var data = await api('/api/check-deposit?transaction_id=' + encodeURIComponent(pendingPayment.transaction_id));
    var st = String(data.status || '').toLowerCase();
      if (st === 'paid' || st === 'success') onPaymentSuccess();
    else toast('Status: ' + (data.status || data.message || 'pending'));
  } catch (e) { toast(e.message); }
}

function calcSmmPrice(svc, qty) {
  var q = Number(qty) || 0, rate = Number(svc.price) || 0;
  return Math.ceil((q / 1000) * rate);
}

async function loadSmm() {
  var loading = $('#smmLoading'), list = $('#smmList');
  if (loading) loading.style.display = 'block';
  if (list) list.innerHTML = '';
  try {
    var data = await api('/api/smm-services');
    smmServices = data.services || [];
    var cats = [];
    smmServices.forEach(function(s){ if (s.category && cats.indexOf(s.category) < 0) cats.push(s.category); });
    var sel = $('#smmCategory');
    if (sel) sel.innerHTML = '<option value="">Semua kategori</option>' + cats.map(function(c){ return '<option value="' + c + '">' + c + '</option>'; }).join('');
    renderSmmList();
  } catch (e) {
    if (loading) loading.textContent = 'Gagal muat: ' + e.message;
    return;
  }
  if (loading) loading.style.display = 'none';
}

function renderSmmList() {
  var list = $('#smmList');
  if (!list) return;
  var q = ($('#smmSearch') && $('#smmSearch').value || '').toLowerCase();
  var cat = $('#smmCategory') && $('#smmCategory').value || '';
  var items = smmServices;
  if (cat) items = items.filter(function(s){ return s.category === cat; });
  if (q) items = items.filter(function(s){ return (s.name + ' ' + (s.category || '')).toLowerCase().indexOf(q) >= 0; });
  if (!items.length) { list.innerHTML = '<div class="cart-empty">Tidak ada layanan.</div>'; return; }
  list.innerHTML = items.map(function(s) {
    return '<article class="smm-card glass"><div class="smm-card-top"><div><b>' + s.name + '</b><small>' + (s.category || '') + ' · ' + (s.type || 'default') + '</small></div><strong>' + rupiah(s.price) + '<span class="per">/1k</span></strong></div><p class="smm-desc">' + stripHtml(s.description || '').replace(/\n/g, '<br>') + '</p><div class="smm-meta">Min ' + s.min + ' · Max ' + s.max + (s.refill ? ' · Refill' : '') + '</div><button class="btn primary full smm-order-btn" data-sid="' + s.id + '">Pesan Sekarang</button></article>';
  }).join('');
}

function openSmmOrder(serviceId) {
  var svc = smmServices.find(function(s){ return String(s.id) === String(serviceId); });
  if (!svc) return;
  selectedSmm = svc;
  $('#smmModalTitle').textContent = svc.name;
  $('#smmModalDesc').textContent = stripHtml(svc.description || svc.category || '');
  $('#smmTarget').value = '';
  $('#smmQty').value = svc.min || 100;
  $('#smmMin').textContent = svc.min;
  $('#smmMax').textContent = svc.max;
  $('#smmRate').textContent = rupiah(svc.price);
  $('#smmQty').min = svc.min;
  $('#smmQty').max = svc.max;
  var type = (svc.type || 'default').toLowerCase();
  var extra = $('#smmExtraFields');
  extra.innerHTML = '';
  var needQty = type !== 'package';
  $('#smmQtyLabel').style.display = needQty ? 'block' : 'none';
  $('#smmQty').style.display = needQty ? 'block' : 'none';
  function field(label, id, ph) { extra.innerHTML += '<label>' + label + '</label><input id="' + id + '" type="text" placeholder="' + (ph || '') + '">'; }
  if (type === 'custom_comment' || type === 'comment_reply') field('Komentar (satu baris per komentar)', 'smmComments', 'komentar 1');
  if (type === 'mention_list') field('Usernames (satu per baris)', 'smmUsernames', 'user1');
  if (type === 'mention_hastag' || type === 'mention_hashtag') field('Hashtag', 'smmHashtag', 'instagood');
  if (type === 'mention_follower' || type === 'comment_likes') field('Username', 'smmUsername', 'username');
  if (type === 'mention_media') field('Link media (likers)', 'smmMedia', 'https://...');
  if (type === 'poll') field('Nomor jawaban poll', 'smmAnswer', '1');
  updateSmmPrice();
  $('#smmModal').classList.add('open');
  $('#overlay').classList.add('show');
}

function closeSmmModal() {
  $('#smmModal').classList.remove('open');
  if (!$('#payModal').classList.contains('open') && !$('#cartDrawer').classList.contains('open')) $('#overlay').classList.remove('show');
}

function updateSmmPrice() {
  if (!selectedSmm) return;
  var qty = Number($('#smmQty').value) || 0;
  $('#smmPricePreview').textContent = rupiah(calcSmmPrice(selectedSmm, qty));
}

function submitSmmPay() {
  if (!selectedSmm) return;
  var target = ($('#smmTarget').value || '').trim();
  if (!target) { toast('Isi target dulu'); return; }
  var type = (selectedSmm.type || 'default').toLowerCase();
  var qty = Number($('#smmQty').value) || 0;
  if (type !== 'package') {
    if (qty < selectedSmm.min || qty > selectedSmm.max) { toast('Jumlah harus ' + selectedSmm.min + ' – ' + selectedSmm.max); return; }
  }
  var amount = type === 'package' ? Number(selectedSmm.price) : calcSmmPrice(selectedSmm, qty);
  if (amount < 1000) { toast('Total terlalu kecil'); return; }
  var smmPayload = { service: selectedSmm.id, target: target };
  if (type !== 'package') smmPayload.quantity = qty;
  var comments = $('#smmComments') && $('#smmComments').value;
  var usernames = $('#smmUsernames') && $('#smmUsernames').value;
  var hashtag = $('#smmHashtag') && $('#smmHashtag').value;
  var username = $('#smmUsername') && $('#smmUsername').value;
  var media = $('#smmMedia') && $('#smmMedia').value;
  var answer = $('#smmAnswer') && $('#smmAnswer').value;
  if (comments) smmPayload.comments = comments.replace(/\n/g, '\r\n');
  if (usernames) smmPayload.usernames = usernames.replace(/\n/g, '\r\n');
  if (hashtag) smmPayload.hashtag = hashtag;
  if (username) smmPayload.username = username;
  if (media) smmPayload.media = media;
  if (answer) smmPayload.answer_number = Number(answer);
  startPayment({
    amount: amount,
    items: [{ id: 'smm-' + selectedSmm.id, name: selectedSmm.name, price: amount, qty: 1, subtotal: amount, meta: 'target: ' + target + (qty ? ' · qty: ' + qty : '') }],
    kind: 'smm',
    smm: smmPayload
  });
}

function smmStatusLabel(st) {
  var s = String(st || 'unknown').toLowerCase();
  var map = {
    pending: '⏳ Pending',
    processing: '🔄 Diproses',
    in_progress: '🔄 Diproses',
    completed: '✅ Selesai',
    success: '✅ Selesai',
    partial: '⚠️ Partial',
    canceled: '❌ Dibatalkan',
    cancelled: '❌ Dibatalkan',
    failed: '❌ Gagal',
    refunded: '↩️ Refund'
  };
  return map[s] || ('• ' + st);
}

function renderHistory() {
  var list = $('#historyList'), empty = $('#historyEmpty');
  if (!list) return;
  if (!history.length) { list.innerHTML = ''; if (empty) empty.style.display = 'block'; return; }
  if (empty) empty.style.display = 'none';
  list.innerHTML = history.map(function(h) {
    var smmBlock = '';
    if (h.smmOrderId) {
      var st = h.smmStatus || 'pending';
      smmBlock =
        '<div class="smm-status-box">' +
          '<div class="smm-meta">SMM Order <b>#' + h.smmOrderId + '</b></div>' +
          '<div class="smm-status-line status-smm-' + String(st).toLowerCase() + '" id="smmst-' + h.smmOrderId + '">' +
            smmStatusLabel(st) +
            (h.smmStartCount != null ? ' · start: ' + h.smmStartCount : '') +
            (h.smmRemains != null ? ' · sisa: ' + h.smmRemains : '') +
          '</div>' +
          '<button class="btn small ghost check-smm-status" data-smmid="' + h.smmOrderId + '" data-tx="' + h.transaction_id + '">🔄 Cek Status Order</button>' +
        '</div>';
    } else if (h.smmMsg) {
      smmBlock = '<div class="error-text" style="font-size:12px">' + h.smmMsg + '</div>';
    }
    return '<article class="history-item glass" data-tx="' + h.transaction_id + '">' +
      '<div class="history-top"><div><b>' + h.transaction_id + '</b><small>' + new Date(h.paidAt || h.createdAt).toLocaleString('id-ID') + '</small></div>' +
      '<strong class="status-paid">' + rupiah(h.amount) + '</strong></div>' +
      '<div class="history-items">' + (h.items || []).map(function(i){ return i.name + (i.meta ? ' (' + i.meta + ')' : ''); }).join(' · ') + '</div>' +
      smmBlock +
      '<button class="btn small view-receipt" data-tx="' + h.transaction_id + '">📄 Lihat Struk</button></article>';
  }).join('');
}

async function checkSmmStatus(smmId, txId, silent) {
  if (!smmId) return;
  try {
    if (!silent) toast('Cek status SMM...');
    var data = await api('/api/smm-status', {
      method: 'POST',
      body: JSON.stringify({ id: String(smmId) })
    });
    var st = data.order_status || (data.orders && data.orders[smmId] && data.orders[smmId].order_status) || data.status;
    var start = data.start_count;
    var remains = data.remains;
    if (data.orders && data.orders[smmId]) {
      st = data.orders[smmId].order_status || st;
      start = data.orders[smmId].start_count;
      remains = data.orders[smmId].remains;
    }
    // update history entry
    history = history.map(function(h) {
      if (String(h.smmOrderId) === String(smmId) || h.transaction_id === txId) {
        h.smmStatus = st || h.smmStatus;
        if (start != null) h.smmStartCount = start;
        if (remains != null) h.smmRemains = remains;
      }
      return h;
    });
    saveHistory();
    if (!silent) toast(smmStatusLabel(st || 'unknown'));
  } catch (e) {
    if (!silent) toast(e.message || 'Gagal cek status');
  }
}

function refreshOpenSmmStatuses() {
  history.forEach(function(h) {
    if (!h.smmOrderId) return;
    var st = String(h.smmStatus || 'pending').toLowerCase();
    if (['completed', 'success', 'canceled', 'cancelled', 'failed', 'refunded'].indexOf(st) >= 0) return;
    checkSmmStatus(h.smmOrderId, h.transaction_id, true);
  });
}

function openReceipt(txId) {
  var order = history.find(function(h){ return h.transaction_id === txId; });
  if (!order) return;
  currentReceiptOrder = order;
  drawReceipt(order);
  $('#receiptModal').classList.add('open');
  $('#overlay').classList.add('show');
}
function closeReceipt() {
  $('#receiptModal').classList.remove('open');
  if (!$('#payModal').classList.contains('open') && !$('#cartDrawer').classList.contains('open')) $('#overlay').classList.remove('show');
}

function drawReceipt(order) {
  var canvas = $('#receiptCanvas'), ctx = canvas.getContext('2d'), W = 400;
  var H = 240 + ((order.items || []).length) * 28 + 180;
  canvas.width = W; canvas.height = H;
  ctx.fillStyle = '#0a1520'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#59cfff'; ctx.fillRect(0, 0, W, 6);
  var y = 30;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#59cfff'; ctx.font = 'bold 12px Inter,sans-serif'; ctx.fillText('STRUK PEMBAYARAN', W / 2, y);
  y += 22; ctx.fillStyle = '#f4f9ff'; ctx.font = 'bold 18px Space Grotesk,sans-serif'; ctx.fillText(CONFIG.store, W / 2, y);
  y += 18; ctx.fillStyle = '#8fa4b8'; ctx.font = '11px Inter,sans-serif'; ctx.fillText('Digital Service Store', W / 2, y);
  y += 20; ctx.strokeStyle = 'rgba(89,207,255,0.25)'; ctx.beginPath(); ctx.moveTo(24, y); ctx.lineTo(W - 24, y); ctx.stroke();
  function row(label, val) {
    y += 20; ctx.textAlign = 'left'; ctx.fillStyle = '#8fa4b8'; ctx.font = '11px Inter,sans-serif'; ctx.fillText(label, 28, y);
    ctx.textAlign = 'right'; ctx.fillStyle = '#f4f9ff'; ctx.font = '12px Inter,sans-serif'; ctx.fillText(val, W - 28, y);
  }
  row('ID Transaksi', order.transaction_id);
  row('Tanggal TRX', new Date(order.paidAt || order.createdAt).toLocaleString('id-ID'));
  row('Metode', order.method || 'QRIS');
  if (order.smmOrderId) row('SMM Order', '#' + order.smmOrderId);
  y += 14; ctx.strokeStyle = 'rgba(89,207,255,0.25)'; ctx.beginPath(); ctx.moveTo(24, y); ctx.lineTo(W - 24, y); ctx.stroke();
  y += 20; ctx.textAlign = 'left'; ctx.fillStyle = '#59cfff'; ctx.font = 'bold 12px Inter,sans-serif'; ctx.fillText('Jenis barang', 28, y);
  (order.items || []).forEach(function(item) {
    y += 24; ctx.fillStyle = '#f4f9ff'; ctx.font = '13px Inter,sans-serif'; ctx.textAlign = 'left';
    ctx.fillText((item.name || '').slice(0, 28), 28, y);
    ctx.textAlign = 'right'; ctx.fillStyle = '#8fa4b8'; ctx.fillText(rupiah(item.subtotal || item.price), W - 28, y);
  });
  y += 18; ctx.strokeStyle = 'rgba(89,207,255,0.25)'; ctx.beginPath(); ctx.moveTo(24, y); ctx.lineTo(W - 24, y); ctx.stroke();
  y += 28; ctx.textAlign = 'left'; ctx.fillStyle = '#8fa4b8'; ctx.font = '12px Inter,sans-serif'; ctx.fillText('Total', 28, y);
  ctx.textAlign = 'right'; ctx.fillStyle = '#59cfff'; ctx.font = 'bold 22px Space Grotesk,sans-serif'; ctx.fillText(rupiah(order.amount), W - 28, y);
  y += 28; ctx.textAlign = 'center'; ctx.fillStyle = '#21c86b'; ctx.font = 'bold 13px Inter,sans-serif'; ctx.fillText('✓ LUNAS', W / 2, y);
}

function downloadReceiptAndRedirect() {
  if (!currentReceiptOrder) return;
  var canvas = $('#receiptCanvas');
  canvas.toBlob(function(blob) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = 'struk-' + currentReceiptOrder.transaction_id + '.png'; a.click();
    URL.revokeObjectURL(url);
    setTimeout(function() {
      var itemsText = (currentReceiptOrder.items || []).map(function(i){ return '• ' + i.name; }).join('\n');
      var msg = 'Halo Admin ' + CONFIG.store + ',\n\nSaya sudah bayar QRIS.\nID: ' + currentReceiptOrder.transaction_id + '\nTotal: ' + rupiah(currentReceiptOrder.amount) + '\n' + (currentReceiptOrder.smmOrderId ? 'SMM Order: #' + currentReceiptOrder.smmOrderId + '\n' : '') + '\n' + itemsText + '\n\nBukti struk dilampirkan.';
      window.open(waUrl(msg), '_blank');
    }, 600);
  }, 'image/png');
}

function showPage(page) {
  $$('.page').forEach(function(x){ x.classList.toggle('active', x.dataset.page === page); });
  $$('[data-page]').forEach(function(x){ if (x.tagName === 'BUTTON') x.classList.toggle('active', x.dataset.page === page); });
  if ($('#navLinks')) $('#navLinks').classList.remove('open');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (page === 'riwayat') { renderHistory(); refreshOpenSmmStatuses(); }
  if (page === 'smm' && !smmServices.length) loadSmm();
}

function feeFor(n) { if (n <= 0) return 0; var f = FEES.find(function(x){ return n <= x.max; }); return f ? f.fee : null; }
function renderFees() { $('#feeTable').innerHTML = FEES.map(function(x){ return '<tr><td>' + x.range + '</td><td>' + rupiah(x.fee) + '</td></tr>'; }).join(''); }
function calcFee() {
  var n = Number((($('#transactionInput') && $('#transactionInput').value) || '').replace(/\D/g, '')) || 0;
  var f = feeFor(n);
  $('#feeResult').textContent = f === null ? 'Di luar daftar' : rupiah(f);
}

function init() {
  renderProducts(); renderCart(); renderFees(); renderHistory();
  $('#steps').innerHTML = STEPS.map(function(s, i) {
    return '<article class="step glass"><span class="step-num">STEP ' + String(i + 1).padStart(2, '0') + '</span><h3>' + s[0] + '</h3><p>' + s[1] + '</p></article>';
  }).join('');
  $('#faqList').innerHTML = FAQ.map(function(x) {
    return '<article class="faq-item"><button class="faq-q">' + x[0] + ' <span>＋</span></button><div class="faq-a">' + x[1] + '</div></article>';
  }).join('');
  $('#year').textContent = new Date().getFullYear();
  $$('[data-wa]').forEach(function(a){ a.href = waUrl(chatText()); });
}

document.addEventListener('click', function(e) {
  var p = e.target.closest('[data-page]');
  if (p && (p.tagName === 'BUTTON' || p.classList.contains('menu-card'))) {
    e.preventDefault();
    if (p.dataset.page) showPage(p.dataset.page);
  }
  if (e.target.closest('.add-btn')) add(e.target.closest('.add-btn').dataset.id);
  if (e.target.closest('.buy-now')) buyNow(e.target.closest('.buy-now').dataset.id);
  if (e.target.closest('.inc')) change(e.target.closest('.inc').dataset.id, 1);
  if (e.target.closest('.dec')) change(e.target.closest('.dec').dataset.id, -1);
  if (e.target.closest('.remove-item')) removeItem(e.target.closest('.remove-item').dataset.id);
  if (e.target.closest('#cartBtn')) openCart();
  if (e.target.closest('#resumePayBtn')) {
    if (pendingPayment && pendingPayment.status === 'pending') {
      openPayModal(); renderPendingUI();
    } else toast('Tidak ada pembayaran aktif');
  }
  if (e.target.closest('#closeCart') || e.target === $('#overlay')) { closeCart(); closePayModal(); closeReceipt(); closeSmmModal(); }
  if (e.target.closest('#checkoutBtn')) checkoutCart();
  if (e.target.closest('#clearCart')) { cart = []; saveCart(); toast('Dikosongkan'); }
  if (e.target.closest('#claimBtn') || e.target.closest('#claimBtn2')) {
    location.href = waUrl('Halo Admin FANXZ07, saya ingin klaim promo sewa bot GRATIS grup 250+ member.');
  }
  var fq = e.target.closest('.faq-q'); if (fq) fq.parentElement.classList.toggle('open');
  if (e.target.closest('#closePay')) closePayModal();
  if (e.target.closest('#btnCancelPay')) cancelPayment();
  if (e.target.closest('#btnRetryPay')) { if (pendingPayment) { pendingPayment = null; savePending(); } closePayModal(); }
  if (e.target.closest('#btnGoHistory')) { closePayModal(); showPage('riwayat'); }
  if (e.target.closest('.view-receipt')) openReceipt(e.target.closest('.view-receipt').dataset.tx);
  var smmBtn = e.target.closest('.check-smm-status');
  if (smmBtn) checkSmmStatus(smmBtn.dataset.smmid, smmBtn.dataset.tx, false);
  if (e.target.closest('#closeReceipt')) closeReceipt();
  if (e.target.closest('#btnDownloadReceipt')) downloadReceiptAndRedirect();
  if (e.target.closest('#btnSendWa') && currentReceiptOrder) {
    window.open(waUrl('Halo Admin, bayar QRIS ID ' + currentReceiptOrder.transaction_id + ' total ' + rupiah(currentReceiptOrder.amount)), '_blank');
  }
  if (e.target.closest('.smm-order-btn')) openSmmOrder(e.target.closest('.smm-order-btn').dataset.sid);
  if (e.target.closest('#closeSmm')) closeSmmModal();
  if (e.target.closest('#smmPayBtn')) submitSmmPay();
});

if ($('#transactionInput')) $('#transactionInput').addEventListener('input', calcFee);
if ($('#rekberBtn')) $('#rekberBtn').addEventListener('click', function() {
  var n = Number((($('#transactionInput').value) || '').replace(/\D/g, '')) || 0;
  var f = feeFor(n);
  if (!n || !f) { toast('Nominal tidak valid'); return; }
  location.href = waUrl('Halo Admin, Rekber/MC.\nNominal: ' + rupiah(n) + '\nFee: ' + rupiah(f));
});
if ($('#menuBtn')) $('#menuBtn').addEventListener('click', function(){ $('#navLinks').classList.toggle('open'); });
if ($('#musicBtn')) $('#musicBtn').addEventListener('click', function() {
  var a = $('#bgMusic');
  if (a.paused) a.play().then(function(){ $('#musicBtn').textContent = '🔊'; }).catch(function(){});
  else { a.pause(); $('#musicBtn').textContent = '🔇'; }
});
if ($('#smmSearch')) $('#smmSearch').addEventListener('input', renderSmmList);
if ($('#smmCategory')) $('#smmCategory').addEventListener('change', renderSmmList);
if ($('#smmQty')) $('#smmQty').addEventListener('input', updateSmmPrice);

try { init(); updateResumeBtn(); } catch (err) { console.error(err); }

(function() {
  var enter = document.getElementById('enterBtn');
  setTimeout(function(){ if (enter) { enter.hidden = false; enter.style.display = 'inline-flex'; } }, 800);
})();

function enterStore() {
  var loader = document.getElementById('loader'), app = document.getElementById('app');
  if (loader) { loader.style.transition = 'opacity .5s'; loader.style.opacity = '0'; }
  setTimeout(function() {
    if (loader) loader.style.display = 'none';
    if (app) app.hidden = false;
    showPage('home');
    var a = document.getElementById('bgMusic');
    if (a) { a.volume = 0.65; a.play().catch(function(){}); }
  }, 500);
}
var enterBtn = document.getElementById('enterBtn');
if (enterBtn) {
  enterBtn.addEventListener('click', enterStore);
  enterBtn.addEventListener('touchend', function(e){ e.preventDefault(); enterStore(); }, { passive: false });
}
