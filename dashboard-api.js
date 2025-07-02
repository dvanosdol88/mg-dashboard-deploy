// Dashboard API endpoints for task management
import express from 'express';
import { Pool } from 'pg';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

// Database connection
const pool = new Pool({
  connectionString: 'postgresql://dashboard_db_pj6n_user:VlwE3L1aio550wX9epVxEGp56fmIW7w5@dpg-d0t0gj15pdvs73d58c20-a.oregon-postgres.render.com/dashboard_db_pj6n',
  ssl: { rejectUnauthorized: false }
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Get all tasks for a user (or default user if none specified)
app.get('/api/tasks/:userId?', async (req, res) => {
  try {
    const userId = req.params.userId || 'default_user';
    const result = await pool.query(
      'SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    
    // Transform database format to dashboard format
    const tasks = result.rows.map(row => ({
      id: row.id,
      text: row.title,
      type: row.task_type || 'personal', // Now using proper task_type column
      completed: row.status === 'completed',
      createdAt: row.created_at,
      dueDate: row.due_date,
      description: row.description // Keep original description separate
    }));
    
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Create new task
app.post('/api/tasks', async (req, res) => {
  try {
    const { text, type = 'personal', userId = 'default_user', dueDate = null, description = '' } = req.body;
    
    const result = await pool.query(
      'INSERT INTO tasks (title, task_type, description, status, user_id, due_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [text, type, description, 'pending', userId, dueDate]
    );
    
    const newTask = {
      id: result.rows[0].id,
      text: result.rows[0].title,
      type: result.rows[0].task_type,
      completed: false,
      createdAt: result.rows[0].created_at,
      dueDate: result.rows[0].due_date,
      description: result.rows[0].description
    };
    
    res.json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update task completion status
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;
    
    const status = completed ? 'completed' : 'pending';
    const result = await pool.query(
      'UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const updatedTask = {
      id: result.rows[0].id,
      text: result.rows[0].title,
      type: result.rows[0].task_type,
      completed: result.rows[0].status === 'completed',
      createdAt: result.rows[0].created_at,
      dueDate: result.rows[0].due_date,
      description: result.rows[0].description
    };
    
    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete task
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Dashboard API running on port ${PORT}`);
});

export default app;