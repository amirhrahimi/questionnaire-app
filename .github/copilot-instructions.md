# Copilot Instructions for Questionnaire App

## Project Overview
Full-stack questionnaire application with .NET 8 Web API backend and React 19 + TypeScript frontend. Features Google OAuth authentication, role-based access (admin/user), and PostgreSQL/in-memory database support for development and production.

## Architecture & Key Patterns

### Project Structure
- **Backend**: `Questionnaire.Server/` - .NET 8 Web API with Entity Framework Core
- **Frontend**: `questionnaire.client/` - React 19 + TypeScript with Vite and Material-UI
- **Database**: PostgreSQL for production, in-memory for development (configurable in `Program.cs`)

### Authentication Flow
- Google OAuth integration via `@react-oauth/google` on frontend
- JWT tokens with custom claims (`IsAdmin` for role-based authorization)
- Custom `[AdminRequired]` attribute for controller actions in `Attributes/AdminRequiredAttribute.cs`
- AuthContext pattern for React state management

### Database Patterns
- Entity Framework Core with cascade delete relationships
- GUID primary keys for questionnaires (`QuestionnaireDbContext.cs`)
- Polymorphic question types (SingleChoice=1, MultipleChoice=2, Descriptive=3)
- Fingerprint tracking for analytics and security

### Component Organization
```
src/components/
├── admin/     # Admin-only components
├── auth/      # Authentication components  
├── common/    # Shared components
├── layout/    # Layout components
└── public/    # Public-facing components
```

## Development Workflows

### Local Development Commands
```powershell
# Backend (from Questionnaire.Server/)
dotnet restore
dotnet run  # Runs on https://localhost:7154

# Frontend (from questionnaire.client/)
npm install
npm run dev  # Runs on https://localhost:1651
```

### Environment Configuration
- Development uses in-memory database by default
- Production requires `DATABASE_URL` environment variable for PostgreSQL
- Railway deployment with automatic SSL certificate handling
- JWT configuration via `Jwt` section in appsettings or environment variables

### Database Management
- EF migrations in `Migrations/` folder
- Railway connection string conversion in `Program.cs` (postgres:// format)
- Sample data in `sample_data.sql` for testing

## Project-Specific Conventions

### TypeScript Patterns
- Shared types in `src/types.ts` with const assertions (`QuestionType`)
- Service layer pattern in `src/services/` for API calls
- Custom hooks in `src/hooks/` for reusable logic
- Barrel exports via `index.ts` files for clean imports

### .NET Patterns
- DTOs in separate folder for API contracts (`DTOs/`)
- Service injection for `IJwtService` and `IGoogleOAuthService`
- Custom attributes for authorization (`AdminRequiredAttribute`)
- Health check endpoint at `/health` for Railway deployment

### Routing & Navigation
- React Router v7 for frontend routing
- API controllers use conventional routing (`[Route("api/[controller]")]`)
- Fallback to `index.html` for SPA support
- CORS configured for local development between ports 1651 and 7154

## Integration Points

### Google OAuth Setup
- Requires `VITE_GOOGLE_CLIENT_ID` environment variable
- Server-side validation available with `VITE_GOOGLE_CLIENT_SECRET`
- JWT claims include user info and admin status

### Social Sharing Features
- QR code generation via `QRCoder` library
- OpenGraph metadata support for social previews
- React Share components for social media integration

### Deployment Considerations
- Railway-specific configurations in `railway.json` files
- Docker support with multi-stage builds
- HTTPS redirection only in development (Railway handles SSL)
- Port configuration via `PORT` environment variable

## Common Tasks

### Adding New Question Types
1. Update `QuestionType` enum in `src/types.ts`
2. Add case handling in question rendering components
3. Update database models if needed with new migration

### Adding Admin Features
1. Create components in `src/components/admin/`
2. Use `[AdminRequired]` attribute on API controllers
3. Check `isAdmin` in AuthContext for frontend guards

### Database Changes
1. Update models in `Models/` folder
2. Run `dotnet ef migrations add MigrationName`
3. Update DTOs if API contracts change
4. Test with sample data from `sample_data.sql`

## Key Files to Reference
- `Program.cs` - Application configuration and Railway deployment setup
- `AuthContext.ts` - Authentication state management
- `QuestionnaireDbContext.cs` - Database configuration and relationships
- `types.ts` - Shared TypeScript interfaces and enums
- `vite.config.ts` - Frontend build configuration with HTTPS certificates