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
