const db = require('../config/db');

class TokenLog {
    static async create(hotelId, registrationId, tokenChange, reason) {
        await db.execute(
            'INSERT INTO token_logs (hotel_id, registration_id, token_change, reason) VALUES (?, ?, ?, ?)',
            [hotelId, registrationId, tokenChange, reason]
        );
    }
}

module.exports = TokenLog;
