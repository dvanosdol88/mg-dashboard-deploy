// Express.js router for tasks API (replacing Firestore operations)
import express from 'express';
import { tasksDB } from '../lib/database.js';

const router = express.Router();

// GET /api/tasks - Get all tasks
router.get('/', async (req, res) => {
  try {
    const { completed } = req.query;
    
    let tasks;
    if (completed !== undefined) {
      // Filter by completion status
      tasks = await tasksDB.getByStatus(completed === 'true');
    } else {
      // Get all tasks
      tasks = await tasksDB.getAll();
    }
    
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// GET /api/tasks/:id - Get task by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const task = await tasksDB.getById(id);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// POST /api/tasks - Create new task
router.post('/', async (req, res) => {
  try {
    const { title, description, completed } = req.body;
    
    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const taskData = {
      title: title.trim(),
      description: description?.trim() || '',
      completed: Boolean(completed)
    };
    
    const newTask = await tasksDB.create(taskData);
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PUT /api/tasks/:id - Update task
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, completed } = req.body;
    
    // Check if task exists
    const existingTask = await tasksDB.getById(id);
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (completed !== undefined) updateData.completed = Boolean(completed);
    
    const updatedTask = await tasksDB.update(id, updateData);
    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedTask = await tasksDB.delete(id);
    if (!deletedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json({ message: 'Task deleted successfully', task: deletedTask });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// PATCH /api/tasks/:id/toggle - Toggle task completion status
router.patch('/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingTask = await tasksDB.getById(id);
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const updatedTask = await tasksDB.update(id, { 
      completed: !existingTask.completed 
    });
    
    res.json(updatedTask);
  } catch (error) {
    console.error('Error toggling task:', error);
    res.status(500).json({ error: 'Failed to toggle task' });
  }
});

export default router;