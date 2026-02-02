using CineSocial.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using CineSocial.Application.Interfaces;
using Microsoft.Extensions.DependencyInjection;

namespace CineSocial.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // Try to get connection string from configuration first, then fallback to environment variable
        var connectionString = configuration["DATABASE_URL"] ?? Environment.GetEnvironmentVariable("DATABASE_URL");

        Console.WriteLine($"[DependencyInjection] DATABASE_URL from config: {configuration["DATABASE_URL"]?.Length ?? 0} chars");
        Console.WriteLine($"[DependencyInjection] DATABASE_URL from env: {Environment.GetEnvironmentVariable("DATABASE_URL")?.Length ?? 0} chars");
        Console.WriteLine($"[DependencyInjection] Final connectionString: {connectionString?.Length ?? 0} chars");

        // Convert PostgreSQL URI to Npgsql connection string if needed
        if (!string.IsNullOrEmpty(connectionString) && connectionString.StartsWith("postgresql://"))
        {
            connectionString = ConvertPostgresUriToConnectionString(connectionString);
            Console.WriteLine($"[DependencyInjection] Converted URI to connection string: {connectionString?.Length ?? 0} chars");
        }

        // Only register DbContext if we have a valid connection string
        // For design-time operations (like migrations), the IDesignTimeDbContextFactory will handle DbContext creation
        if (!string.IsNullOrEmpty(connectionString))
        {
            Console.WriteLine($"[DependencyInjection] Registering DbContext with connection string");
            services.AddDbContext<CineSocialDbContext>(options =>
                options.UseNpgsql(connectionString));
                
            services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<CineSocialDbContext>());
        }
        else
        {
            Console.WriteLine($"[DependencyInjection] WARNING: No connection string, DbContext NOT registered!");
        }

        return services;
    }

    private static string ConvertPostgresUriToConnectionString(string uri)
    {
        var parsedUri = new Uri(uri);
        var userInfo = parsedUri.UserInfo.Split(':');
        var username = userInfo.Length > 0 ? userInfo[0] : "";
        var password = userInfo.Length > 1 ? userInfo[1] : "";
        var database = parsedUri.AbsolutePath.TrimStart('/').Split('?')[0]; // Remove query params
        var port = parsedUri.Port > 0 ? parsedUri.Port : 5432; // Default to 5432 if not specified

        var connectionString = $"Host={parsedUri.Host};Port={port};Database={database};Username={username};Password={password};SSL Mode=Require;Trust Server Certificate=true";
        Console.WriteLine($"[ConvertUri] Host={parsedUri.Host}, Port={port}, DB={database}");
        return connectionString;
    }
}
