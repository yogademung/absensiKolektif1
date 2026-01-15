const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'training_voucher_db', // Correct DB name
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

async function runMigration() {
    let connection;
    try {
        console.log('Connecting to database:', dbConfig.database);
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        console.log('Adding usage_config column to training_modules table...');

        const [columns] = await connection.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'training_modules' AND COLUMN_NAME = 'usage_config'
        `, [dbConfig.database]);

        if (columns.length > 0) {
            console.log('Column usage_config already exists. Skipping...');
        } else {
            await connection.execute(`
                ALTER TABLE training_modules
                ADD COLUMN usage_config JSON NULL DEFAULT NULL
            `);
            console.log('Column usage_config added successfully.');
        }

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        if (connection) await connection.end();
    }
}

runMigration();
