namespace CineSocial.Application.Common;

public class Result<T>
{
    public bool IsSuccess { get; private set; }
    public T? Data { get; private set; }
    public string? Error { get; private set; }
    public int StatusCode { get; private set; }

    private Result(bool isSuccess, T? data, string? error, int statusCode)
    {
        IsSuccess = isSuccess;
        Data = data;
        Error = error;
        StatusCode = statusCode;
    }

    public static Result<T> Success(T data) 
        => new(true, data, null, 200);
    
    public static Result<T> Created(T data) 
        => new(true, data, null, 201);

    public static Result<T> Failure(string error, int statusCode = 400) 
        => new(false, default, error, statusCode);

    public static Result<T> NotFound(string error = "Resource not found") 
        => new(false, default, error, 404);

    public static Result<T> BadRequest(string error) 
        => new(false, default, error, 400);

    public static Result<T> ServerError(string error = "An unexpected error occurred") 
        => new(false, default, error, 500);

    public static Result<T> Forbidden(string error = "Access forbidden") 
        => new(false, default, error, 403);
}

// Non-generic Result for operations that don't return data
public class Result
{
    public bool IsSuccess { get; private set; }
    public string? Error { get; private set; }
    public int StatusCode { get; private set; }

    private Result(bool isSuccess, string? error, int statusCode)
    {
        IsSuccess = isSuccess;
        Error = error;
        StatusCode = statusCode;
    }

    public static Result Success() 
        => new(true, null, 200);
    
    public static Result NoContent() 
        => new(true, null, 204);

    public static Result Failure(string error, int statusCode = 400) 
        => new(false, error, statusCode);

    public static Result NotFound(string error = "Resource not found") 
        => new(false, error, 404);

    public static Result BadRequest(string error) 
        => new(false, error, 400);

    public static Result Forbidden(string error = "Access forbidden") 
        => new(false, error, 403);
}
