// PostgreSQL database connection and query utilities
import { Pool } from 'pg';

let pool;

// Initialize PostgreSQL connection pool
function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }, // Required for Render PostgreSQL
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      process.exit(-1);
    });
  }
  return pool;
}

// Generic query function
export async function query(text, params) {
  const client = getPool();
  try {
    const result = await client.query(text, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Tasks CRUD operations
export const tasksDB = {
  // Get all tasks
  async getAll() {
    const result = await query(
      'SELECT * FROM tasks ORDER BY created_at DESC'
    );
    return result.rows;
  },

  // Get task by ID
  async getById(id) {
    const result = await query(
      'SELECT * FROM tasks WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },

  // Create new task
  async create(taskData) {
    const { title, description = '', completed = false } = taskData;
    const result = await query(
      'INSERT INTO tasks (title, description, completed) VALUES ($1, $2, $3) RETURNING *',
      [title, description, completed]
    );
    return result.rows[0];
  },

  // Update task
  async update(id, taskData) {
    const { title, description, completed } = taskData;
    const result = await query(
      'UPDATE tasks SET title = COALESCE($2, title), description = COALESCE($3, description), completed = COALESCE($4, completed) WHERE id = $1 RETURNING *',
      [id, title, description, completed]
    );
    return result.rows[0];
  },

  // Delete task
  async delete(id) {
    const result = await query(
      'DELETE FROM tasks WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  },

  // Get tasks by completion status
  async getByStatus(completed) {
    const result = await query(
      'SELECT * FROM tasks WHERE completed = $1 ORDER BY created_at DESC',
      [completed]
    );
    return result.rows;
  }
};

// Users CRUD operations (for future use)
export const usersDB = {
  async getAll() {
    const result = await query('SELECT * FROM users ORDER BY created_at DESC');
    return result.rows;
  },

  async getById(id) {
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  },

  async getByEmail(email) {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  },

  async create(userData) {
    const { email, name } = userData;
    const result = await query(
      'INSERT INTO users (email, name) VALUES ($1, $2) RETURNING *',
      [email, name]
    );
    return result.rows[0];
  },

  async update(id, userData) {
    const { email, name } = userData;
    const result = await query(
      'UPDATE users SET email = COALESCE($2, email), name = COALESCE($3, name) WHERE id = $1 RETURNING *',
      [id, email, name]
    );
    return result.rows[0];
  },

  async delete(id) {
    const result = await query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
};

// Health check function
export async function healthCheck() {
  try {
    const result = await query('SELECT NOW()');
    return { status: 'healthy', timestamp: result.rows[0].now };
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
}