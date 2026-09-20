# FANXZ07 CEO MUDA — Store + Austin Pay QRIS

Website digital service store dengan sistem keranjang + pembayaran QRIS via **Austin Pay**.

## Fitur baru

- Keranjang → **Bayar via QRIS** (bukan langsung WhatsApp)
- QR tidak digenerate ulang saat refresh / tutup modal
- Bisa tutup halaman QR dan buka lagi (pending disimpan di localStorage)
- Tombol batalkan deposit baru aktif setelah **40 detik**
- Polling status otomatis + tombol cek manual
- Setelah lunas → halaman **Riwayat Transaksi**
- **Struk canvas** (nama web, barang, harga, metode, tanggal) → download PNG → auto redirect WhatsApp admin (wajib sertakan bukti)

## Environment Variables (wajib)

Set di Vercel / Netlify:

| Key | Keterangan |
|-----|------------|
| `AUSTINPAY_API_KEY` | API Key dari Profil → API Key (`apg_live_...`) |
| `AUSTINPAY_API_SECRET` | **API Secret (HMAC)** dari Profil → API Secret. Kalau sudah di-generate di dashboard, **wajib** diisi — request tanpa signature akan 401 |
| `AUSTINPAY_WEBHOOK_SECRET` | Secret untuk verifikasi header `X-AustinPay-Signature` pada webhook |

Contoh file: `.env.example`

### Catatan API Secret
Austin Pay mendukung 2 mode:
1. **API Key saja** (`?apikey=...`) — jalan kalau kamu **belum** generate API Secret
2. **API Key + HMAC** — begitu API Secret dibuat di dashboard, setiap request **wajib** header `X-API-Key`, `X-Timestamp`, `X-Signature`

Kode kita otomatis pakai mode HMAC kalau `AUSTINPAY_API_SECRET` terisi.

### Polling + Webhook
Keduanya dipakai bersamaan (recommended):
- **Polling** (client, tiap ~4–5 detik) → UI langsung tahu status paid/expired
- **Webhook** (server) → backup real-time, bisa dipakai nanti untuk notifikasi admin / simpan DB

## Webhook URL

Setelah deploy, daftarkan webhook di dashboard Austin Pay:

### Vercel
```
https://YOUR-PROJECT.vercel.app/api/webhook/austinpay
```

### Netlify
```
https://YOUR-SITE.netlify.app/api/webhook/austinpay
```
(atau `https://YOUR-SITE.netlify.app/.netlify/functions/webhook-austinpay`)

Endpoint sudah verifikasi header `X-AustinPay-Signature` (HMAC-SHA256 raw body).

## Deploy

### Vercel
1. Import repo / upload folder
2. Environment Variables → isi 3 env di atas
3. Deploy (root directory = folder ini)
4. Framework preset: Other / static

API routes ada di folder `/api/` (Node.js serverless).

### Netlify
1. Import repo / drag folder
2. Site settings → Environment variables → isi key
3. Build settings:
   - Publish directory: `.`
   - Functions directory: `netlify/functions`
4. `netlify.toml` sudah mengatur redirect `/api/*` → functions

## Struktur

```
/
├── index.html
├── style.css
├── script.js
├── assets/
├── api/                    # Vercel serverless
│   ├── _austin.js
│   ├── create-deposit.js
│   ├── check-deposit.js
│   ├── cancel-deposit.js
│   └── webhook/austinpay.js
├── netlify/functions/      # Netlify functions
│   ├── create-deposit.js
│   ├── check-deposit.js
│   ├── cancel-deposit.js
│   └── webhook-austinpay.js
├── vercel.json
├── netlify.toml
├── package.json
└── .env.example
```

## Alur pembayaran

1. User isi keranjang → klik **Bayar via QRIS**
2. Frontend `POST /api/create-deposit` `{ amount, items }`
3. Server panggil Austin `POST /api/deposit/create`
4. QR + `transaction_id` disimpan di `localStorage` (`fanxz07_pending`)
5. Modal QR tampil; polling `GET /api/check-deposit?transaction_id=...` tiap 4 detik
6. Saat status `paid` → simpan ke `fanxz07_history`, kosongkan cart, redirect ke Riwayat
7. User unduh struk (canvas) → otomatis buka WhatsApp admin dengan detail + instruksi lampirkan SS struk

## Catatan database

Versi ini memakai **localStorage** di browser untuk:
- keranjang
- pending payment (agar QR tidak hilang saat refresh)
- riwayat transaksi

Webhook Austin Pay sudah siap; kamu bisa extend nanti untuk simpan ke DB server-side (Supabase, PlanetScale, Turso, dll) jika butuh sinkron multi-device / admin panel.

## Testing lokal

API Austin membutuhkan key asli. Untuk UI saja:

```bash
npx serve .
```

Endpoint `/api/*` hanya jalan setelah deploy ke Vercel/Netlify (atau pakai `vercel dev` / `netlify dev`).
