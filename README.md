# MG Dashboard - Render Deployment

This repository contains the deployment-ready version of the MG Dashboard application.

## Quick Start

```bash
npm install
npm start
```

## Deployment

This repo is configured for Render deployment with:

- **Build Command**: `npm install`
- **Start Command**: `npm start` (runs `node server.js`)
- **Port**: 3000 (configurable via `PORT` environment variable)

## Environment Variables

Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `GOOGLE_CLIENT_ID` - Google OAuth client ID  
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `BASE_URL` - Application base URL

## API Endpoints

### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PATCH /api/tasks/:id/toggle` - Toggle task completion

### Gemini AI
- `POST /api/gemini` - Generate AI response
- `GET /api/gemini/models` - List available models

### Health Check
- `GET /api/health` - System health status
- `GET /api/health/database` - Database health check

## Database Schema

The PostgreSQL database includes:
- `tasks` table: Task management
- `users` table: User management (future use)
- Automatic timestamps and UUID primary keys

## Deployment on Render

### Automatic Deployment

1. **Connect GitHub repository** to Render
2. **Use render.yaml** for automatic configuration
3. **Set environment variables**:
   - `GEMINI_API_KEY`: Your Google Gemini API key
   - `DATABASE_URL`: Automatically provided by Render PostgreSQL

### Manual Setup

1. **Create PostgreSQL database** on Render
2. **Create web service** with:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Health Check Path: `/api/health`
3. **Set environment variables** in Render dashboard

### Database Migration

Run the database schema on first deployment:
```bash
npm run db:migrate
```

## Migration from Firebase

This project was migrated from Firebase to PostgreSQL + Render:

✅ **Completed**:
- Firestore → PostgreSQL
- Firebase Functions → Express.js APIs
- Firebase Hosting → Render deployment
- Kept Google Gemini AI integration

🗑️ **Removed**:
- Firebase SDK
- Firestore client code
- Firebase configuration files

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `GEMINI_API_KEY` | Google Gemini API key | Yes |
| `NODE_ENV` | Environment (development/production) | No |
| `PORT` | Server port (default: 3000) | No |

## Troubleshooting

### Database Issues
- Check `DATABASE_URL` format: `postgresql://user:password@host:port/database`
- Verify database migrations: `npm run db:migrate`
- Test connection: `GET /api/health/database`

### API Issues
- Verify `GEMINI_API_KEY` is set correctly
- Check API quotas and limits
- Monitor logs in Render dashboard

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is private and proprietary.