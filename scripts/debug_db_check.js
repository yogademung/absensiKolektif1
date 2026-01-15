const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'kolektiftrainingvhp_training_voucher_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

async function checkDB() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to DB.');

        // 1. Check Column
        const [columns] = await connection.execute(`
            SELECT COLUMN_NAME, DATA_TYPE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'training_modules' AND COLUMN_NAME = 'usage_config'
        `, [dbConfig.database]);

        console.log('Column Check:', columns);

        if (columns.length === 0) {
            console.error('CRITICAL: usage_config column missing!');
        }

        // 2. Check Data
        const [rows] = await connection.execute(`SELECT id, name, usage_config FROM training_modules WHERE name LIKE '%Sales%'`);
        console.log('Data Check:', JSON.stringify(rows, null, 2));

    } catch (error) {
        console.error('DB Check Failed:', error);
    } finally {
        if (connection) await connection.end();
    }
}

checkDB();
