# 📝 Questionnaire App

A modern, full-stack questionnaire application built with .NET 8 and React, featuring comprehensive survey creation, management, and analytics capabilities.

## 🚀 Quick Deploy

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.com)

## ✨ Features

### 🔐 Authentication & Authorization

- **Google OAuth Integration** - Secure login with Google accounts
- **JWT Token Authentication** - Stateless authentication system
- **Role-based Access Control** - Separate admin and user interfaces
- **Fingerprint Tracking** - Enhanced security and analytics

### 📊 Questionnaire Management

- **Create & Edit Questionnaires** - Rich form builder with multiple question types
- **Question Types Support** - Multiple choice, text input, and more
- **Dynamic Question Ordering** - Customizable question sequence
- **Active/Inactive States** - Control questionnaire visibility
- **Real-time Validation** - Client and server-side validation

### 📈 Response Collection & Analytics

- **Response Tracking** - Comprehensive response collection
- **Data Export** - Export responses in various formats
- **Analytics Dashboard** - Visual representation of survey results
- **Response Management** - View, filter, and analyze submissions

### 🌐 Social Features

- **Social Sharing** - Share questionnaires on social platforms
- **QR Code Generation** - Generate QR codes for easy access
- **Custom Share Links** - Optimized social media previews
- **Open Graph Support** - Rich previews on WhatsApp, Facebook, Twitter

### 🎨 User Experience

- **Responsive Design** - Works seamlessly on all devices
- **Material-UI Components** - Modern, accessible interface
- **Dark/Light Mode** - Theme switching capability
- **Progressive Loading** - Lazy loading and code splitting
- **Real-time Updates** - Live data synchronization

## 🏗️ Tech Stack

### Backend (.NET 8)

- **ASP.NET Core Web API** - RESTful API architecture
- **Entity Framework Core** - ORM with PostgreSQL support
- **JWT Authentication** - Secure token-based auth
- **Google OAuth** - Third-party authentication
- **QRCoder** - QR code generation
- **OpenGraph-Net** - Social media metadata

### Frontend (React 19)

- **React 19** - Modern React with latest features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Material-UI (MUI)** - Component library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React OAuth Google** - Google authentication

### Database & Infrastructure

- **PostgreSQL** - Production database
- **Entity Framework Migrations** - Database versioning
- **Docker Support** - Containerized deployment
- **Railway Deployment** - Cloud platform ready
- **Environment Configuration** - Multi-environment support

## 🔧 Local Development

### Prerequisites

- **.NET 8 SDK** or later
- **Node.js 18+** with npm
- **PostgreSQL** (optional, uses in-memory DB for development)
- **Google OAuth Credentials**

### Setup Instructions

1. **Clone the repository:**

```powershell
git clone <repository-url>
cd Questionnaire
```

2. **Backend Setup:**

```powershell
cd Questionnaire.Server
dotnet restore
dotnet run
```

The API will be available at `https://localhost:7154`

3. **Frontend Setup:**

```powershell
cd questionnaire.client
npm install
npm run dev
```

The frontend will be available at `https://localhost:1651`

4. **Google OAuth Configuration:**

   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs
   - Set environment variables (see below)

### Development Database

The application supports both in-memory and PostgreSQL databases:

- **Development**: Uses in-memory database by default
- **Production**: Automatically uses PostgreSQL from `DATABASE_URL`

## 🌐 Environment Variables

### Required Environment Variables

```env
# Authentication
VITE_GOOGLE_CLIENT_ID=your_google_client_id
JWT_SECRET_KEY=your_jwt_secret_key_minimum_32_characters
JWT_ISSUER=QuestionnaireApp
JWT_AUDIENCE=QuestionnaireApp

# Database (Production)
DATABASE_URL=postgresql://username:password@host:port/database

# Application
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:8080
```

### Optional Environment Variables

```env
# Google OAuth (if using server-side validation)
VITE_GOOGLE_CLIENT_SECRET=your_google_client_secret

# Development
VITE_API_BASE_URL=https://localhost:7154
```

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

```powershell
# Build and run all services
docker-compose up --build

# Run in background
docker-compose up -d --build
```

### Individual Container Builds

**Backend:**

```powershell
cd Questionnaire.Server
docker build -t questionnaire-api .
docker run -p 8080:8080 questionnaire-api
```

**Frontend:**

```powershell
cd questionnaire.client
docker build -t questionnaire-client .
docker run -p 80:80 questionnaire-client
```

## 🚀 Deployment Options

### Railway Deployment

1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy using the provided Railway button or manual deployment

### Manual Production Deployment

1. Build the application:

```powershell
# Backend
cd Questionnaire.Server
dotnet publish -c Release -o ./publish

# Frontend
cd questionnaire.client
npm run build
```

2. Configure your web server (nginx, IIS, etc.)
3. Set up SSL certificates
4. Configure environment variables
5. Set up PostgreSQL database
6. Run Entity Framework migrations

## 📚 API Documentation

The API includes Swagger documentation available at `/swagger` when running in development mode.

### Key Endpoints

- `GET /api/questionnaire` - Get active questionnaires
- `POST /api/questionnaire` - Create new questionnaire (Admin)
- `POST /api/questionnaire/{id}/respond` - Submit questionnaire response
- `POST /api/auth/google` - Google OAuth login
- `GET /api/socialshare/qr-code` - Generate QR code
- `GET /api/socialshare/share-questionnaire` - Get shareable link

## 🧪 Testing

Run the test suite:
```powershell
# Backend tests
cd Questionnaire.Server
dotnet test

# Frontend tests
cd questionnaire.client
npm test
```

## � Project Structure

```
├── Questionnaire.Server/          # .NET 8 Web API
│   ├── Controllers/               # API controllers
│   ├── Models/                    # Data models
│   ├── DTOs/                      # Data transfer objects
│   ├── Services/                  # Business logic services
│   ├── Data/                      # Entity Framework context
│   ├── Migrations/                # Database migrations
│   └── Dockerfile                 # Docker configuration
├── questionnaire.client/          # React TypeScript frontend
│   ├── src/
│   │   ├── components/            # React components
│   │   ├── contexts/              # React contexts
│   │   ├── services/              # API services
│   │   ├── hooks/                 # Custom hooks
│   │   └── utils/                 # Utility functions
│   ├── public/                    # Static assets
│   └── Dockerfile                 # Docker configuration
├── sample_data.sql               # Sample database data
├── test-questionnaire.json       # Test questionnaire structure
└── README.md                     # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.txt](LICENSE.txt) file for details.

## 🆘 Support

For support and questions:

- Create an issue in the GitHub repository
- Check the documentation and API endpoints
- Review the sample data and test files for examples

---

Made with ❤️ using .NET 8 and React 19