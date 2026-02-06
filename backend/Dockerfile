# ---- Build Stage ----
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy solution and project files for restore
COPY CineSocial.sln ./
COPY src/CineSocial.Api/CineSocial.Api.csproj src/CineSocial.Api/
COPY src/CineSocial.Application/CineSocial.Application.csproj src/CineSocial.Application/
COPY src/CineSocial.Domain/CineSocial.Domain.csproj src/CineSocial.Domain/
COPY src/CineSocial.Infrastructure/CineSocial.Infrastructure.csproj src/CineSocial.Infrastructure/
COPY src/CineSocial.Tests/CineSocial.Tests.csproj src/CineSocial.Tests/

RUN dotnet restore

# Copy all source and publish
COPY . .
RUN dotnet publish src/CineSocial.Api/CineSocial.Api.csproj -c Release -o /app/publish --no-restore

# ---- Runtime Stage ----
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:5000
ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 5000

ENTRYPOINT ["dotnet", "CineSocial.Api.dll"]
