const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    // Don't specify database yet to ensure connection
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

async function checkDB() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to MySQL server.');

        // 1. List Databases
        const [dbs] = await connection.execute('SHOW DATABASES');
        console.log('Available Databases:', dbs.map(d => d.Database));

        const targetDB = 'kolektiftrainingvhp_training_voucher_db';
        const dbExists = dbs.find(d => d.Database === targetDB);

        if (!dbExists) {
            console.error(`Database '${targetDB}' NOT FOUND! This explains why migration failed.`);
            return;
        }

        await connection.changeUser({ database: targetDB });
        console.log(`Switched to ${targetDB}`);

        // 2. Check Column
        const [columns] = await connection.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'training_modules' AND COLUMN_NAME = 'usage_config'
        `, [targetDB]);

        if (columns.length === 0) {
            console.error('CRITICAL: usage_config column missing!');
        } else {
            console.log('Column usage_config exists.');
        }

        // 3. Check Data for "Sales & Catering" (or any module)
        const [rows] = await connection.execute(`SELECT id, name, usage_config FROM training_modules LIMIT 5`);
        console.log('Sample Data:', JSON.stringify(rows, null, 2));

    } catch (error) {
        console.error('DB Check Failed:', error);
    } finally {
        if (connection) await connection.end();
    }
}

checkDB();
