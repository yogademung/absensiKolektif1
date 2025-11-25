# Token Deduction Logic - Updated

## Perubahan Logika

Sistem sekarang menggunakan logika **"First Registration Per Schedule"** untuk pengurangan token hotel.

### Cara Kerja:

1. **User Pertama dari Hotel untuk Schedule Tertentu:**
   - Token hotel **DIKURANGI 1**
   - `token_cost` di voucher = **1**
   - `token_change` di token_logs = **-1**
   - Reason: `"Voucher Registration (First - Token Deducted)"`

2. **User Kedua dan Seterusnya dari Hotel yang Sama untuk Schedule yang Sama:**
   - Token hotel **TIDAK DIKURANGI**
   - `token_cost` di voucher = **0**
   - `token_change` di token_logs = **0**
   - Reason: `"Voucher Registration (Additional - No Token Deducted)"`
   - Tetap tercatat di database (vouchers & token_logs)

### Contoh Skenario:

**Hotel A memiliki 10 tokens**

1. Staff 1 dari Hotel A register untuk "React Basics - Session 1"
   - Token Hotel A: 10 → **9** ✅ (dikurangi)
   
2. Staff 2 dari Hotel A register untuk "React Basics - Session 1" (schedule yang sama)
   - Token Hotel A: **9** → 9 ❌ (tidak dikurangi)
   
3. Staff 3 dari Hotel A register untuk "React Basics - Session 2" (schedule berbeda)
   - Token Hotel A: 9 → **8** ✅ (dikurangi, karena schedule berbeda)

### Keuntungan:

- Hotel hanya bayar 1 token per schedule
- Bisa kirim banyak staff ke schedule yang sama tanpa biaya tambahan
- Semua registrasi tetap tercatat untuk tracking
- Token logs tetap lengkap untuk audit

### File yang Dimodifikasi:

1. **`src/models/Voucher.js`**
   - Tambah method `findByHotelAndSchedule()` untuk cek registrasi sebelumnya

2. **`src/services/voucherService.js`**
   - Logika cek apakah hotel sudah pernah register di schedule tersebut
   - Conditional token deduction berdasarkan `isFirstRegistration`
   - Token logs dengan reason yang berbeda untuk first vs additional registration
