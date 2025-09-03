# Backend Dockerfile for Railway
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

WORKDIR /src

# Copy csproj and restore dependencies
COPY *.csproj ./
RUN dotnet restore

# Copy everything else and build
COPY . ./
RUN dotnet publish -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final

WORKDIR /app

# Copy published app
COPY --from=build /app/publish .

# Expose port (Railway will set PORT environment variable)
EXPOSE 8080

# Set ASP.NET Core to listen on all interfaces
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "Questionnaire.Server.dll"]
WORKDIR /src
COPY ["Questionnaire.Server/Questionnaire.Server.csproj", "Questionnaire.Server/"]
COPY ["questionnaire.client/questionnaire.client.esproj", "questionnaire.client/"]
RUN dotnet restore "./Questionnaire.Server/Questionnaire.Server.csproj"
COPY . .
WORKDIR "/src/Questionnaire.Server"
RUN dotnet build "./Questionnaire.Server.csproj" -c $BUILD_CONFIGURATION -o /app/build

# This stage is used to publish the service project to be copied to the final stage
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./Questionnaire.Server.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# This stage is used in production or when running from VS in regular mode (Default when not using the Debug configuration)
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Questionnaire.Server.dll"]
