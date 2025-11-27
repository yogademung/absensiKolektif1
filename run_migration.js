const db = require('./src/config/db');
const fs = require('fs');
const path = require('path');

async function run() {
    try {
        const sql = fs.readFileSync(path.join(__dirname, 'migrations', '002_add_admin_email_to_audit_logs.sql'), 'utf8');
        await db.execute(sql);
        console.log('Migration 002 executed successfully');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        process.exit();
    }
}

run();
