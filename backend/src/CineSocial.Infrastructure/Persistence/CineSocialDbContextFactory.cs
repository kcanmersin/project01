using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace CineSocial.Infrastructure.Persistence;

public class CineSocialDbContextFactory : IDesignTimeDbContextFactory<CineSocialDbContext>
{
    public CineSocialDbContext CreateDbContext(string[] args)
    {
        // Try to get connection string from various sources
        var connectionString = args.Length > 0 ? args[0] : null;

        if (string.IsNullOrEmpty(connectionString))
        {
            connectionString = LoadConnectionStringFromEnv();
        }

        if (string.IsNullOrEmpty(connectionString))
        {
            Console.WriteLine($"Current directory: {Directory.GetCurrentDirectory()}");
            Console.WriteLine($"Args: {string.Join(", ", args)}");
            throw new InvalidOperationException(
                "DATABASE_URL not found. Please ensure it's set in your .env file or environment variables.");
        }

        Console.WriteLine($"Using connection string: {connectionString.Substring(0, Math.Min(20, connectionString.Length))}...");

        var optionsBuilder = new DbContextOptionsBuilder<CineSocialDbContext>();
        optionsBuilder.UseNpgsql(connectionString);

        return new CineSocialDbContext(optionsBuilder.Options);
    }

    private static string? LoadConnectionStringFromEnv()
    {
        // First check environment variable
        var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL");
        if (!string.IsNullOrEmpty(connectionString))
        {
            Console.WriteLine($"Loaded from env var, length: {connectionString.Length}");
            return connectionString;
        }

        // Try to load from .env file
        var projectRoot = System.IO.Path.GetFullPath(System.IO.Path.Combine(Directory.GetCurrentDirectory(), "..", "..", ".."));
        var envPath = System.IO.Path.Combine(projectRoot, ".env");

        Console.WriteLine($"Looking for .env at: {envPath}");
        Console.WriteLine($"File exists: {File.Exists(envPath)}");

        if (!File.Exists(envPath))
        {
            return null;
        }

        var lines = File.ReadAllLines(envPath);
        Console.WriteLine($"Read {lines.Length} lines from .env");

        foreach (var line in lines)
        {
            if (string.IsNullOrWhiteSpace(line) || line.TrimStart().StartsWith('#'))
            {
                continue;
            }

            var parts = line.Split('=', 2);
            if (parts.Length == 2 && parts[0].Trim() == "DATABASE_URL")
            {
                var value = parts[1].Trim().Trim('"');
                Console.WriteLine($"Found DATABASE_URL, length after trim: {value.Length}");
                Console.WriteLine($"First 30 chars: {value.Substring(0, Math.Min(30, value.Length))}");
                return value;
            }
        }

        Console.WriteLine("DATABASE_URL not found in .env file");
        return null;
    }
}
