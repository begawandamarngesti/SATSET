# Toko online (Vercel + Supabase)

1. Supabase: buat project, buka SQL Editor, jalankan isi `schema.sql`.
2. Google Sheets: buat spreadsheet, buat Service Account di Google Cloud (aktifkan Sheets API), download JSON-nya, lalu share spreadsheet ke email service account itu (Editor).
3. Ganti `public/qris.png` dengan gambar QRIS-mu.
4. Push semua file ke GitHub, import repo di Vercel.
5. Di Vercel, Settings > Environment Variables:
   - SUPABASE_URL
   - SUPABASE_SERVICE_KEY (service_role key, jangan dibagikan)
   - ADMIN_PASSWORD (pakai yang panjang)
   - GOOGLE_SERVICE_ACCOUNT (isi seluruh JSON-nya)
   - SHEET_ID (bagian panjang di URL spreadsheet)
6. Redeploy. Toko di `/`, admin di `/admin.html`.

## Update performa (WAJIB)
1. Jalankan `migration.sql` sekali di Supabase SQL Editor.
2. `vercel.json` sudah mengarahkan fungsi ke Singapura (sin1). Pastikan project Supabase juga di region Singapore (ap-southeast-1); kalau di US, tiap request terasa lambat dan tidak bisa diubah tanpa membuat project baru.
3. Upload ulang foto produk tidak perlu: foto lama otomatis tetap tampil.

## Update 2 (WAJIB, urutan)
1. Supabase SQL Editor: jalankan `migration.sql` (kalau belum), lalu `migration2.sql`.
2. Hapus pesanan uji coba sebelum jualan sungguhan (stok dikurangi saat pesanan MASUK, bukan saat lunas).
3. Push ke GitHub, tunggu Vercel deploy.
4. Buka `/admin.html` > Pengaturan: isi link grup WhatsApp dan upload QRIS.
5. Isi baris pertama Google Sheets kosong saja; header dibuat otomatis. Data 1 baris per item (mudah dibuat pivot rekap produksi).
