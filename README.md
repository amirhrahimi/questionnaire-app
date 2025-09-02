# Questionnaire App

A full-stack questionnaire application built with .NET Core API and React frontend.

## 🚀 Quick Deploy to Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template/m8qkNe)

## 🏗️ Tech Stack

- **Backend**: .NET 9.0 Web API
- **Frontend**: React 19 + TypeScript + Vite
- **Database**: Entity Framework (In-Memory for demo)
- **Authentication**: JWT + Google OAuth
- **Styling**: Material-UI

## 🔧 Local Development

### Prerequisites

- .NET 9.0 SDK
- Node.js 18+
- Google OAuth credentials

### Setup

1. Clone the repository:

```bash
git clone https://github.com/amirhrahimi/questionnaire-app.git
cd questionnaire-app
```

2. Set up Google OAuth:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create OAuth 2.0 credentials
   - Copy `questionnaire.client/.env.example` to `questionnaire.client/.env`
   - Add your Google credentials

3. Run the application:

```bash
# Backend
cd Questionnaire.Server
dotnet run

# Frontend (in another terminal)
cd questionnaire.client
npm install
npm run dev
```

## 🌐 Environment Variables

Set these in Railway or your hosting platform:

```env
ASPNETCORE_ENVIRONMENT=Production
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GOOGLE_CLIENT_SECRET=your_google_client_secret
JWT_SECRET_KEY=your_jwt_secret_key
JWT_ISSUER=QuestionnaireApp
JWT_AUDIENCE=QuestionnaireApp
```

## 📝 Features

- User authentication with Google OAuth
- Create and manage questionnaires (Admin)
- Answer questionnaires (Users)
- Role-based access control
- Responsive design