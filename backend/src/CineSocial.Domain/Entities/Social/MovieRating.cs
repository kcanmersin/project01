using CineSocial.Domain.Common;
using CineSocial.Domain.Entities.Movie;

namespace CineSocial.Domain.Entities.Social;

public class MovieRating : BaseEntity
{
    public Guid UserId { get; set; }
    public Guid MovieId { get; set; }

    /// <summary>
    /// Rating value from 0.0 to 10.0
    /// </summary>
    public decimal Rating { get; set; }

    /// <summary>
    /// Optional review text (max 2000 chars)
    /// </summary>
    public string? Review { get; set; }

    // Navigation properties
    public User.User User { get; set; } = null!;
    public MovieEntity Movie { get; set; } = null!;
}
