using System.Text.Json;
using CineSocial.Application.Common.Exceptions;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace CineSocial.Api.Middleware;

public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
    {
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext, 
        Exception exception, 
        CancellationToken cancellationToken)
    {
        _logger.LogError(exception, "An exception occurred: {Message}", exception.Message);

        var (statusCode, title, detail) = exception switch
        {
            ValidationException => (StatusCodes.Status400BadRequest, "Validation Error", "One or more validation errors occurred."),
            NotFoundException notFoundEx => (StatusCodes.Status404NotFound, "Not Found", notFoundEx.Message),
            BadRequestException badRequestEx => (StatusCodes.Status400BadRequest, "Bad Request", badRequestEx.Message),
            ArgumentException argEx => (StatusCodes.Status400BadRequest, "Invalid Argument", argEx.Message),
            _ => (StatusCodes.Status500InternalServerError, "Server Error", "An unexpected error occurred.")
        };

        var problemDetails = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = detail,
            Instance = httpContext.Request.Path
        };

        // Add validation errors if present
        if (exception is ValidationException validationEx)
        {
            problemDetails.Extensions["errors"] = validationEx.Errors;
        }
        else if (exception is BadRequestException { Errors: not null } badRequest)
        {
            problemDetails.Extensions["errors"] = badRequest.Errors;
        }

        httpContext.Response.StatusCode = statusCode;
        httpContext.Response.ContentType = "application/problem+json";

        await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);

        return true;
    }
}
