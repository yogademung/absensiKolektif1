// Test script untuk memeriksa apakah API voucher history bekerja
// Jalankan dengan: node test_voucher_history.js

const db = require('./src/config/db');

async function testVoucherHistory() {
    try {
        console.log('=== Testing Voucher History ===\n');

        // 1. Cek apakah ada data di tabel admins dengan hotel_id
        console.log('1. Checking admins with hotel_id:');
        const [admins] = await db.execute('SELECT id, email, role, hotel_id FROM admins WHERE hotel_id IS NOT NULL');
        console.log('Admins with hotel:', admins);
        console.log('');

        // 2. Cek apakah ada data di tabel vouchers
        console.log('2. Checking vouchers:');
        const [vouchers] = await db.execute('SELECT * FROM vouchers LIMIT 5');
        console.log('Vouchers:', vouchers);
        console.log('');

        // 3. Cek apakah ada data di tabel hotels
        console.log('3. Checking hotels:');
        const [hotels] = await db.execute('SELECT * FROM hotels');
        console.log('Hotels:', hotels);
        console.log('');

        // 4. Test query getByHotelId untuk setiap hotel
        if (hotels.length > 0) {
            for (const hotel of hotels) {
                console.log(`4. Testing getByHotelId for hotel_id=${hotel.id} (${hotel.name}):`);
                const [history] = await db.execute(
                    `SELECT v.*, tm.name as module_name, ts.date, ts.session, ts.start_time, ts.end_time, ts.zoom_link
                     FROM vouchers v
                     JOIN training_modules tm ON v.module_id = tm.id
                     JOIN training_schedules ts ON v.schedule_id = ts.id
                     WHERE v.hotel_id = ?
                     ORDER BY ts.date DESC, ts.start_time DESC`,
                    [hotel.id]
                );
                console.log(`Found ${history.length} records:`, history);
                console.log('');
            }
        }

        console.log('=== Test Complete ===');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

testVoucherHistory();
