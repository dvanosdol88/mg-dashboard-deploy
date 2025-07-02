// Create tasks table in dashboard-db
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: 'postgresql://dashboard_db_pj6n_user:VlwE3L1aio550wX9epVxEGp56fmIW7w5@dpg-d0t0gj15pdvs73d58c20-a.oregon-postgres.render.com/dashboard_db_pj6n',
  ssl: { rejectUnauthorized: false }
});

const createTable = async () => {
  try {
    // First, let's see what tables already exist
    const tables = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('📋 Existing tables:', tables.rows);
    
    // Check if tasks table exists and its structure
    const taskTable = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'tasks'
    `);
    console.log('📊 Tasks table columns:', taskTable.rows);
    
    // If tasks table doesn't exist, create it
    if (taskTable.rows.length === 0) {
      await pool.query(`
        CREATE TABLE tasks (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            text TEXT NOT NULL,
            task_type VARCHAR(20) NOT NULL,
            completed BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Tasks table created successfully!');
    } else {
      console.log('✅ Tasks table already exists');
    }
    
    // Test the table
    const testResult = await pool.query('SELECT COUNT(*) FROM tasks');
    console.log(`📊 Current tasks count: ${testResult.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
};

createTable();