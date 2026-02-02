namespace CineSocial.Application.Common.Exceptions;

public class BadRequestException : Exception
{
    public IDictionary<string, string[]>? Errors { get; }

    public BadRequestException() : base("A bad request was made.")
    {
    }

    public BadRequestException(string message) : base(message)
    {
    }

    public BadRequestException(string message, IDictionary<string, string[]> errors) 
        : base(message)
    {
        Errors = errors;
    }

    public BadRequestException(string message, Exception innerException) 
        : base(message, innerException)
    {
    }
}
