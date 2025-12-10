const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        const migrationFile = path.join(__dirname, 'migrations', '006_add_gdrive_link_to_hotels.sql');
        const sql = fs.readFileSync(migrationFile, 'utf8');

        console.log('Running migration: 006_add_gdrive_link_to_hotels.sql');
        await connection.query(sql);
        console.log('✓ Migration completed successfully!');
        console.log('✓ Column gdrive_link has been added to hotels table');
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('⚠ Column gdrive_link already exists in hotels table');
        } else {
            console.error('✗ Migration failed:', error.message);
            throw error;
        }
    } finally {
        await connection.end();
    }
}

runMigration()
    .then(() => {
        console.log('\nMigration process completed.');
        process.exit(0);
    })
    .catch((err) => {
        console.error('\nMigration process failed:', err);
        process.exit(1);
    });
