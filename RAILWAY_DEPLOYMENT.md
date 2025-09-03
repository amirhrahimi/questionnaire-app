# Railway Deployment Guide

## Overview
This guide explains how to deploy the Questionnaire application to Railway using separate services.

## Architecture
- **Frontend Service**: React app (questionnaire.client) served by Nginx
- **Backend Service**: .NET API (Questionnaire.Server)
- **Database**: Railway PostgreSQL

## Deployment Steps

### 1. Create Railway Project
1. Go to [Railway](https://railway.app)
2. Create a new project
3. Connect your GitHub repository

### 2. Setup Database Service
1. Add a PostgreSQL service to your Railway project
2. Note the connection details (they'll be auto-generated)

### 3. Setup Backend Service
1. Create a new service in Railway
2. Connect to your GitHub repository
3. Set the **Root Directory** to: `Questionnaire.Server`
4. Set the **Build Command** to: `docker build -f Dockerfile.railway -t backend .`
5. Add environment variables:
   ```
   DATABASE_URL=(auto-provided by Railway PostgreSQL)
   JWT_KEY=your_super_secure_jwt_key_here_at_least_32_characters
   JWT_ISSUER=QuestionnaireSurvey
   JWT_AUDIENCE=QuestionnaireSurvey
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   PORT=8080
   ASPNETCORE_ENVIRONMENT=Production
   FRONTEND_URL=https://your-frontend-service.railway.app
   ```

### 4. Setup Frontend Service
1. Create another service in Railway
2. Connect to the same GitHub repository
3. Set the **Root Directory** to: `questionnaire.client`
4. Add environment variables:
   ```
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   VITE_API_BASE_URL=https://your-backend-service.railway.app
   ```

### 5. Configure CORS
Update your backend's CORS configuration to allow requests from your frontend Railway URL.

### 6. Database Migration
After the backend is deployed, you may need to run database migrations:
1. Connect to your backend service terminal in Railway
2. Run: `dotnet ef database update`

## File Structure
```
/
├── questionnaire.client/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── railway.json
│   └── .env.railway
├── Questionnaire.Server/
│   ├── Dockerfile.railway
│   ├── railway.json
│   └── .env.railway
└── (root level files are ignored)
```

## Important Notes
1. Each service is deployed independently
2. Use environment variables to connect services
3. Database migrations need to be run after deployment
4. Monitor logs in Railway dashboard for troubleshooting

## Benefits of This Approach
- ✅ Separate scaling for frontend and backend
- ✅ Independent deployments
- ✅ Better resource utilization
- ✅ Easier debugging and monitoring
- ✅ Follows Railway best practices
