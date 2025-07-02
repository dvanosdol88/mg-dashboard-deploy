// Express.js router for health check and system status
import express from 'express';
import { healthCheck } from '../lib/database.js';

const router = express.Router();

// GET /api/health - Health check endpoint
router.get('/', async (req, res) => {
  try {
    const dbHealth = await healthCheck();
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealth,
        gemini: {
          status: process.env.GEMINI_API_KEY ? 'configured' : 'not_configured'
        }
      },
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0'
    };

    // If database is unhealthy, mark overall status as unhealthy
    if (dbHealth.status === 'unhealthy') {
      health.status = 'unhealthy';
      res.status(503);
    }

    res.json(health);
  } catch (error) {
    console.error('Health check error:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// GET /api/health/database - Database-specific health check
router.get('/database', async (req, res) => {
  try {
    const dbHealth = await healthCheck();
    
    if (dbHealth.status === 'unhealthy') {
      res.status(503);
    }
    
    res.json(dbHealth);
  } catch (error) {
    console.error('Database health check error:', error);
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;