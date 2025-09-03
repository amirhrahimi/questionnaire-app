# Railway Deployment Guide - FIXED

## ✅ Issues Fixed
- Removed conflicting root `railway.json` and Dockerfiles
- Each service now has its own configuration
- Backend includes fallback database configuration
- Proper directory structure for Railway

## Architecture
- **Frontend Service**: React app (questionnaire.client) served by Nginx
- **Backend Service**: .NET API (Questionnaire.Server)  
- **Database**: Railway PostgreSQL

## Railway Setup Instructions

### 1. Create Railway Project
1. Go to [Railway](https://railway.app)
2. Create a new project
3. Connect your GitHub repository

### 2. Setup Database Service FIRST
1. Add a PostgreSQL service to your Railway project
2. Railway will auto-generate the `DATABASE_URL` environment variable
3. Note the database connection details

### 3. Setup Backend Service

1. **Create a new service** in Railway
2. **Connect to your GitHub repository**
3. **IMPORTANT**: Set the **Root Directory** to: `Questionnaire.Server`
4. Railway will automatically use `Dockerfile.railway` from that directory
5. **Add environment variables:**

```bash
# Required - Auto-provided by Railway PostgreSQL service
DATABASE_URL=(will be auto-linked from PostgreSQL service)

# Required - JWT Configuration  
JWT_KEY=your_super_secure_jwt_key_here_at_least_32_characters
JWT_ISSUER=QuestionnaireSurvey
JWT_AUDIENCE=QuestionnaireSurvey

# Required - Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Railway automatically sets these
PORT=8080
ASPNETCORE_ENVIRONMENT=Production

# Optional - CORS (use frontend URL once deployed)
FRONTEND_URL=https://your-frontend-service.railway.app
```

### 4. Setup Frontend Service

1. **Create another service** in Railway
2. **Connect to the same GitHub repository**
3. **IMPORTANT**: Set the **Root Directory** to: `questionnaire.client`
4. Railway will automatically use `Dockerfile` from that directory
5. **Add environment variables:**

```bash
# Required - Google OAuth (same as backend)
VITE_GOOGLE_CLIENT_ID=your_google_client_id

# Required - Backend API URL (use backend service URL)
VITE_API_BASE_URL=https://your-backend-service.railway.app
```

### 5. Link Database to Backend
1. In Railway dashboard, go to your backend service
2. Go to "Variables" tab
3. Link the PostgreSQL service (Railway will auto-set DATABASE_URL)

### 6. Update CORS After Deployment
Once both services are deployed:
1. Copy the frontend service URL
2. Update the backend's `FRONTEND_URL` environment variable
3. Backend will automatically restart

## File Structure ✅
```
/
├── questionnaire.client/          <- Frontend root directory
│   ├── Dockerfile                 <- Frontend Docker config
│   ├── railway.json              <- Frontend Railway config
│   └── (React source files...)
├── Questionnaire.Server/          <- Backend root directory  
│   ├── Dockerfile.railway         <- Backend Docker config
│   ├── railway.json              <- Backend Railway config
│   └── (C# source files...)
└── (root files are now ignored)
```

## Important Notes ⚠️

1. **Root Directory Setting**: This is CRITICAL - each service must have the correct root directory set in Railway
2. **Database Connection**: Backend has fallback to in-memory DB if no DATABASE_URL
3. **Environment Variables**: Set these in Railway dashboard, not in code
4. **HTTPS**: Railway automatically provides HTTPS - no certificates needed
5. **Migrations**: Backend will auto-migrate database on startup (if PostgreSQL connected)

## Troubleshooting

### Backend Build Fails
- ✅ **FIXED**: Removed conflicting root Dockerfiles
- Ensure Root Directory is set to `Questionnaire.Server`
- Check that `Dockerfile.railway` exists in backend directory

### Database Connection Issues  
- ✅ **FIXED**: Added fallback in-memory database
- Backend will start even without DATABASE_URL
- Connect PostgreSQL service in Railway dashboard

### Frontend Build Fails
- Ensure Root Directory is set to `questionnaire.client`
- Check that all environment variables are set
- Verify `Dockerfile` exists in frontend directory

## Benefits of This Approach ✅
- ✅ **Independent deployments** - Each service deploys separately
- ✅ **Independent scaling** - Scale frontend/backend independently  
- ✅ **Better resource usage** - Optimal resources per service
- ✅ **Easier debugging** - Separate logs and monitoring
- ✅ **Railway best practices** - Follows recommended patterns
