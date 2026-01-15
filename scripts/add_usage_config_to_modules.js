const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

async function runMigration() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        console.log('Adding usage_config column to training_modules table...');

        // Check if column exists first to avoid error
        const [columns] = await connection.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'training_modules' AND COLUMN_NAME = 'usage_config'
        `, [process.env.DB_NAME]);

        if (columns.length > 0) {
            console.log('Column usage_config already exists. Skipping...');
        } else {
            // Add JSON column. Note: MySQL 5.7+ supports JSON. MariaDB 10.2+ supports JSON (as alias for LONGTEXT with check constraint).
            // Assuming MariaDB 10.11 as seen in db.sql, JSON is supported.
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
