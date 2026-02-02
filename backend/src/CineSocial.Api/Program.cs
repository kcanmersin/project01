
using CineSocial.Application;
using CineSocial.Api.Middleware;
using CineSocial.Application.Interfaces;
using CineSocial.Infrastructure;
using CineSocial.Infrastructure.Persistence;
using CineSocial.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using DotNetEnv;

// Load .env file from project root
var projectRoot = System.IO.Path.GetFullPath(System.IO.Path.Combine(Directory.GetCurrentDirectory(), "..", "..", ".."));
var envPath = System.IO.Path.Combine(projectRoot, ".env");
Console.WriteLine($"Looking for .env at: {envPath}");
if (File.Exists(envPath))
{
    Console.WriteLine(".env file found, loading...");
    Env.Load(envPath);
}
else
{
    Console.WriteLine(".env file NOT found!");
}

var dbUrl = Environment.GetEnvironmentVariable("DATABASE_URL");
Console.WriteLine($"DATABASE_URL from env: {(string.IsNullOrEmpty(dbUrl) ? "EMPTY/NULL" : "Found (" + dbUrl.Length + " chars)")}");

var builder = WebApplication.CreateBuilder(args);

// Add environment variables to configuration
if (!string.IsNullOrEmpty(dbUrl))
{
    builder.Configuration["DATABASE_URL"] = dbUrl;
    Console.WriteLine($"Added DATABASE_URL to configuration");
}
else
{
    Console.WriteLine("DATABASE_URL is empty, not adding to configuration");
}

// Add JWT config to configuration
var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET") ?? "cinefeel-super-secret-key-32chars!";
var jwtIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER") ?? "CineFeel";
var jwtAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE") ?? "CineFeel";
builder.Configuration["JWT_SECRET"] = jwtSecret;
builder.Configuration["JWT_ISSUER"] = jwtIssuer;
builder.Configuration["JWT_AUDIENCE"] = jwtAudience;
builder.Configuration["JWT_EXPIRES_HOURS"] = Environment.GetEnvironmentVariable("JWT_EXPIRES_HOURS") ?? "24";

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.CustomSchemaIds(type => type.FullName);
});
builder.Services.AddProblemDetails();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Add JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
        };
    });
builder.Services.AddAuthorization();

// Add Auth Services
builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
builder.Services.AddScoped<IImageStorageService, DatabaseImageStorageService>();

// Add Application (MediatR)
builder.Services.AddApplication();

// Add Infrastructure
builder.Services.AddInfrastructure(builder.Configuration);

// Register DbContext as base DbContext for MediatR handlers
builder.Services.AddScoped<DbContext>(sp => sp.GetRequiredService<CineSocialDbContext>());

// Add Global Exception Handler
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

// Add Health Checks
builder.Services.AddHealthChecks();

var app = builder.Build();

// Apply pending migrations
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<CineSocialDbContext>();
    dbContext.Database.Migrate();
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Global Exception Handler
app.UseExceptionHandler();

// Enable CORS
app.UseCors("AllowFrontend");

app.UseHttpsRedirection();

// Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHealthChecks("/health");
app.MapGet("/", () => "Welcome");

app.Run();

