// Improve database schema with recommended changes
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: 'postgresql://dashboard_db_pj6n_user:VlwE3L1aio550wX9epVxEGp56fmIW7w5@dpg-d0t0gj15pdvs73d58c20-a.oregon-postgres.render.com/dashboard_db_pj6n',
  ssl: { rejectUnauthorized: false }
});

async function improveDatabaseSchema() {
  try {
    console.log('🔧 Improving database schema...');
    
    // Step 1: Add task_type column
    console.log('\n1. Adding task_type column...');
    try {
      await pool.query(`
        ALTER TABLE tasks 
        ADD COLUMN IF NOT EXISTS task_type VARCHAR(50) DEFAULT 'personal'
      `);
      console.log('✅ Added task_type column');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ task_type column already exists');
      } else {
        throw error;
      }
    }
    
    // Step 2: Make user_id nullable with default
    console.log('\n2. Making user_id more flexible...');
    try {
      await pool.query(`
        ALTER TABLE tasks 
        ALTER COLUMN user_id SET DEFAULT 'default_user'
      `);
      console.log('✅ Set default value for user_id');
    } catch (error) {
      console.log('⚠️  user_id modification:', error.message);
    }
    
    // Step 3: Make due_date nullable (it probably already is)
    console.log('\n3. Ensuring due_date is optional...');
    try {
      await pool.query(`
        ALTER TABLE tasks 
        ALTER COLUMN due_date DROP NOT NULL
      `);
      console.log('✅ due_date is now optional');
    } catch (error) {
      if (error.message.includes('does not exist')) {
        console.log('✅ due_date was already optional');
      } else {
        console.log('⚠️  due_date modification:', error.message);
      }
    }
    
    // Step 4: Add constraint for status values
    console.log('\n4. Adding status value constraints...');
    try {
      await pool.query(`
        ALTER TABLE tasks 
        ADD CONSTRAINT IF NOT EXISTS check_status 
        CHECK (status IN ('pending', 'completed', 'active', 'open'))
      `);
      console.log('✅ Added status value constraints');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ Status constraints already exist');
      } else {
        console.log('⚠️  Status constraint:', error.message);
      }
    }
    
    // Step 5: Add constraint for task_type values
    console.log('\n5. Adding task_type value constraints...');
    try {
      await pool.query(`
        ALTER TABLE tasks 
        ADD CONSTRAINT IF NOT EXISTS check_task_type 
        CHECK (task_type IN ('work', 'personal', 'grocery_list', 'reminder'))
      `);
      console.log('✅ Added task_type value constraints');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ Task_type constraints already exist');
      } else {
        console.log('⚠️  Task_type constraint:', error.message);
      }
    }
    
    // Step 6: Show updated table structure
    console.log('\n6. Updated table structure:');
    const columns = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'tasks' 
      ORDER BY ordinal_position
    `);
    columns.rows.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULLABLE'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
    });
    
    console.log('\n🎉 Database schema improvements complete!');
    
  } catch (error) {
    console.error('❌ Schema improvement failed:', error.message);
  } finally {
    await pool.end();
  }
}

improveDatabaseSchema();