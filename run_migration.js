const fs = require('fs');
const path = require('path');
const db = require('./src/config/db');

async function runMigration() {
    try {
        const migrationPath = path.join(__dirname, 'migrations', '002_add_role_and_hotel_id_to_admins.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');
        
        const statements = sql.split(';').filter(s => s.trim());
        
        for (const statement of statements) {
            if (statement.trim()) {
                console.log('Executing:', statement);
                await db.execute(statement);
            }
        }
        
        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
